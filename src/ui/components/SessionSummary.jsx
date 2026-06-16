import React from 'react';
import { Box, Text } from 'ink';
import { formatTokens, formatCost, formatModelShort } from '../../utils/formatters.js';

export function SessionSummary({ summary, totalCost, callCount }) {
  return (
    <Box flexDirection="column" width="100%">
      <Text bold>Session Summary</Text>
      <Box height={1} />
      {summary.map((model, index) => (
        <Box key={model.model || index} flexDirection="column">
          <Text bold>{formatModelShort(model.model)}</Text>
          <Text>  Input: {formatTokens(model.totalInputTokens)} ({formatCost(model.totalInputCostUsd)})</Text>
          <Text>  Output: {formatTokens(model.totalOutputTokens)} ({formatCost(model.totalOutputCostUsd)})</Text>
          <Text>  Calls: {model.callCount}</Text>
          {model.totalCacheReadTokens > 0 && (
            <Text>  Cache hits: {formatTokens(model.totalCacheReadTokens)} saved</Text>
          )}
          {index < summary.length - 1 && <Box height={1}><Text>────────────────────────</Text></Box>}
        </Box>
      ))}
      <Box height={1} />
      <Text bold>TOTAL: {formatCost(totalCost)} ({callCount} calls)</Text>
    </Box>
  );
}