import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useStdout } from 'ink';
import { StatusBar } from './components/StatusBar.jsx';
import { CallLog } from './components/CallLog.jsx';
import { SessionSummary } from './components/SessionSummary.jsx';
import { CtxPanel } from './components/CtxPanel.jsx';
import { getSessionCalls, getSessionSummary } from '../db/queries.js';

export function Dashboard({ db, sessionId, eventEmitter }) {
  const [calls, setCalls] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [callCount, setCallCount] = useState(0);
  const { stdout } = useStdout();
  const [width, setWidth] = useState(stdout?.columns || 80);

  useEffect(() => {
    const initialCalls = getSessionCalls(db, sessionId);
    setCalls(initialCalls);
    
    const initialSummary = getSessionSummary(db, sessionId);
    setSummary(initialSummary);
    
    const total = initialSummary.reduce((acc, s) => acc + s.totalCostUsd, 0);
    setTotalCost(total);
    setCallCount(initialCalls.length);
  }, [db, sessionId]);

  useEffect(() => {
    const handler = (call) => {
      if (call.sessionId === sessionId) {
        setCalls(prev => [call, ...prev].slice(0, 100));
        setCallCount(prev => prev + 1);
        setTotalCost(prev => prev + call.costUsd);
        
        setSummary(prev => {
          const existing = prev.find(s => s.model === call.model);
          if (existing) {
            return prev.map(s => 
              s.model === call.model 
                ? { 
                    ...s, 
                    totalInputTokens: s.totalInputTokens + call.inputTokens,
                    totalOutputTokens: s.totalOutputTokens + call.outputTokens,
                    totalCacheReadTokens: s.totalCacheReadTokens + call.cacheReadTokens,
                    totalCostUsd: s.totalCostUsd + call.costUsd,
                    callCount: s.callCount + 1
                  }
                : s
            );
          }
          return [...prev, {
            model: call.model,
            provider: call.provider,
            totalInputTokens: call.inputTokens,
            totalOutputTokens: call.outputTokens,
            totalCacheReadTokens: call.cacheReadTokens,
            totalCostUsd: call.costUsd,
            callCount: 1
          }];
        });
      }
    };

    eventEmitter.on('call', handler);
    return () => eventEmitter.off('call', handler);
  }, [sessionId, eventEmitter]);

  const logWidth = Math.floor(width * 0.6) - 1;
  const panelWidth = width - logWidth - 2;

  return (
    <Box flexDirection="column" width={width}>
      <StatusBar 
        sessionId={sessionId}
        callCount={callCount}
        totalCost={totalCost}
        width={width}
      />
      <Box flexDirection="row">
        <Box width={logWidth}>
          <CallLog calls={calls} width={logWidth} />
        </Box>
        <Box width={panelWidth} flexDirection="column" paddingLeft={1}>
          <SessionSummary summary={summary} totalCost={totalCost} callCount={callCount} />
          <CtxPanel calls={calls} />
        </Box>
      </Box>
    </Box>
  );
}