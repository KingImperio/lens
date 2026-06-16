export const PRICING = {
  // NVIDIA NIM models
  "stepfun/step-3.7-flash": { input: 0.00, output: 0.00 },
  "meta/llama-3.3-70b-instruct": { input: 0.00, output: 0.00 },
  "deepseek/deepseek-r1": { input: 0.00, output: 0.00 },
  "microsoft/phi-4": { input: 0.00, output: 0.00 },
  
  // Anthropic models
  "claude-haiku-4-5-20251001": { input: 0.80, output: 4.00 },
  "claude-sonnet-4-6": { input: 3.00, output: 15.00 },
  "claude-opus-4-6": { input: 15.00, output: 75.00 },
  "claude-opus-4-8": { input: 15.00, output: 75.00 },
  "claude-fable-5": { input: 10.00, output: 50.00 },
  
  // OpenAI models
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "o3-mini": { input: 1.10, output: 4.40 }
};

// All prices are per 1 million tokens
// Returns cost in USD for given token count
export function calculateCost(model, inputTokens, outputTokens) {
  const price = PRICING[model] ?? { input: 0, output: 0 }
  const inputCost = (inputTokens / 1_000_000) * price.input
  const outputCost = (outputTokens / 1_000_000) * price.output
  return {
    input: inputCost,
    output: outputCost,
    total: inputCost + outputCost,
    isEstimated: !PRICING[model]
  }
}