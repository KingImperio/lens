import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { formatCost, formatDuration } from '../../utils/formatters.js';

export function StatusBar({ sessionId, callCount, totalCost, width }) {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Box width={width} justifyContent="space-between">
      <Box>
        <Text color="green">●</Text>
        <Text color="gray"> Proxy running on :2337</Text>
      </Box>
      <Box>
        <Text color="gray">{formatDuration(startTime, Date.now())}</Text>
      </Box>
      <Box>
        <Text color="gray">q to quit</Text>
      </Box>
    </Box>
  );
}