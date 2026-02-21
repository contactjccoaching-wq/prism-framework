/**
 * PRISM Framework — Basic N-Sampling Example (JavaScript)
 *
 * Fires N parallel requests to the same prompt and returns all responses.
 * Requires: @anthropic-ai/sdk
 *
 * npm install @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Run N parallel samples for the same prompt.
 * @param {string} prompt - The prompt to sample
 * @param {object} options - { n, model, temperature, maxTokens }
 * @returns {Promise<string[]>} Array of N responses
 */
export async function nSample(prompt, options = {}) {
  const {
    n = 5,
    model = 'claude-opus-4-6',
    temperature = 0.9,
    maxTokens = 2000,
  } = options;

  // Fire all N requests in parallel — total latency ≈ single request latency
  const requests = Array.from({ length: n }, (_, i) =>
    client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    }).then(res => ({
      index: i,
      content: res.content[0].text,
      usage: res.usage,
    }))
  );

  const responses = await Promise.all(requests);
  return responses;
}

// Example usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const prompt = `
    An athlete, 28 years old, trains 4x/week, goal: hypertrophy,
    intermediate level, has a barbell and dumbbells.
    Design a 4-week training block with precise sets, reps, and rest periods.
  `;

  console.log(`Running PRISM N-Sampling (n=5)...\n`);

  const responses = await nSample(prompt, { n: 5, temperature: 0.9 });

  responses.forEach((r, i) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`AGENT ${i + 1}`);
    console.log('='.repeat(60));
    console.log(r.content.substring(0, 500) + '...');
  });

  console.log(`\n✓ ${responses.length} responses generated`);
}
