# How I Built a Deterministic Risk Engine on Top of Unstructured Memory

*A Deal Intelligence Agent that connects transcript intelligence, institutional memory, risk analysis, recommendations, and what-if simulation.*

Most AI agents are good at reading conversations and finding relevant information. The harder question is how to turn that unstructured information into a consistent, explainable, and repeatable risk decision. That was the problem I wanted to solve with the Deal Intelligence Agent.

The system combines CRM information, sales transcripts, retrieval, and historical memory. The key architectural decision is to separate understanding from decision-making: the intelligence layer extracts and organizes evidence, while the risk layer applies explicit rules and produces an explainable result.

## 1. The Deal Intelligence Loop

The prototype is organized around a continuous deal-intelligence loop: **Understand → Retrieve → Recall → Reflect → Recommend → Simulate → Retain**. This allows the system to move from raw customer interactions to actionable sales intelligence.

## 2. Understanding the Customer Conversation

The first step is transcript intelligence. Customer call recordings, sales meeting notes, or chat logs can be ingested and processed. The pipeline shown in the prototype moves through text and dialogue parsing, intent and sentiment extraction, organizational knowledge grounding, memory recall and synthesis, and finally an intelligence-ready state.

## 3. Turning Unstructured Memory into Institutional Knowledge

Sales information is rarely stored in one clean format. Important evidence can exist in transcripts, CRM updates, meeting notes, customer conversations, and previous deal outcomes. The Deal Memory layer connects the current opportunity with relevant historical experiences.

The memory architecture follows three stages: **Recall** similar historical deals, **Reflect** on why those deals won or lost, and **Retain** the resulting institutional wisdom. In the prototype, the current opportunity is compared with historical deal patterns so that past outcomes become supporting context rather than isolated records.

## 4. Building the Deterministic Risk Engine

Memory should provide context, but it should not be responsible for making the final risk decision. The LLM or intelligence layer is useful for understanding messy conversations and extracting structured evidence. Once those signals are available, the deterministic risk engine can apply predefined rules, weights, and thresholds.

This separation gives the system three important properties: **consistency**, because the same evidence follows the same rules; **explainability**, because the result can be traced to contributing signals; and **reproducibility**, because the calculation does not depend on an LLM producing the same answer twice.

## 5. Risk Is More Than a Number

A risk score by itself is not enough for a salesperson. The useful output is the combination of risk level, contributing signals, historical evidence, and recommended action. The prototype's Risk Analysis view makes the reasoning visible through feature attribution and observable interaction evidence.

This approach keeps the decision grounded in evidence. Instead of simply saying that a deal is risky, the system can show which factors contributed to the assessment and give the sales team a concrete area to investigate or address.

## 6. Moving from Risk Detection to What-If Decisions

The system also includes a Strategic What-If Decision Lab. This allows commercial levers such as discount and contract duration to be adjusted and a scenario to be simulated against the trained model.

The prototype explicitly treats these simulations as estimates based on historical associations. That distinction is important: historical patterns can inform a scenario, but they do not automatically establish a causal effect.

## 7. Closing the Learning Loop

The final part of the architecture is retention. A deal does not end when the risk assessment is produced. Its eventual outcome becomes another piece of organizational experience. The loop therefore becomes: **Deal → Memory + Evidence → Risk Assessment → Recommended Action → Deal Outcome → Retain Outcome**.

If a deal closes, stalls, or is lost, that outcome can become future memory. Over time, the memory layer contains not only conversations, but also what happened afterward. This makes future recall more contextual while keeping the risk calculation itself explicit and explainable.

## 8. What I Learned

- Memory and decision-making should be separated.
- LLMs are useful for extracting evidence from unstructured sales conversations.
- Deterministic rules make risk decisions easier to trace and explain.
- Historical memory adds context but should not be treated as a guaranteed prediction.
- The most useful risk output explains why the result occurred and what action can address it.

## Conclusion

The goal of the Deal Intelligence Agent is not simply to build an agent that remembers more sales conversations. It is to connect what is happening now with what happened before, identify the evidence that matters, apply explicit decision rules, and turn that reasoning into the next useful action.
