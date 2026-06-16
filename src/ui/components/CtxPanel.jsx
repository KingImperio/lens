import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { formatTokens, formatCost } from '../../utils/formatters.js';

export function CtxPanel({ calls }) {
  const ctxStats = useMemo(() => {
    if (!calls || calls.length < 2) return null;

    const modelGroups = {};
    for (const call of calls) {
      if (!modelGroups[call.model]) {
        modelGroups[call.model] = [];
      }
      modelGroups[call.model].push(call);
    }

    let detected = false;
    let beforeAvg = 0;
    let afterAvg = 0;
    let savedTokens = 0;
    let savedPercent = 0;
    let savedCost = 0;

    for (const modelCalls of Object.values(modelGroups)) {
      if (modelCalls.length < 2) continue;

      const firstHalf = modelCalls.slice(0, Math.floor(modelCalls.length / 2));
      const secondHalf = modelCalls.slice(Math.floor(modelCalls.length / 2));

      const avg1 = firstHalf.reduce((sum, c) => sum + c.input_tokens, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((sum, c) => sum + c.input_tokens, 0) / secondHalf.length;

      if (avg1 > avg2 && avg1 > 0) {
        const reduction = ((avg1 - avg2) / avg1) * 100;
        if (reduction > 20) {
          detected = true;
          beforeAvg = avg1;
          afterAvg = avg2;
          savedTokens = avg1 - avg2;
          savedPercent = reduction;
          savedCost = secondHalf.reduce((sum, c) => sum + c.cost_usd, 0);
        }
      }
    }

    if (!detected) return null;

    return { beforeAvg, afterAvg, savedTokens, savedPercent, savedCost };
  }, [calls]);

  if (!ctxStats) {
    return (
      <Box flexDirection="column" width="100%" marginTop={1}>
        <Text color="gray">ctx not detected</Text>
        <Text color="gray" dimColor>Point ctx at :2337 to track savings</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%" marginTop={1}>
      <Text bold color="cyan">ctx active</Text>
      <Text>Before: {formatTokens(Math.round(ctxStats.beforeAvg))} tokens avg</Text>
      <Text>After: {formatTokens(Math.round(ctxStats.afterAvg))} tokens avg</Text>
      <Text>Saved: {formatTokens(Math.round(ctxStats.savedTokens))} ({ctxStats.savedPercent.toFixed(0)}%) per call</Text>
      <Text>Est. saved: {formatCost(ctxStats.savedCost)} this session</Text>
    </Box>
  );
}