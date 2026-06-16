export function formatTokens(tokens) {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function formatCost(costUsd) {
  if (costUsd === 0) return '$0.00';
  if (costUsd < 0.01) return `<$0.01`;
  if (costUsd < 1) return `$${costUsd.toFixed(3)}`;
  return `$${costUsd.toFixed(2)}`;
}

export function formatLatency(ms) {
  if (ms === null || ms === undefined) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

export function formatDuration(startMs, endMs) {
  const duration = endMs - startMs;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatModelShort(model) {
  if (!model) return 'unknown';
  const parts = model.split('/');
  const name = parts[parts.length - 1];
  return name.length > 20 ? name.substring(0, 17) + '...' : name;
}