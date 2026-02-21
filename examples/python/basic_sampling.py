"""
PRISM Framework — Basic N-Sampling Example (Python)

Fires N parallel async requests to the same prompt.
Requires: anthropic

pip install anthropic
"""

import asyncio
import os
import anthropic


async def n_sample(prompt: str, n: int = 5, model: str = "claude-opus-4-6",
                   temperature: float = 0.9, max_tokens: int = 2000) -> list[dict]:
    """
    Run N parallel samples for the same prompt.

    Args:
        prompt: The prompt to sample
        n: Number of parallel instances
        model: Anthropic model ID
        temperature: Sampling temperature (0.7–1.0 recommended for PRISM)
        max_tokens: Max tokens per response

    Returns:
        List of dicts: [{index, content}, ...]
    """
    client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    async def single_request(index: int) -> dict:
        response = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return {"index": index, "content": response.content[0].text}

    # Fire all N requests in parallel
    tasks = [single_request(i + 1) for i in range(n)]
    responses = await asyncio.gather(*tasks)

    return list(responses)


if __name__ == "__main__":
    prompt = """
    An athlete, 28 years old, trains 4x/week, goal: hypertrophy,
    intermediate level, has a barbell and dumbbells.
    Design a 4-week training block with precise sets, reps, and rest periods.
    """

    print(f"Running PRISM N-Sampling (n=5)...\n")
    responses = asyncio.run(n_sample(prompt, n=5))

    for r in responses:
        print(f"\n{'='*60}")
        print(f"AGENT {r['index']}")
        print("="*60)
        print(r["content"][:500] + "...")

    print(f"\n✓ {len(responses)} responses generated")
