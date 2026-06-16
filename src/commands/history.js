import chalk from 'chalk';
import { initDatabase } from '../db/database.js';
import { getRecentSessions } from '../db/queries.js';
import { formatCost, formatDuration, formatTokens } from '../utils/formatters.js';

export function historyCommand(options) {
  const limit = options.limit || 10;
  const db = initDatabase();
  
  try {
    const sessions = getRecentSessions(db, limit);
    
    if (sessions.length === 0) {
      console.log(chalk.yellow('No sessions found.'));
      return;
    }

    console.log(chalk.bold('\nRecent Sessions\n'));
    console.log(chalk.gray('Date'.padEnd(20) + 'Duration'.padEnd(12) + 'Calls'.padEnd(8) + 'Total Cost'));
    console.log(chalk.gray('─'.repeat(60)));

    for (const session of sessions) {
      const date = new Date(session.started_at).toLocaleString();
      const duration = session.ended_at 
        ? formatDuration(session.started_at, session.ended_at)
        : 'Active';
      const calls = session.call_count || 0;
      const cost = formatCost(session.total_cost_usd);

      console.log(
        date.padEnd(20) +
        duration.padEnd(12) +
        String(calls).padEnd(8) +
        cost
      );
    }

    console.log('');
  } finally {
    db.close();
  }
}