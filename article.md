# Why Vector Search Wasn't Enough for Deal Intelligence

The first version of my deal assistant answered every question correctly and helped with almost none of them. It could quote our pricing policy, summarize a call transcript, and find the playbook page on discounting. Then a rep asked, "We've hit this exact pricing objection before. What did we do?" and it returned a paragraph from a pricing guide.

That was the moment I stopped treating this as a retrieval problem.

<!-- IMAGE 1: Screenshot of the Deal Memory page showing "Recall Similar Deals" with similar-deal cards and outcome badges -->

## What I built

The Deal Intelligence Agent sits on top of a company's sales data. It doesn't replace the CRM; it reads what's already there (deal records, call and meeting transcripts, email threads, playbooks, pricing docs) and tries to answer the questions a rep actually has before the next call:

- What is this customer really worried about?
- Have we seen this before, and how did it end?
- What should I do next, and why?
- What happens if I offer a discount versus a redesigned package?

The stack is deliberately boring. A React and TypeScript front end talks to a Node.js/Express gateway that owns auth, CRUD, and uploads. Behind it is a FastAPI service running a LangGraph agent. PostgreSQL holds the structured data, pgvector holds document embeddings, and a Groq-hosted model does the reasoning. Everything about *experience* goes through [Hindsight agent memory](https://github.com/vectorize-io/hindsight).

The agent loop is seven steps: **Understand → Retrieve → Recall → Reflect → Recommend → Simulate → Retain.**

The interesting part is that only one of those steps is a search problem.

## Two kinds of "what do we know?"

Retrieval-augmented generation is good at one question: *what do our documents say?* I built that first, on pgvector, with chunking, top-k retrieval, and cited answers. It works, and it stays in the system as the knowledge base.

But a sales team's most valuable knowledge isn't in the documents. It's in the outcomes. Consider what a closed deal actually contains:

- A pricing objection in the second meeting
- A competitor mentioned on a call
- A proposal rewritten as a different package
- A win, or a loss at the approval stage, for a reason that lives in someone's head

A vector index over those artifacts gives you *text that resembles your query*. It doesn't give you *the lesson*. Two deals can have nearly identical objection language and opposite outcomes, and cosine similarity has no idea which one to show first, or why the difference mattered.

So I split knowledge into two systems with different jobs:

| | Knowledge (RAG) | Experience (Hindsight) |
|---|---|---|
| Question | What does our material say? | What happened last time, and why? |
| Unit | Document chunk | Deal outcome plus its lesson |
| Written | On upload | On deal closure |
| Failure mode | Stale doc | Wrong analogy |

Learning how the second one fails is most of what I have to say.

## Retain: the lesson, not the transcript

The first design decision that mattered was what to store. My initial instinct was to push every transcript into memory and let recall sort it out. That gave me a big, noisy bag of text, which is just RAG with a different name.

Instead, retention happens at one moment: when a deal is closed. `POST /deals/:id/close` marks it won or lost and triggers a retain call with a distilled record: the objection, the strategy, the approach, the reason for the outcome, the competitor, and the stage where it was lost.

All Hindsight access goes through a single `MemoryService`. I made that a hard rule early on, because I wanted memory to be swappable, mockable in tests, and observable.

```python
# ai-service/app/services/memory_service.py
class MemoryService:
    def __init__(self, client, telemetry):
        self._client = client
        self._telemetry = telemetry

    async def retain_outcome(self, company_id: str, outcome: DealOutcome) -> None:
        with self._telemetry.timed("retain", deal_id=outcome.deal_id):
            await self._client.retain(
                bank_id=f"company-{company_id}",
                content=outcome.to_lesson_text(),  # objection, strategy, reason, competitor, stage_lost
                context=f"{outcome.industry} · {outcome.product} · {outcome.result}",
            )
```

Two things to notice. First, memory is scoped per company, so tenant isolation isn't something I have to remember to add to a query filter. Second, `to_lesson_text()` writes a short narrative ("Pricing objection at the negotiation stage; redesigned the package instead of discounting; won"), not a dump. Hindsight's job is to organize and connect these; my job is to make sure what goes in is worth connecting.

<!-- IMAGE 2: Screenshot of the memory event log (retain / recall / reflect calls with latency) from the MemoryEvent table -->

## Recall: similarity is more than embeddings

The second decision was what "similar" means. A deal is similar to another when the *situation* matches: industry, deal size, product, competitors, and above all the objections and requirements. Not when the words overlap.

So recall is a combination. Structured filters narrow the candidates (industry, size band, product), and semantic matching over objections and requirements ranks them. Hindsight handles the recall side over retained lessons; the structured part comes from the deal record.

```python
# ai-service/app/agent/nodes/recall.py
async def recall_node(state: DealState, memory: MemoryService) -> DealState:
    query = build_situation_query(
        objections=state.analysis.objections,
        requirements=state.analysis.requirements,
        competitor=state.deal.competitor,
        industry=state.deal.industry,
    )
    hits = await memory.recall_similar(state.deal.company_id, query, limit=3)
    state.similar_deals = [h for h in hits if h.relevance >= RELEVANCE_FLOOR]
    return state
```

That `RELEVANCE_FLOOR` line is the most important line in the file, and I'll come back to it.

## Reflect: turning three hits into one argument

Recall gives you neighbors. It doesn't tell a rep what to do with them. That's what reflect is for: comparing what worked, what failed, and why, then producing a short synthesis the rep can read in ten seconds.

I treat reflect output as data, not prose. Every LLM output is validated against a Pydantic schema, retried once on failure, and run at temperature 0.3 or lower.

```python
# ai-service/app/schemas/reflection.py
class Reflection(BaseModel):
    pattern: str                      # what similar deals had in common
    what_worked: list[str]
    what_failed: list[str]
    supporting_deal_ids: list[str] = Field(min_length=1)
    confidence: Literal["low", "medium", "high"]
```

`supporting_deal_ids` with `min_length=1` is a small trick with a big effect: a reflection with no cited deal fails validation. The model can't hand me an unsupported opinion. Every suggestion in the UI has a "Why?" expander that lists exactly these deals.

## The behavior that changed

Here's the same situation before and after adding Hindsight-backed recall and reflect. The deal is a manufacturing account in negotiation, with concerns about both price and implementation time.

**RAG only:**

> *Rep:* The customer is pushing back on price and implementation. What should I do?
> *Agent:* Per the pricing guide, discounts up to 10% require manager approval. The implementation guide lists a standard onboarding timeline of…

**With Recall and Reflect:**

> *Agent:* Three completed deals had this same combination of price and implementation concerns. Two were lost after discounting without changing the offer. One was won after the package was restructured to a phased rollout. **Suggested next action:** propose a phased package before offering a discount. *Why?* Deals #A, #B, #C. *Confidence: medium (3 similar deals).*

The second answer isn't smarter. It's answering a different question, using memory that didn't exist in the first system.

The what-if simulator builds on this. A rep sets three levers, discount, contract duration, and package, and the agent compares the scenarios against the recalled patterns. Every output is labelled "est." because it's derived from a handful of historical deals, not a forecast. I didn't want the UI to imply a precision the data can't support.

<!-- IMAGE 3: Screenshot of the Simulation page with the scenario comparison table and "est." labels -->

## What went wrong

**Memory returns something even when it shouldn't.** Recall always gives you *nearest* neighbors, and nearest is not the same as *near*. My early versions happily reflected on a deal from a different industry, with a different objection, because it was the closest thing available. The reflections read fluently and were wrong.

That's what `RELEVANCE_FLOOR` is for. If nothing clears it, the agent stops and says so:

> "No sufficiently similar deal found."

It then shows what evidence it does have and asks the rep for more context. I'd rather ship an assistant that admits it has no experience with a situation than one that improvises an analogy.

**Retention quality is the ceiling.** Lessons distilled from a vague close reason ("customer went another way") are worthless. The close flow now requires a structured reason, which reps found mildly annoying and which made every later recall better.

**Building against an API you haven't verified.** I wrote `MemoryService` before I'd confirmed every signature in the [Hindsight docs](https://hindsight.vectorize.io/), and I kept a mock implementation in parallel. That's the one place the single-door rule saved me directly: when a signature differed from what I'd assumed, one file changed.

## Lessons

1. **Split knowledge from experience.** Documents answer "what do we say?" Outcomes answer "what happened?" They need different storage and different failure handling.
2. **Store lessons, not logs.** [Agent memory](https://vectorize.io/what-is-agent-memory) is only as good as the distilled fact you hand it. Decide what a completed unit of experience looks like and write that.
3. **Put a floor under recall.** Nearest-neighbor search always answers. Build the "I don't know" path deliberately, and make it the default when evidence is thin.
4. **Make citations a schema constraint.** If a reflection can't validate without supporting evidence, you don't need to hope the model behaves.
5. **Route memory through one door.** A single service made testing with a mock trivial, kept tenant scoping in one place, and gave me a telemetry log of every retain, recall, and reflect call.

A CRM records the deal. Hindsight is what let it remember how the last hundred ended, and that turned out to be the part of the system reps actually opened.

If you want to try the memory layer yourself, the [Hindsight GitHub repository](https://github.com/vectorize-io/hindsight) is the place to start.
