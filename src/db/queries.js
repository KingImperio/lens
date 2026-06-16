export function insertCall(db, record) {
  const stmt = db.prepare(`
    INSERT INTO calls (
      id, session_id, timestamp, provider, model,
      input_tokens, output_tokens, cache_read_tokens,
      cache_write_tokens, cost_usd, input_cost_usd,
      output_cost_usd, is_estimated, latency_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    record.id,
    record.sessionId,
    record.timestamp,
    record.provider,
    record.model,
    record.inputTokens,
    record.outputTokens,
    record.cacheReadTokens,
    record.cacheWriteTokens,
    record.costUsd,
    record.inputCostUsd,
    record.outputCostUsd,
    record.isEstimated ? 1 : 0,
    record.latencyMs
  );
}

export function getSessionCalls(db, sessionId) {
  return db.prepare(
    'SELECT * FROM calls WHERE session_id = ? ORDER BY timestamp DESC'
  ).all(sessionId);
}

export function getSessionSummary(db, sessionId) {
  return db.prepare(`
    SELECT 
      model,
      provider,
      SUM(input_tokens) as totalInputTokens,
      SUM(output_tokens) as totalOutputTokens,
      SUM(cache_read_tokens) as totalCacheReadTokens,
      SUM(cost_usd) as totalCostUsd,
      SUM(input_cost_usd) as totalInputCostUsd,
      SUM(output_cost_usd) as totalOutputCostUsd,
      COUNT(*) as callCount,
      AVG(latency_ms) as avgLatencyMs
    FROM calls 
    WHERE session_id = ?
    GROUP BY model, provider
    ORDER BY totalCostUsd DESC
  `).all(sessionId);
}

export function getRecentSessions(db, limit = 10) {
  return db.prepare(`
    SELECT 
      id,
      started_at,
      ended_at,
      total_input_tokens,
      total_output_tokens,
      total_cost_usd,
      (SELECT COUNT(*) FROM calls WHERE session_id = sessions.id) as call_count
    FROM sessions 
    ORDER BY started_at DESC 
    LIMIT ?
  `).all(limit);
}

export function getAllCallsForSession(db, sessionId) {
  return db.prepare(`
    SELECT 
      timestamp,
      provider,
      model,
      input_tokens,
      output_tokens,
      cache_read_tokens,
      cost_usd,
      latency_ms
    FROM calls 
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `).all(sessionId);
}

export function updateSessionTotals(db, sessionId) {
  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(input_tokens), 0) as totalInputTokens,
      COALESCE(SUM(output_tokens), 0) as totalOutputTokens,
      COALESCE(SUM(cost_usd), 0) as totalCostUsd
    FROM calls WHERE session_id = ?
  `).get(sessionId);

  db.prepare(`
    UPDATE sessions 
    SET total_input_tokens = ?,
        total_output_tokens = ?,
        total_cost_usd = ?
    WHERE id = ?
  `).run(
    totals.totalInputTokens,
    totals.totalOutputTokens,
    totals.totalCostUsd,
    sessionId
  );
}