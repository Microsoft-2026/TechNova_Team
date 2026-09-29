# How I Integrated Hindsight Memory into a LangGraph Agent Architecture

Building a sales assistant that can answer questions from documents is relatively straightforward. Building one that can remember what happened in previous deals, understand why those outcomes happened, and use that experience in a new situation is a different problem.

My first approach focused mainly on retrieval. The agent could search sales documents, retrieve relevant sections, and generate an answer. That worked for questions such as “What is our discount policy?” but it was much less useful for questions such as “A customer with similar concerns rejected our proposal before. What should I watch for this time?”

The missing piece was experience.

That led me to combine a LangGraph-based agent workflow with Hindsight memory so that the system could separate static business knowledge from lessons learned from completed deals.

<!-- IMAGE 1: Architecture diagram showing React frontend → API gateway → LangGraph agent → PostgreSQL / pgvector / Hindsight -->

## The problem I was trying to solve

Sales information usually exists in several places:

- CRM records
- Meeting and call transcripts
- Email conversations
- Pricing documents
- Product documentation
- Sales playbooks
- Notes written by representatives

A normal RAG pipeline can search these sources effectively. However, searching the original material does not automatically create organizational experience.

For example, imagine three previous deals:

- Deal A had a price objection and was lost after a discount.
- Deal B had a similar price objection and was won after changing the package.
- Deal C had a price objection but was lost because implementation took too long.

A new representative does not simply need the text from those three deals. They need the pattern behind the outcomes.

My goal was therefore to make the agent answer two different questions:

**Knowledge:** What information does the company have?

**Experience:** What happened in similar situations before?

## Designing the agent workflow

I used LangGraph to represent the agent as a sequence of explicit steps instead of putting the entire process inside one large prompt.

The workflow became:

**Analyze → Retrieve → Recall → Reflect → Compare → Recommend → Simulate → Retain**

Each stage has a different responsibility.

### Analyze

The agent first converts the current deal into structured signals such as:

- industry
- product
- deal stage
- competitor
- customer requirements
- objections
- implementation concerns
- commercial constraints

This gives later steps a consistent representation of the situation.

### Retrieve

The retrieval layer searches the company's current documents.

This is where traditional RAG remains useful. Pricing rules, product capabilities, approval policies, and implementation documentation are still best treated as authoritative reference material.

### Recall

The recall stage asks Hindsight for relevant experiences from previously completed deals.

Instead of searching every transcript, I wanted memory to contain meaningful lessons from past outcomes.

### Reflect

After recalling past experiences, the agent reflects on what those experiences actually mean for the current deal.

Rather than treating every recalled memory as equally useful, the reflection step examines the context, outcome, and lesson from each experience. It asks questions such as:

- What pattern appears across the recalled deals?
- Which experiences are genuinely relevant to the current situation?
- What worked before, and under what conditions?
- Are there conflicting outcomes that should change the recommendation?

This creates a **Reflect → Recall → Retain** learning loop instead of treating memory as simple search results.

### Compare

After reflection, the useful experiences are compared with the current deal.

The agent looks for common patterns rather than assuming that the most similar piece of text is automatically the correct answer.

### Recommend

The agent combines document evidence with historical experience and produces a suggested next action.

### Simulate

For situations involving multiple possible strategies, the agent can compare alternatives such as changing the package, changing contract duration, or offering a discount.

### Store

After a deal is completed, the useful lesson is converted into a compact memory record for future cases.

## Why LangGraph helped

I could have implemented everything inside one large LLM call, but that made the system difficult to inspect.

With LangGraph, every stage has a defined state.

A simplified state object looked conceptually like this:

```python
class DealState(TypedDict):
    deal_id: str
    deal_context: dict
    retrieved_documents: list
    recalled_experiences: list
    analysis: dict
    recommendation: dict
    simulation: dict
```

The important part was not the exact structure. It was making the intermediate results visible.

If a recommendation looked wrong, I could inspect whether the problem came from document retrieval, memory recall, analysis, or the final reasoning step.

That made debugging much easier than trying to understand one huge model response.

## Separating RAG from memory

One of the most important architectural decisions was not to treat Hindsight as a replacement for the knowledge base.

I kept the responsibilities separate.

| Component | Main responsibility |
|---|---|
| PostgreSQL | Structured deal information |
| pgvector | Semantic document retrieval |
| Hindsight | Long-term experience |
| LangGraph | Agent workflow and state |
| LLM | Reasoning and synthesis |
| FastAPI | AI-service API |

This separation also made the system easier to change later.

If I replaced the vector database, the agent workflow would not need to change. If I changed the memory provider, the business logic would remain mostly the same.

## Turning completed deals into memories

I initially considered storing complete transcripts as memory.

That created too much noise.

A transcript contains useful information, but it also contains greetings, repeated questions, irrelevant discussion, and details that will never help another deal.

Instead, I created a small lesson from the completed deal.

A memory record could contain:

```text
Situation:
Manufacturing customer evaluating a new analytics package.

Objection:
Customer considered the initial package too expensive.

Action:
The proposal was changed to a phased implementation.

Outcome:
Customer accepted the revised proposal.

Lesson:
For similar implementation and pricing concerns, restructuring the package
may be more effective than immediately reducing price.
```

The idea was simple: retain the experience, not every word that produced it.

<!-- IMAGE 2: Screenshot or diagram showing a completed deal being converted into a Hindsight memory -->

## Putting a single interface around memory

I did not want individual LangGraph nodes calling Hindsight directly.

Instead, I created a memory service.

```python
class MemoryService:
    def __init__(self, client):
        self.client = client

    async def remember(self, company_id, lesson):
        return await self.client.retain(
            bank_id=f"company-{company_id}",
            content=lesson
        )

    async def recall(self, company_id, query):
        return await self.client.recall(
            bank_id=f"company-{company_id}",
            query=query,
            limit=5
        )
```

This small abstraction gave me one place to handle memory operations.

It also helped with testing because I could replace the real memory client with a mock implementation.

## Making recall more meaningful

A major mistake would be to define similarity only by matching words.

Suppose the current deal is:

> A large manufacturing customer is worried about implementation time and total cost.

A useful previous experience might use completely different wording but have the same underlying situation.

So I built the recall query from structured information as well as natural-language context.

For example:

```python
query = build_context(
    industry=deal.industry,
    product=deal.product,
    competitor=deal.competitor,
    objections=analysis.objections,
    requirements=analysis.requirements
)

experiences = await memory.recall(
    company_id=deal.company_id,
    query=query
)
```

The objective was not to find the same sentence.

The objective was to find the same type of situation.

## Adding an evidence threshold

Another issue appeared during testing.

Memory systems can usually return something even when the match is weak.

That creates a dangerous failure mode: the agent receives an unrelated historical example and turns it into a confident recommendation.

I therefore added a relevance threshold.

Conceptually:

```python
relevant = [
    item for item in experiences
    if item.relevance >= MIN_RELEVANCE
]
```

If nothing passed the threshold, the agent did not pretend that it had a useful historical example.

Instead, it returned a response such as:

> No sufficiently relevant previous deal was found.

This was an important design choice because absence of experience is itself useful information.

## Making recommendations explainable

I did not want the agent to simply produce:

> “Change the package.”

The representative needs to know why.

So the recommendation included supporting experiences and the pattern found across them.

A simplified output looked like:

```python
{
    "recommendation": "Try a phased package before offering a discount.",
    "reason": "Similar deals succeeded after restructuring the offer.",
    "supporting_deals": ["D104", "D117", "D121"],
    "confidence": "medium"
}
```

This gave the interface enough information to display a “Why?” section.

The user could then inspect the deals behind the recommendation instead of treating the model as an unquestionable authority.

## What the first version got wrong

The first version had three problems.

### 1. Too much information went into memory

Storing complete conversations made recall noisy.

The solution was to retain distilled lessons from completed deals.

### 2. Similar did not always mean relevant

A deal from the same industry could still be a poor comparison if the product, objection, or buying situation was completely different.

The solution was to combine structured context with semantic recall and apply a relevance threshold.

### 3. The model could sound confident without enough evidence

A fluent explanation is not proof that the underlying comparison is valid.

The solution was to require supporting deal references and expose them to the user.

## What the final workflow looked like

The final architecture followed this pattern:

```text
Current Deal
     |
     v
Analyze Context
     |
     +-------> Document Retrieval
     |              |
     |              v
     |        Current Knowledge
     |
     +-------> Hindsight Recall
                    |
                    v
             Past Experiences
                    |
                    v
                 Compare
                    |
                    v
              Recommendation
                    |
              +-----+-----+
              |           |
              v           v
          Explain      Simulate
              |
              v
           User Action
              |
              v
          Deal Outcome
              |
              v
        Retain New Lesson
```

This created a feedback loop.

The agent used previous outcomes to help with the current deal, and the outcome of the current deal could later become another experience.

## What I learned

The biggest lesson was that an agent does not become useful simply by giving an LLM access to more documents.

The system needs to understand the difference between information and experience.

Documents can tell the agent what the company officially says.

Memory can tell it what happened when people applied those ideas in real situations.

LangGraph gave me a practical way to make those operations explicit and inspectable, while the memory layer provided continuity between otherwise independent deals.

The other lesson was that memory quality matters more than memory quantity. Reflection is what helps turn recalled experiences into useful, context-aware lessons rather than blindly reusing past examples. A small collection of well-formed experiences can be more useful than thousands of unfiltered transcripts.

## Final architecture

The final system combined:

1. **FastAPI** for the AI service.
2. **LangGraph** for the agent workflow.
3. **PostgreSQL** for structured application data.
4. **pgvector** for document retrieval.
5. **Hindsight** for long-term deal experience.
6. **An LLM** for analysis, comparison, recommendation, and simulation.
7. **A dedicated MemoryService** so memory operations stayed behind one interface.

A key part of the design was the **Reflect → Recall → Retain** loop: recall relevant past experiences, reflect on what they mean in the current context, and retain the useful lesson so it can improve future decisions.

The result was not just a chatbot that could search a sales database.

It was a workflow designed to accumulate experience over time.

That distinction changed how I thought about building agentic systems: retrieval gives an agent access to information, but structured memory gives it a way to learn from what happened before.

If you are building an agent that needs continuity across interactions, the important question is not only “What should the model retrieve?” but also “What should the system remember after the interaction is over?”
