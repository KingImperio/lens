import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseUsage } from '../utils/parseUsage.js';
import { calculateCost } from '../utils/costs.js';
import { detectProvider } from './providers.js';

export async function captureCall(db, responseBody, req, latencyMs) {
  const provider = detectProvider(req.path);
  if (!provider) return;

  const usage = parseUsage(responseBody, provider.schema);
  if (!usage) return;

  const model = extractModel(req.body, responseBody);
  const cost = calculateCost(model, usage.inputTokens, usage.outputTokens);

  const callRecord = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    provider: provider.name,
    model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens ?? 0,
    cacheWriteTokens: usage.cacheWriteTokens ?? 0,
    costUsd: cost.total,
    inputCostUsd: cost.input,
    outputCostUsd: cost.output,
    isEstimated: cost.isEstimated,
    latencyMs,
    sessionId: global.currentSessionId
  };

  try {
    db.prepare(`
      INSERT INTO calls (
        id, session_id, timestamp, provider, model,
        input_tokens, output_tokens, cache_read_tokens,
        cache_write_tokens, cost_usd, input_cost_usd,
        output_cost_usd, is_estimated, latency_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      callRecord.id,
      callRecord.sessionId,
      callRecord.timestamp,
      callRecord.provider,
      callRecord.model,
      callRecord.inputTokens,
      callRecord.outputTokens,
      callRecord.cacheReadTokens,
      callRecord.cacheWriteTokens,
      callRecord.costUsd,
      callRecord.inputCostUsd,
      callRecord.outputCostUsd,
      callRecord.isEstimated ? 1 : 0,
      callRecord.latencyMs
    );

    global.eventEmitter.emit('call', callRecord);
  } catch (error) {
    console.error('[Lens] Failed to insert call record:', error.message);
    fs.appendFileSync(
      path.join(os.homedir(), '.lens', 'errors.log'),
      `${new Date().toISOString()} - ${error.message}\n`
    );
  }
}

function extractModel(requestBody, responseBody) {
  if (responseBody?.model) return responseBody.model;
  if (requestBody?.model) return requestBody.model;
  return 'unknown';
}