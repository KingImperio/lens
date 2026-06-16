#!/usr/bin/env node

import { Command } from 'commander';
import { startCommand } from './commands/start.js';
import { historyCommand } from './commands/history.js';
import { exportCommand } from './commands/export.js';
import { modelsCommand } from './commands/models.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const program = new Command();

program
  .name('lens')
  .description('Real-time token usage and cost monitor for AI agent workflows')
  .version('0.1.0');

program
  .command('start')
  .description('Start Lens proxy server and dashboard')
  .option('-p, --port <port>', 'Port to run proxy on', '2337')
  .option('--no-ui', 'Run without terminal UI (JSON line mode)')
  .action(startCommand);

program
  .command('history')
  .description('View recent session history')
  .option('-l, --limit <limit>', 'Number of sessions to show', '10')
  .action(historyCommand);

program
  .command('export')
  .description('Export session call log to CSV')
  .option('-s, --session <session>', 'Session ID to export (default: latest)')
  .option('-f, --format <format>', 'Export format (csv)', 'csv')
  .action(exportCommand);

program
  .command('clear')
  .description('Delete all stored data')
  .option('--confirm', 'Confirm deletion')
  .action((options) => {
    if (!options.confirm) {
      console.log('Run with --confirm to delete all Lens data.');
      process.exit(0);
    }
    const dbPath = path.join(os.homedir(), '.lens', 'lens.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Lens data cleared.');
    } else {
      console.log('No Lens data found.');
    }
  });

program
  .command('models')
  .description('Print supported models and pricing')
  .action(modelsCommand);

program.parse();