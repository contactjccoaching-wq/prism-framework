# PRISM Architecture — Deep Dive

## The Three Layers

```
┌─────────────────────────────────────────────────┐
│                  INPUT LAYER                    │
│  Prompt P  ──→  [Preprocessor / Context Builder] │
└───────────────────────┬─────────────────────────┘
                        │  Same prompt × N
                        ▼
┌─────────────────────────────────────────────────┐
│               SAMPLING LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Agent₁   │  │ Agent₂   │  │ Agentₙ   │      │
│  │ temp=0.9 │  │ temp=0.9 │  │ temp=0.9 │ ...  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │
│    R₁ ↓          R₂ ↓          Rₙ ↓            │
└───────┼─────────────┼─────────────┼─────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│             SYNTHESIS LAYER                     │
│                                                 │
│   Meta-Agent receives: [R₁, R₂, ..., Rₙ]       │
│                                                 │
│   1. Find dominant logical anchor               │
│   2. Extract high-value divergences             │
│   3. Produce fused optimal output               │
└─────────────────────────────────────────────────┘
```

## Why Temperature Matters

Temperature controls the sampling distribution from the softmax output. At temperature=0, the model is deterministic — always the same token. At temperature=0.9+, the distribution broadens and lower-probability tokens become accessible.

PRISM **requires** temperature > 0.7 to be meaningful. Below that, N agents converge to near-identical outputs and the synthesis gain is minimal.

Recommended: `temperature=0.85–1.0` for creative/analytical tasks, `0.7–0.85` for structured outputs.

## Choosing N

| N | Use case |
|---|----------|
| 3 | Fast iteration, cost-sensitive |
| 5 | Standard — good diversity/cost ratio |
| 7+ | Critical decisions, high-value synthesis |
| 10+ | Research contexts, maximum coverage |

Note: diminishing returns appear around N=7 for most tasks. The marginal gain of instance 8 over instance 7 is much smaller than 4 over 3.

## The Meta-Agent Prompt

The Meta-Agent prompt is the critical component. A poorly designed synthesis prompt collapses back into consensus soup.

**Wrong approach:**
> "Summarize the following N responses into one."

This produces an average. Mediocre by design.

**PRISM approach:**
> "You are a structural architect. Given N responses to the same prompt:
> 1. Identify the response with the strongest logical foundation (the anchor)
> 2. For each other response, extract ONLY elements that add non-redundant value
> 3. Inject those elements into the anchor structure where they strengthen it
> 4. Output the resulting synthesized structure, not a list of summaries"

See [`/prompts/templates/master-synthesis.md`](../prompts/templates/master-synthesis.md) for the full template.

## Stateless Architecture

Each agent run is fully independent. No shared state, no message passing between sampling agents. This is intentional:

- Horizontal scaling is trivial (just spawn more)
- No cascading failures (one agent timeout doesn't block others)
- Reproducibility: any single agent run can be logged and replayed
- Domain portability: the same infrastructure runs any domain

## Parallelism Options

**True parallel (recommended):** Use `Promise.all` (JS) or `asyncio.gather` (Python) to fire all N requests simultaneously. Total latency ≈ single request latency.

**Sequential fallback:** For rate-limited APIs or cost control, agents can run sequentially. Total latency = N × single request latency. Not recommended for production.

**Batched:** Fire in batches of 3-5. Useful when N is large and rate limits apply.
