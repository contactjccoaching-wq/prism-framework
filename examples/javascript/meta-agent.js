/**
 * PRISM Framework — Full Pipeline with Meta-Agent (JavaScript)
 *
 * Complete PRISM implementation:
 * 1. N-Sampling: fire N parallel requests
 * 2. Meta-Agent: meritocratic synthesis (not consensus averaging)
 *
 * npm install @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const __dir = dirname(fileURLToPath(import.meta.url));

// Load meta-agent prompt template
const META_PROMPT_TEMPLATE = readFileSync(
  join(__dir, '../../prompts/templates/master-synthesis.md'),
  'utf-8'
);

/**
 * Full PRISM pipeline
 * @param {string} prompt - The task prompt
 * @param {object} options - Pipeline configuration
 * @returns {Promise<{synthesis: string, responses: object[], divergences: string[]}>}
 */
export class PRISMSampler {
  constructor(options = {}) {
    this.n = options.n ?? 5;
    this.model = options.model ?? 'claude-opus-4-6';
    this.temperature = options.temperature ?? 0.9;
    this.maxTokens = options.maxTokens ?? 2000;
    this.metaModel = options.metaModel ?? this.model;
  }

  /**
   * Run the full PRISM pipeline
   */
  async run(prompt, customMetaPrompt = null) {
    console.log(`[PRISM] Starting N-Sampling (n=${this.n})...`);
    const startTime = Date.now();

    // Step 1: Parallel N-Sampling
    const samplingRequests = Array.from({ length: this.n }, (_, i) =>
      client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [{ role: 'user', content: prompt }],
      }).then(res => ({
        index: i + 1,
        content: res.content[0].text,
      }))
    );

    const responses = await Promise.all(samplingRequests);
    console.log(`[PRISM] ${this.n} responses received (${Date.now() - startTime}ms)`);

    // Step 2: Meta-Agent Synthesis
    console.log(`[PRISM] Running Meta-Agent synthesis...`);

    const responsesFormatted = responses
      .map(r => `### Response ${r.index}\n\n${r.content}`)
      .join('\n\n---\n\n');

    const metaPromptBase = customMetaPrompt || META_PROMPT_TEMPLATE;
    const metaPrompt = `${metaPromptBase}

---

## The ${this.n} responses to synthesize:

${responsesFormatted}`;

    const metaResponse = await client.messages.create({
      model: this.metaModel,
      max_tokens: this.maxTokens * 2,
      temperature: 0.3, // Low temperature for synthesis — we want precision here
      messages: [{ role: 'user', content: metaPrompt }],
    });

    const synthesis = metaResponse.content[0].text;
    const totalTime = Date.now() - startTime;
    console.log(`[PRISM] Synthesis complete (${totalTime}ms total)`);

    return {
      synthesis,
      responses,
      metadata: {
        n: this.n,
        model: this.model,
        temperature: this.temperature,
        totalTimeMs: totalTime,
      },
    };
  }
}

// Example usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const prism = new PRISMSampler({ n: 3 }); // n=3 for demo speed

  const prompt = `
    Explain the most underrated recovery technique in strength training,
    with physiological mechanisms and practical implementation.
    Be specific, avoid common knowledge.
  `;

  const result = await prism.run(prompt);

  console.log('\n' + '='.repeat(60));
  console.log('PRISM SYNTHESIS (Meta-Agent Output)');
  console.log('='.repeat(60));
  console.log(result.synthesis);
  console.log('\n' + '='.repeat(60));
  console.log(`Total time: ${result.metadata.totalTimeMs}ms | N: ${result.metadata.n}`);
}
