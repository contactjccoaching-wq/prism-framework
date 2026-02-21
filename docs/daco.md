# DACO — Declarative Agent & MCP Orchestration

> Orchestrate MCP tools declaratively. Let the agent decide the execution graph, not the developer.

---

## Concept

DACO is the operational layer that pairs with PRISM. Where PRISM handles *reasoning diversity*, DACO handles *tool execution*.

Standard MCP usage: the developer writes sequential tool calls. Each step is hardcoded.

DACO: the agent receives a declarative task description and a manifest of available MCPs. It constructs and executes the tool call graph autonomously.

## The Core Idea

Instead of:
```
call(brave_search, query)
→ call(filesystem_read, path)
→ call(code_interpreter, code)
→ return result
```

You write:
```json
{
  "task": "Research current fitness app pricing and update the database",
  "available_tools": ["brave_search", "d1_database", "filesystem"],
  "constraints": { "max_tool_calls": 10, "timeout_ms": 30000 }
}
```

The agent builds the execution graph.

## Why Declarative

**Imperative orchestration** (standard) — the developer defines the execution path. Works for known, stable workflows. Brittle when tool availability changes or edge cases arise.

**Declarative orchestration** (DACO) — the developer defines the goal and constraints. The agent adapts the execution path. Works for open-ended tasks, handles tool failures gracefully, can substitute tools when one is unavailable.

## MCP Integration

DACO is built on top of the Model Context Protocol (MCP). Each tool is a standard MCP server. DACO adds:

1. **Tool Discovery** — the agent receives a manifest of available MCPs with their capabilities
2. **Dependency Resolution** — the agent identifies which tools need to run before others
3. **Parallel Execution** — independent tool calls fire simultaneously
4. **Failure Recovery** — if a tool fails, the agent finds an alternative path or gracefully degrades

## PRISM + DACO

The natural combination:

```
PRISM: N agents each receive the same high-level task
       Each agent uses DACO to execute different tool strategies
       Meta-Agent synthesizes results across strategies

Result: diversity in both reasoning AND tool execution paths
```

This is particularly powerful for research tasks where different search strategies (different queries, different tools) complement each other.

## Existing Implementation: Smart Rabbit MCP

The first concrete implementation of the DACO principle is the **Smart Rabbit MCP Server** — an MCP that exposes 3 tools to Claude Desktop:

- `generate_fitness_program` — takes a user profile, orchestrates the Smart Rabbit API
- `search_pubmed` — integrates NCBI PubMed for scientific references automatically
- `get_program_options` — exposes valid parameters

The key pattern: **the LLM poses the questions**. The user doesn't fill a form. They describe what they want in natural language. Claude Desktop extracts parameters via conversation, calls the MCP, and returns a fully formatted program with PubMed references injected.

```
User: "I want a program for muscle, I train 4x/week, I have a full gym"
        ↓
Claude Desktop (conversation + parameter extraction)
        ↓
smart_rabbit MCP → Smart Rabbit API (Cloudflare Worker)
        ↓ + pubmed MCP → NCBI API
        ↓
Complete program with scientific references
```

Install: `npx smartrabbit-mcp` — see [smartrabbitfitness.com](https://www.smartrabbitfitness.com)

## The Next Step: General DACO

The Smart Rabbit MCP is domain-specific. DACO generalizes the pattern:

- Instead of calling one API backend, it discovers and orchestrates **multiple MCPs**
- Works for any domain: research, legal, finance, content creation
- The LLM still poses questions — but the execution graph spans multiple tool servers

**Status:** Specification in progress. The architecture is validated by the Smart Rabbit implementation.

---

*DACO was developed alongside PRISM as part of Jacques Chauvin's AI systems work at [jc-coaching.com](https://www.jc-coaching.com)*
