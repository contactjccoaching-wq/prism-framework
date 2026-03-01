# PRISM Framework

**Prospective Refinement through Intelligent Synthesis and Multiplicity**

> Exploit native LLM stochasticity instead of engineering artificial personas.

---

## The Problem with Multi-Agent Personas

The classic multi-agent mistake is creating artificial "roles" (The Expert, The Critic, The Devil's Advocate) that bias the model's latent space and produce **caricatural, predictable responses**.

Role-playing forces the model into a constrained subspace. You get verbose "experts" and contrarian "critics" by design — not by intelligence.

---

## The PRISM Protocol

PRISM operates on a fundamentally different principle: **Emergent Perspective Orchestration**.

### 1. Parallel N-Sampling

Inject the **same prompt** into N identical instances simultaneously.

```
Prompt P → [Agent₁, Agent₂, Agent₃, ... Agentₙ]
```

No roles. No constraints. Each agent explores a **different probability trajectory** through the model's latent space, driven purely by the temperature-based stochasticity native to LLMs.

You can use:
- Same model × N instances (maximum variance from same distribution)
- Different models (cross-architecture diversity)
- Both simultaneously

### 2. Latent Space Exploration

Each agent generates a unique solution based on the natural fluctuations of sampling. This reveals nuances, edge cases, and approaches that a single agent — or a role-constrained agent — would systematically ignore.

This is not a bug. It's the feature.

### 3. Meritocratic Arbitrage (Meta-Agent)

The Meta-Agent is not a vote counter. It acts as a **Structural Architect**:

1. Identifies the **most robust logical anchor** across all responses
2. Extracts **critical variables** identified by minority instances
3. Fuses them into a single optimal output

This kills "Consensus Soup" — the mediocre averaged answer you get from naive majority voting.

```
[Response₁, Response₂, ... Responseₙ] → Meta-Agent → Optimal Output
```

---

## Why PRISM > Personas

| | Persona Approach | PRISM |
|---|---|---|
| **Diversity source** | Engineered role constraints | Native LLM stochasticity |
| **Bias** | High (role distortion) | Low (no artificial constraint) |
| **Consistency** | Predictable by design | Emergent |
| **Synthesis** | Majority vote / consensus | Meritocratic arbitrage |
| **Architecture** | Stateful, role-dependent | Stateless, domain-agnostic |
| **Scalability** | Hard (role management) | Easy (N is just a parameter) |

---

## Properties

**Anti-Bias** — No role-playing distortion. The model reasons freely in its full latent space.

**Self-Consistency** — The goal isn't the majority answer. It's the technical optimum by data fusion.

**Scalability** — Stateless architecture. Domain-agnostic. N is just a number. Run it on fitness programming or legal document analysis — same protocol.

---

## Applied Example: Biomechanical Training

PRISM was originally developed for personalized fitness programming. Applied to biomechanics and physiology:

- N instances each generate a complete training plan from the same athlete profile
- Each plan reflects different periodization strategies, exercise selections, intensity distributions
- Meta-Agent identifies the most evidence-consistent structure and injects the high-value variations

Result: plans that cover edge cases a single model call would statistically miss.

---

## Quick Start

### JavaScript

```javascript
import { PRISMSampler } from './examples/javascript/basic-sampling.js';

const prism = new PRISMSampler({
  n: 5,           // Number of parallel instances
  temperature: 0.9,
  model: 'claude-opus-4-6'
});

const result = await prism.run(
  prompt,
  metaAgentPrompt  // See /prompts/templates/
);

console.log(result.synthesis);  // The meritocratic output
console.log(result.divergences); // What each agent found uniquely
```

### Python

```python
from examples.python.meta_agent import PRISMPipeline

pipeline = PRISMPipeline(n=5, model="claude-opus-4-6")
result = pipeline.run(prompt, meta_prompt)

print(result["synthesis"])
print(result["divergences"])
```

---

## Repo Structure

```
prism-framework/
├── README.md
├── LICENSE
├── .env.example
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── docs/
│   ├── architecture.md       # Deep dive into the protocol
│   ├── vs-personas.md        # Extended comparison with persona approaches
│   └── daco.md               # DACO companion protocol spec
├── examples/
│   ├── javascript/
│   │   ├── basic-sampling.js  # N-Sampling with Anthropic SDK
│   │   └── meta-agent.js      # Full PRISM pipeline
│   └── python/
│       ├── basic_sampling.py
│       └── meta_agent.py
└── prompts/
    └── templates/
        ├── master-synthesis.md  # Meta-Agent prompt template
        └── sampling-base.md     # Base sampling prompt guidelines
```

---

## DACO — Declarative Agent & MCP Orchestration

PRISM's companion protocol for tool-augmented agents.

The pattern: **the LLM poses the questions**, not the developer. The agent receives a task description + a manifest of available MCPs. It builds the execution graph, resolves dependencies, fires parallel tool calls, and recovers from failures — autonomously.

First production implementation: [Smart Rabbit MCP](https://www.smartrabbitfitness.com) (`npx smartrabbit-mcp`) — Claude Desktop asks the user for their fitness profile in natural language, orchestrates the Smart Rabbit API + PubMed, and returns a complete program.

See [`docs/daco.md`](docs/daco.md) for the full specification.

---

## Author

**Jacques Chauvin** — WNBF World Champion (4th), fitness AI systems builder.

- Site: [jc-coaching.com](https://www.jc-coaching.com)
- Framework in production: [Smart Rabbit Fitness](https://www.smartrabbitfitness.com)
- PRISM community: [jc-coaching.com/prism](https://www.jc-coaching.com/prism.html)

---

## License

MIT — use it, fork it, build on it. Attribution appreciated, not required.
