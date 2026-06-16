import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';

const DB_DIR = path.join(os.homedir(), '.lens');
const DB_PATH = path.join(DB_DIR, 'lens.db');

export function initDatabase() {
  fs.mkdirSync(DB_DIR, { recursive: true });
  
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      total_input_tokens INTEGER DEFAULT 0,
      total_output_tokens INTEGER DEFAULT 0,
      total_cost_usd REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL,
      cache_read_tokens INTEGER DEFAULT 0,
      cache_write_tokens INTEGER DEFAULT 0,
      cost_usd REAL NOT NULL,
      input_cost_usd REAL NOT NULL,
      output_cost_usd REAL NOT NULL,
      is_estimated INTEGER DEFAULT 0,
      latency_ms INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);

  return db;
}

export function createSession(db) {
  const id = crypto.randomUUID();
  const startedAt = Date.now();
  
  db.prepare('INSERT INTO sessions (id, started_at) VALUES (?, ?)').run(id, startedAt);
  
  return { id, startedAt };
}

export function endSession(db, sessionId) {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!session) return;

  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(input_tokens), 0) as totalInputTokens,
      COALESCE(SUM(output_tokens), 0) as totalOutputTokens,
      COALESCE(SUM(cost_usd), 0) as totalCostUsd
    FROM calls WHERE session_id = ?
  `).get(sessionId);

  db.prepare(`
    UPDATE sessions 
    SET ended_at = ?, 
        total_input_tokens = ?,
        total_output_tokens = ?,
        total_cost_usd = ?
    WHERE id = ?
  `).run(
    Date.now(),
    totals.totalInputTokens,
    totals.totalOutputTokens,
    totals.totalCostUsd,
    sessionId
  );
}

export { DB_PATH };