# Lens

Real-time token usage and cost monitor for AI agent workflows.

Lens runs as a local proxy between your agents and AI providers.
Point your agents at `localhost:2337` instead of the provider URL.
Lens forwards every request, captures every response, and shows
you exactly what's happening to your tokens and your money.

**No agent modification required. No config files. No accounts.**
Works with any OpenAI-compatible endpoint and Anthropic native.

---

## Why Lens?

When you're running multiple AI agents in parallel, costs can spiral
unnoticed. A single agent making hundreds of calls per hour can burn
through credits before you realize what happened.

Lens gives you:
- **Visibility** — see every token, every call, every cost in real time
- **Zero friction** — just point your agent at a different URL
- **Privacy** — everything stays local, no cloud dashboard, no accounts
- **ctx tracking** — detect when context compression is saving you money

---

## Install

```bash
npm install -g @kingimperio/lens
```

Or run directly without installing:

```bash
npx @kingimperio/lens start
```

---

## Quick Start

### 1. Start the proxy

```bash
lens start
```

Lens starts a proxy server on port 2337 and opens a live dashboard
in your terminal showing token usage and costs as they happen.

### 2. Point your agent at Lens

Replace your provider's base URL with the Lens proxy URL:

| Provider | Original URL | Lens URL |
|----------|--------------|----------|
| NVIDIA NIM | `https://integrate.api.nvidia.com/v1` | `http://localhost:2337/nim` |
| OpenAI | `https://api.openai.com/v1` | `http://localhost:2337/openai` |
| Anthropic | `https://api.anthropic.com` | `http://localhost:2337/anthropic` |

Your API key stays the same — it passes through Lens unchanged.

### 3. Watch the dashboard

Lens shows live output as your agent runs:

```
● Proxy running on :2337                    0m 42s          q to quit

[14:23:01] gpt-4o-mini 1.2Kout [cache:800] $0.00
[14:23:00] gpt-4o 3.4Kin 1.2Kout $0.01
[14:22:58] claude-sonnet-4-6 2.1Kin 890out $0.02

Session Summary
────────────────────────────────────────
gpt-4o
  Input: 3.4K ($0.01)
  Output: 1.2K ($0.01)
  Calls: 1
────────────────────────────────────────
gpt-4o-mini
  Input: 0 ($0.00)
  Output: 1.2K ($0.00)
  Calls: 1
  Cache hits: 800 saved
────────────────────────────────────────
TOTAL: $0.02 (2 calls)
```

---

## Commands

### `lens start`

Start the proxy server and live dashboard.

```bash
lens start [options]

Options:
  -p, --port <port>    Port to run proxy on (default: 2337)
  --no-ui              Run without terminal UI (JSON line mode)
```

**Examples:**

```bash
# Use a custom port
lens start --port 3000

# Headless mode for scripting
lens start --no-ui

# Combine options
lens start --port 3000 --no-ui
```

The `--no-ui` flag outputs each call as a JSON line to stdout,
useful for piping to other tools or running in background:

```bash
lens start --no-ui | jq .
```

### `lens history`

View recent session history without starting the proxy.

```bash
lens history [options]

Options:
  -l, --limit <limit>    Number of sessions to show (default: 10)
```

**Output:**

```
Recent Sessions

Date                Duration    Calls   Total Cost
────────────────────────────────────────────────────
6/16/2026, 8:22 PM  17s         42      $3.24
6/16/2026, 3:10 PM  2m 15s      128     $12.80
6/15/2026, 9:45 PM  45s         8       $0.42
```

### `lens export`

Export call logs from a session to CSV.

```bash
lens export [options]

Options:
  -s, --session <id>    Session ID (default: latest)
  -f, --format <fmt>    Export format, csv only (default: csv)
```

**Example:**

```bash
# Export latest session
lens export

# Export specific session
lens export --session abc123-def456
```

**Output CSV columns:**

```
timestamp,provider,model,input_tokens,output_tokens,cache_read_tokens,cost_usd,latency_ms
2026-06-16T14:23:01.000Z,OpenAI,gpt-4o-mini,0,1200,800,0.00072,245
```

Writes to `./lens-export-[sessionId].csv` in the current directory.

### `lens clear`

Delete all stored data.

```bash
lens clear --confirm
```

Requires `--confirm` flag to prevent accidental deletion.
Without the flag, prints a warning and exits.

### `lens models`

Print the full pricing table.

```bash
lens models
```

**Output:**

```
Supported Models & Pricing

Model                                   Input/1M    Output/1M   Provider
──────────────────────────────────────────────────────────────────────
stepfun/step-3.7-flash                  Free        Free        NVIDIA NIM
meta/llama-3.3-70b-instruct             Free        Free        NVIDIA NIM
deepseek/deepseek-r1                    Free        Free        NVIDIA NIM
microsoft/phi-4                         Free        Free        NVIDIA NIM
claude-haiku-4-5-20251001               $0.80       $4.00       Anthropic
claude-sonnet-4-6                       $3.00       $15.00      Anthropic
claude-opus-4-6                         $15.00      $75.00      Anthropic
gpt-4o                                  $2.50       $10.00      OpenAI
gpt-4o-mini                             $0.15       $0.60       OpenAI
o3-mini                                 $1.10       $4.40       OpenAI

Models not in this list are tracked with zero cost and marked as estimated.
```

---

## Agent Integration

### OpenCode

Edit `opencode.json`:

```json
{
  "model": {
    "baseUrl": "http://localhost:2337/nim"
  }
}
```

### Hermes

Edit `config.yaml`:

```yaml
api_base: http://localhost:2337/nim
```

### Claude Code

```bash
ANTHROPIC_BASE_URL=http://localhost:2337/anthropic claude
```

### KiloCode CLI

```bash
KILOCODE_BASE_URL=http://localhost:2337/nim lens start
```

### Generic OpenAI-Compatible

```bash
export OPENAI_BASE_URL=http://localhost:2337/nim
export OPENAI_API_KEY=your-actual-api-key
```

Your API key is passed through Lens unchanged — it never touches
Lens's database or logs.

### Pointing ctx at Lens

If you use ctx for context management, point it at Lens to track
savings:

```bash
ctx --base-url http://localhost:2337/nim
```

Lens detects ctx compression when consecutive calls to the same
model show >20% reduction in input tokens, and displays savings
in the dashboard.

---

## Supported Providers

| Provider | Schema | Endpoint |
|----------|--------|----------|
| NVIDIA NIM | OpenAI-compatible | `/nim` |
| OpenAI | OpenAI | `/openai` |
| Anthropic | Anthropic native | `/anthropic` |

Any provider that uses the OpenAI chat completions format works
through the `/openai` or `/nim` endpoints. Add custom providers
by editing `src/proxy/providers.js`.

---

## What Lens Tracks

### Per-Call Data

- Timestamp
- Provider and model name
- Input tokens (prompt)
- Output tokens (completion)
- Cache read tokens (prompt cache hits)
- Cache write tokens (cache creation)
- Cost in USD (calculated from pricing table)
- Latency in milliseconds

### Session Aggregates

- Total tokens by model
- Total cost by model
- Number of calls per model
- Average latency per model
- Cumulative session cost

### ctx Detection

Lens automatically detects context compression when:
- Two consecutive calls to the same model show >20% input token reduction
- This signals ctx is active and compressing context

When detected, the dashboard shows:
- Before/after average input tokens
- Tokens saved per call
- Percentage reduction
- Estimated cost savings for the session

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ● Proxy running on :2337                0m 42s         q to quit │
├──────────────────────────────────┬──────────────────────────────┤
│ [14:23:01] gpt-4o-mini 1.2Kout  │ Session Summary              │
│ [14:23:00] gpt-4o 3.4Kin 1.2Kout│ ─────────────────────────── │
│ [14:22:58] claude-sonnet-4-6 ... │ gpt-4o                       │
│ [14:22:55] gpt-4o-mini 800in    │   Input: 3.4K ($0.01)        │
│ [14:22:52] gpt-4o 2.1Kin 890out │   Output: 1.2K ($0.01)       │
│                                  │   Calls: 1                   │
│                                  │ ─────────────────────────── │
│                                  │ gpt-4o-mini                   │
│                                  │   Input: 0 ($0.00)           │
│                                  │   Output: 1.2K ($0.00)       │
│                                  │   Cache hits: 800 saved      │
│                                  │ ─────────────────────────── │
│                                  │ TOTAL: $0.02 (2 calls)       │
│                                  │                              │
│                                  │ ctx not detected             │
│                                  │ Point ctx at :2337 to track  │
└──────────────────────────────────┴──────────────────────────────┘
```

### Color Coding

- **NIM calls**: cyan (free tier, zero cost)
- **Anthropic calls**: yellow
- **OpenAI calls**: green
- **Cost > $0.01**: yellow
- **Cost > $0.10**: red
- **Cache hits**: cyan badge

---

## Data Storage

All data stays local on your machine:

```
~/.lens/
├── lens.db          # SQLite database (all sessions and calls)
└── errors.log       # Error log (only written on failures)
```

### Database Schema

**sessions table:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique session identifier |
| started_at | INTEGER | Unix timestamp when session started |
| ended_at | INTEGER | Unix timestamp when session ended |
| total_input_tokens | INTEGER | Sum of all input tokens |
| total_output_tokens | INTEGER | Sum of all output tokens |
| total_cost_usd | REAL | Total cost in USD |

**calls table:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique call identifier |
| session_id | TEXT | Foreign key to sessions |
| timestamp | INTEGER | Unix timestamp of call |
| provider | TEXT | Provider name |
| model | TEXT | Model identifier |
| input_tokens | INTEGER | Input token count |
| output_tokens | INTEGER | Output token count |
| cache_read_tokens | INTEGER | Cache read tokens |
| cache_write_tokens | INTEGER | Cache write tokens |
| cost_usd | REAL | Calculated cost |
| input_cost_usd | REAL | Input portion cost |
| output_cost_usd | REAL | Output portion cost |
| is_estimated | INTEGER | 1 if model not in pricing table |
| latency_ms | INTEGER | Response time in milliseconds |

---

## Pricing

Lens maintains a pricing table for known models. Prices are per
1 million tokens.

### NVIDIA NIM (Free Tier)

| Model | Input | Output |
|-------|-------|--------|
| stepfun/step-3.7-flash | Free | Free |
| meta/llama-3.3-70b-instruct | Free | Free |
| deepseek/deepseek-r1 | Free | Free |
| microsoft/phi-4 | Free | Free |

### Anthropic

| Model | Input | Output |
|-------|-------|--------|
| claude-haiku-4-5-20251001 | $0.80 | $4.00 |
| claude-sonnet-4-6 | $3.00 | $15.00 |
| claude-opus-4-6 | $15.00 | $75.00 |
| claude-opus-4-8 | $15.00 | $75.00 |
| claude-fable-5 | $10.00 | $50.00 |

### OpenAI

| Model | Input | Output |
|-------|-------|--------|
| gpt-4o | $2.50 | $10.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| o3-mini | $1.10 | $4.40 |

**Unknown models** are tracked with zero cost and marked as
"estimated" with a `?` in the cost column. Adding new models:
edit `src/utils/costs.js` and add an entry to the `PRICING` object.

---

## Configuration

### Custom Port

```bash
lens start --port 3000
```

Or set an environment variable:

```bash
LENS_PORT=3000 lens start
```

### Non-TTY Mode

Lens automatically falls back to JSON line output when:

- Running in a non-interactive terminal
- Piped to another command
- `--no-ui` flag is used

```bash
# Pipe to jq for filtering
lens start --no-ui | jq 'select(.model == "gpt-4o")'

# Log to file
lens start --no-ui >> lens.log
```

---

## Error Handling

### Provider Unreachable

If the provider is down or unreachable, Lens returns a 502
error to the agent and logs the failure in the dashboard.
The proxy never crashes.

### Malformed Requests

Invalid requests from agents are passed through to the
provider. Lens does not validate or modify request bodies.

### Database Failures

If the database write fails (disk full, permissions), Lens:
1. Logs the error to `~/.lens/errors.log`
2. Continues running the proxy
3. Does not interrupt the agent

Monitoring is secondary to the actual agent task.

### Port Already in Use

```
Port 2337 is in use. Run lens start --port [other]
```

### Ink Not Supported

If the terminal doesn't support Ink (non-TTY), Lens
automatically falls back to JSON line mode.

---

## Privacy

- All data stays local on your machine
- SQLite database at `~/.lens/lens.db`
- API keys pass through the proxy in request headers
- Keys are never logged or stored
- No telemetry, no analytics, no external calls
- Open source — inspect the code yourself

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  AI Agent   │────▶│ Lens Proxy   │────▶│ Provider API    │
│ (opencode,  │◀────│ :2337        │◀────│ (OpenAI, NIM,   │
│  claude,    │     │              │     │  Anthropic)     │
│  kilo)      │     └──────┬───────┘     └─────────────────┘
└─────────────┘            │
                           │ captures
                           ▼
                    ┌──────────────┐
                    │ SQLite DB    │
                    │ ~/.lens/     │
                    └──────┬───────┘
                           │ emits events
                           ▼
                    ┌──────────────┐
                    │ Ink UI       │
                    │ (terminal)   │
                    └──────────────┘
```

### Request Flow

1. Agent sends request to `localhost:2337/nim/v1/chat/completions`
2. Lens strips `/nim` prefix, forwards to `https://integrate.api.nvidia.com/v1/chat/completions`
3. Provider responds with completion + usage data
4. Lens captures the response, extracts tokens, calculates cost
5. Lens writes call record to SQLite
6. Lens emits event to UI, which re-renders
7. Lens pipes the response back to the agent — **unmodified**

The agent receives exactly what the provider sent. Lens is
a transparent observer.

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/KingImperio/lens.git
cd lens
npm install
```

### Run in Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Project Structure

```
src/
├── cli.js                      # Entry point, commander setup
├── proxy/
│   ├── server.js               # Express + proxy middleware
│   ├── interceptor.js          # Request/response capture
│   └── providers.js            # Provider URL mapping + schema
├── ui/
│   ├── Dashboard.jsx           # Root Ink component
│   └── components/
│       ├── CallLog.jsx         # Scrolling per-call feed
│       ├── SessionSummary.jsx  # Running totals panel
│       ├── CtxPanel.jsx        # ctx savings panel
│       └── StatusBar.jsx       # Proxy status + keybinds
├── db/
│   ├── database.js             # SQLite init + schema
│   └── queries.js              # All DB operations
├── utils/
│   ├── costs.js                # Pricing table + calculations
│   ├── parseUsage.js           # Extract tokens from responses
│   └── formatters.js           # Number/currency/time formatting
└── commands/
    ├── start.js                # lens start command
    ├── history.js              # lens history command
    ├── export.js               # lens export command
    └── models.js               # lens models command
```

### Dependencies

| Package | Purpose |
|---------|---------|
| ink | Terminal UI framework |
| react | Component rendering (for Ink) |
| http-proxy-middleware | Proxy layer |
| express | HTTP server |
| better-sqlite3 | Local database |
| commander | CLI argument parsing |
| chalk | Terminal colors |
| figures | Unicode symbols |
| esbuild | Build tool |

---

## Troubleshooting

### "Port 2337 is in use"

Another process is using the port. Either stop it or use a
different port:

```bash
lens start --port 3000
```

### "No calls showing in dashboard"

1. Verify your agent is pointing at the correct Lens URL
2. Check that the provider URL matches the endpoint:
   - NVIDIA NIM → `http://localhost:2337/nim`
   - OpenAI → `http://localhost:2337/openai`
   - Anthropic → `http://localhost:2337/anthropic`
3. Ensure your API key is valid (Lens passes it through)

### "Cost shows ? for all calls"

Your model isn't in the pricing table. Add it to
`src/utils/costs.js`:

```javascript
export const PRICING = {
  "your-model-name": { input: 1.00, output: 2.00 },
  // ...
}
```

### "Dashboard is blank"

Try restarting:

```bash
lens clear --confirm
lens start
```

### "Database is locked"

Close any other Lens instances before starting a new one.
SQLite allows only one writer at a time.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Build with `npm run build`
6. Submit a pull request

---

## License

MIT

---

## Acknowledgments

Built to solve the problem of invisible AI costs in
multi-agent development workflows. When your agents are
burning through tokens at 3 AM, Lens lets you see exactly
where the money is going.