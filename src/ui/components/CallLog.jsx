import React from 'react';
import { Box, Text } from 'ink';
import { formatTimestamp, formatTokens, formatCost, formatModelShort } from '../../utils/formatters.js';

function getModelColor(model, provider) {
  if (provider === 'NVIDIA NIM' || model.includes('llama') || model.includes('deepseek') || model.includes('phi')) {
    return 'cyan';
  }
  if (provider === 'Anthropic' || model.includes('claude')) {
    return 'yellow';
  }
  if (provider === 'OpenAI' || model.includes('gpt') || model.includes('o3')) {
    return 'green';
  }
  return 'white';
}

function getCostColor(costUsd) {
  if (costUsd > 0.10) return 'red';
  if (costUsd > 0.01) return 'yellow';
  return 'green';
}

export function CallLog({ calls, width }) {
  const visibleCalls = calls.slice(0, 20);
  
  return (
    <Box flexDirection="column" width={width}>
      {visibleCalls.map((call, index) => {
        const modelColor = getModelColor(call.model, call.provider);
        const costColor = getCostColor(call.costUsd);
        const time = formatTimestamp(call.timestamp);
        const model = formatModelShort(call.model);
        const input = formatTokens(call.input_tokens);
        const output = formatTokens(call.output_tokens);
        const cache = call.cache_read_tokens > 0 
          ? ` [cache:${formatTokens(call.cache_read_tokens)}]` 
          : '';
        const cost = call.isEstimated ? '?' : formatCost(call.cost_usd);
        
        return (
          <Box key={call.id || index} width={width}>
            <Text color="gray">[{time}]</Text>
            <Text color={modelColor}> {model}</Text>
            <Text> {input}in {output}out</Text>
            {cache && <Text color="cyan">{cache}</Text>}
            <Text color={costColor}> ${cost}</Text>
          </Box>
        );
      })}
      {visibleCalls.length === 0 && (
        <Box>
          <Text color="gray">Waiting for calls...</Text>
        </Box>
      )}
    </Box>
  );
}