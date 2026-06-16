import React from 'react';
import { render } from 'ink';
import { createProxyServer } from '../proxy/server.js';
import { initDatabase, createSession, endSession } from '../db/database.js';
import { Dashboard } from '../ui/Dashboard.jsx';

export async function startCommand(options) {
  const port = options.port || 2337;
  const noUi = options.noUi;

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lens proxy running on http://localhost:${port}

Point your agents here:

Opencode (opencode.json):
  "model": { "baseUrl": "http://localhost:${port}/nim" }

Hermes (config.yaml):
  api_base: http://localhost:${port}/nim

KiloCode CLI:
  KILOCODE_BASE_URL=http://localhost:${port}/nim lens start

Claude Code:
  ANTHROPIC_BASE_URL=http://localhost:${port}/anthropic

Generic OpenAI-compatible:
  base_url: http://localhost:${port}/nim
  api_key: [your actual NIM key — passed through unchanged]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const db = initDatabase();
  const session = createSession(db);
  global.currentSessionId = session.id;
  
  const EventEmitter = (await import('events')).default;
  global.eventEmitter = new EventEmitter();

  let server;
  try {
    server = await createProxyServer(db, port);
    console.log(`[Lens] Proxy server started on port ${port}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use. Run lens start --port [other]`);
      process.exit(1);
    }
    console.error('[Lens] Failed to start proxy server:', error.message);
    process.exit(1);
  }

  if (!noUi) {
    const isTTY = process.stdout.isTTY;
    if (!isTTY) {
      console.log('[Lens] Non-TTY terminal detected, falling back to JSON line mode');
      setupJsonLineMode(db, session.id);
    } else {
      setupInkDashboard(db, session.id, global.eventEmitter);
    }
  } else {
    setupJsonLineMode(db, session.id);
  }

  const shutdown = async () => {
    console.log('\n[Lens] Shutting down...');
    endSession(db, session.id);
    if (server) server.close();
    db.close();
    console.log('[Lens] Session ended.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  if (noUi || !process.stdout.isTTY) {
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      if (data === 'q' || data === 'Q' || data === '\u0003') {
        shutdown();
      }
    });
  }
}

function setupInkDashboard(db, sessionId, eventEmitter) {
  const { waitUntilExit } = render(
    <Dashboard db={db} sessionId={sessionId} eventEmitter={eventEmitter} />
  );
  
  waitUntilExit().then(() => {
    endSession(db, sessionId);
    db.close();
    process.exit(0);
  });
}

function setupJsonLineMode(db, sessionId) {
  global.eventEmitter.on('call', (call) => {
    console.log(JSON.stringify({
      type: 'call',
      ...call,
      timestamp: new Date(call.timestamp).toISOString()
    }));
  });
}