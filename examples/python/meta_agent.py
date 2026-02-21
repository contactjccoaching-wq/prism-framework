"""
PRISM Framework — Full Pipeline with Meta-Agent (Python)

Complete PRISM implementation:
1. N-Sampling: N parallel async requests
2. Meta-Agent: meritocratic synthesis

pip install anthropic
"""

import asyncio
import os
import time
from pathlib import Path
import anthropic


META_PROMPT_PATH = Path(__file__).parent.parent.parent / "prompts/templates/master-synthesis.md"


class PRISMPipeline:
    def __init__(
        self,
        n: int = 5,
        model: str = "claude-opus-4-6",
        temperature: float = 0.9,
        max_tokens: int = 2000,
        meta_model: str = None,
    ):
        self.n = n
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.meta_model = meta_model or model
        self.client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    async def _sample_one(self, prompt: str, index: int) -> dict:
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return {"index": index, "content": response.content[0].text}

    async def _synthesize(self, responses: list[dict], custom_meta_prompt: str = None) -> str:
        meta_template = custom_meta_prompt
        if not meta_template and META_PROMPT_PATH.exists():
            meta_template = META_PROMPT_PATH.read_text()
        else:
            meta_template = "You are a structural architect synthesizing multiple AI responses."

        formatted = "\n\n---\n\n".join(
            f"### Response {r['index']}\n\n{r['content']}" for r in responses
        )

        meta_prompt = f"{meta_template}\n\n---\n\n## The {self.n} responses to synthesize:\n\n{formatted}"

        response = await self.client.messages.create(
            model=self.meta_model,
            max_tokens=self.max_tokens * 2,
            temperature=0.3,  # Low temperature for synthesis
            messages=[{"role": "user", "content": meta_prompt}],
        )
        return response.content[0].text

    def run(self, prompt: str, custom_meta_prompt: str = None) -> dict:
        """Synchronous wrapper for the async pipeline."""
        return asyncio.run(self._run_async(prompt, custom_meta_prompt))

    async def _run_async(self, prompt: str, custom_meta_prompt: str = None) -> dict:
        print(f"[PRISM] Starting N-Sampling (n={self.n})...")
        start = time.time()

        # Step 1: Parallel sampling
        tasks = [self._sample_one(prompt, i + 1) for i in range(self.n)]
        responses = await asyncio.gather(*tasks)
        print(f"[PRISM] {self.n} responses received ({(time.time()-start)*1000:.0f}ms)")

        # Step 2: Meta-agent synthesis
        print("[PRISM] Running Meta-Agent synthesis...")
        synthesis = await self._synthesize(responses, custom_meta_prompt)

        total_ms = (time.time() - start) * 1000
        print(f"[PRISM] Synthesis complete ({total_ms:.0f}ms total)")

        return {
            "synthesis": synthesis,
            "responses": responses,
            "metadata": {
                "n": self.n,
                "model": self.model,
                "temperature": self.temperature,
                "total_ms": total_ms,
            },
        }


if __name__ == "__main__":
    pipeline = PRISMPipeline(n=3)  # n=3 for demo speed

    prompt = """
    Explain the most underrated recovery technique in strength training,
    with physiological mechanisms and practical implementation.
    Be specific, avoid common knowledge.
    """

    result = pipeline.run(prompt)

    print("\n" + "="*60)
    print("PRISM SYNTHESIS (Meta-Agent Output)")
    print("="*60)
    print(result["synthesis"])
    print("\n" + "="*60)
    print(f"Total: {result['metadata']['total_ms']:.0f}ms | N={result['metadata']['n']}")
