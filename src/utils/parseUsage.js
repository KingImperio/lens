export function parseUsage(responseBody, schema) {
  if (!responseBody || !responseBody.usage) {
    return null;
  }

  const { usage } = responseBody;

  try {
    if (schema === 'openai') {
      return parseOpenAIUsage(usage);
    } else if (schema === 'anthropic') {
      return parseAnthropicUsage(usage);
    }
  } catch (error) {
    console.warn('[Lens] Failed to parse usage data:', error.message);
    return null;
  }

  return null;
}

function parseOpenAIUsage(usage) {
  return {
    inputTokens: usage.prompt_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? 0,
    cacheReadTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
    cacheWriteTokens: 0
  };
}

function parseAnthropicUsage(usage) {
  return {
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0
  };
}