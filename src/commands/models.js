import chalk from 'chalk';
import { PRICING } from '../utils/costs.js';

export function modelsCommand() {
  console.log(chalk.bold('\nSupported Models & Pricing\n'));
  console.log(chalk.gray('Model'.padEnd(40) + 'Input/1M'.padEnd(12) + 'Output/1M'.padEnd(12) + 'Provider'));
  console.log(chalk.gray('─'.repeat(70)));

  const models = Object.entries(PRICING);
  
  for (const [model, price] of models) {
    let provider = 'Unknown';
    if (model.includes('llama') || model.includes('deepseek') || model.includes('phi') || model.includes('stepfun')) {
      provider = 'NVIDIA NIM';
    } else if (model.includes('claude')) {
      provider = 'Anthropic';
    } else if (model.includes('gpt') || model.includes('o3')) {
      provider = 'OpenAI';
    }

    const input = price.input === 0 ? 'Free' : `$${price.input.toFixed(2)}`;
    const output = price.output === 0 ? 'Free' : `$${price.output.toFixed(2)}`;

    console.log(
      model.padEnd(40) +
      input.padEnd(12) +
      output.padEnd(12) +
      provider
    );
  }

  console.log(chalk.gray('\nModels not in this list are tracked with zero cost and marked as estimated.'));
}