# PRISM Sampling Prompt Guidelines

When designing prompts for PRISM N-Sampling, the goal is to maximize the useful variance between instances.

## Principles

**Be specific about the task, not the approach**

❌ "Use a structured approach to analyze..."
✅ "Analyze X and give me actionable conclusions"

Specifying the approach constraints the trajectory space. Let the model find its own path.

**Include relevant context, avoid implicit constraints**

Include the facts the model needs. Don't add stylistic constraints ("be concise", "use bullet points") — those reduce variance. Format instructions belong in the meta-agent prompt, not here.

**Open-ended > Closed-ended**

Questions with one correct answer don't benefit from N-sampling. The gain is maximal when the problem has multiple valid approaches or when the solution space is large.

## Template Structure

```
[Context / Background]
Provide the relevant facts, constraints, and domain context.

[Task]
State precisely what you want the model to produce.

[Quality criteria] (optional)
What makes a good response? Not format — substance.
E.g., "Prioritize physiological accuracy over practical simplicity."
```

## Domain-Specific Notes

### Fitness / Biomechanics
Include: athlete profile (age, level, goal, equipment, training history), specific constraints (injuries, time available), and the output format expected (program structure, not just exercises).

### Technical / Engineering
Include: stack constraints, scale requirements, existing architecture. Avoid specifying the solution pattern — let instances diverge on architecture.

### Creative / Analytical
Minimal constraints produce maximum variance. State the goal, the audience, and any hard constraints. Nothing else.

---

## Anti-Patterns to Avoid

| Anti-pattern | Why it's bad |
|---|---|
| "Think step by step" | Constrains to chain-of-thought format — reduces trajectory diversity |
| "You are an expert in X" | Persona bias — shifts the latent space artificially |
| "First do A, then B, then C" | Fully specifies the path — no room for divergence |
| Extremely long system prompts | Over-constrains the response space |
