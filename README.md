# Lens

Real-time token usage and cost monitor for AI agent workflows.

Lens runs as a local proxy between your agents and AI providers.
Point your agents at localhost:2337 instead of the provider URL.
Lens forwards every request, captures every response, and shows
you exactly what's happening to your tokens and your money.

No agent modification required. No config files. No accounts.
Works with any OpenAI-compatible endpoint and Anthropic native.

## Install
npm install -g @kingimperio/lens

## Usage
# Start Lens proxy + dashboard
lens start

# Point your agent at Lens instead of the provider
# Replace: https://api.openai.com/v1
# With:    http://localhost:2337/openai
# Replace: https://integrate.api.nvidia.com/v1
# With:    http://localhost:2337/nim
# Replace: https://api.anthropic.com
# With:    http://localhost:2337/anthropic

# View session history
lens history

# Export current session as CSV
lens export

# Clear all stored data
lens clear

## Supported providers
- NVIDIA NIM (OpenAI-compatible)
- Anthropic (native API)
- Any OpenAI-compatible endpoint

## What it shows
- Live per-call token breakdown (input / output / cache hits)
- Running session cost by model
- Cost per call with cumulative total
- ctx savings delta (if ctx is active upstream)
- Session history queryable by date and model

## Tech
- Node.js
- Ink + React (terminal UI)
- http-proxy-middleware (proxy layer)
- better-sqlite3 (session persistence)
- commander (CLI)

## Privacy
All data stays local. SQLite database at ~/.lens/lens.db.
Your API keys pass through the proxy in request headers
and are never logged or stored.