import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { initDatabase } from '../db/database.js';
import { getRecentSessions, getAllCallsForSession } from '../db/queries.js';
import { formatTimestamp } from '../utils/formatters.js';

export function exportCommand(options) {
  const db = initDatabase();
  const format = options.format || 'csv';
  
  try {
    let sessionId = options.session;
    
    if (!sessionId || sessionId === 'latest') {
      const sessions = getRecentSessions(db, 1);
      if (sessions.length === 0) {
        console.log(chalk.yellow('No sessions found to export.'));
        return;
      }
      sessionId = sessions[0].id;
    }

    const calls = getAllCallsForSession(db, sessionId);
    
    if (calls.length === 0) {
      console.log(chalk.yellow(`No calls found for session ${sessionId}.`));
      return;
    }

    if (format === 'csv') {
      const csvHeader = 'timestamp,provider,model,input_tokens,output_tokens,cache_read_tokens,cost_usd,latency_ms';
      const csvRows = calls.map(call => 
        `${new Date(call.timestamp).toISOString()},${call.provider},${call.model},${call.input_tokens},${call.output_tokens},${call.cache_read_tokens},${call.cost_usd},${call.latency_ms}`
      );
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      const filename = `lens-export-${sessionId}.csv`;
      const filepath = path.resolve(filename);
      
      fs.writeFileSync(filepath, csvContent);
      console.log(chalk.green(`Exported ${calls.length} calls to ${filepath}`));
    } else {
      console.log(chalk.yellow(`Unsupported format: ${format}. Use csv.`));
    }
  } finally {
    db.close();
  }
}