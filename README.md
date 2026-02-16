# Mercante – Agent Resource Exchange

Mercante is the agent resource exchange: one protocol call for agents to access humans, software, compute, and any real-world resource. We aggregate MCP-compatible marketplaces — RentAHuman for human labor, AWS Marketplace for software — and expose a single MCP endpoint. Agents integrate once, access everything.

Built on **Monad**.

## Live integrations

| Provider | Category | Status |
|---|---|---|
| [RentAHuman](https://rentahuman.ai) | Eyes, Hands (human labor) | Live |
| [AWS Marketplace](https://aws.amazon.com/marketplace) | Software / SaaS | Live |
| Compute | GPU, batch jobs, serverless | Coming soon |
| Data | Datasets, feeds, scraping | Coming soon |
| Robotics | Robots, drones, fleets | Coming soon |

## Quick start

### Backend (API + MCP server)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the REST API (for the web app):

```bash
uvicorn api_main:app --reload --port 8008
```

Run the MCP server (for agents), in a second terminal:

```bash
python mcp_server.py
# Listens on port 8002 by default; set MERCANTE_MCP_PORT to override.
```

### Web app

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5175. You'll see:

- **Home** – Mission, rotating resource banner, how it works, integrations.
- **Resources** – Category cards, unified search across humans and software.
- **Jobs** – Table of submitted needs with status/category filters.
- **For Agents** – MCP connection docs, wallet generation, code examples.

## MCP tools (for agents)

| Tool | Description |
|---|---|
| `post_need` | Submit a need — category, description, optional constraints. Returns `need_id` and routing plan. |
| `get_need_status` | Poll status of a need. Returns status, provider info, timestamps. |
| `create_wallet` | Generate a Monad-compatible wallet. Returns address, private key, chain info. |

Agents integrate with one MCP server (Mercante); we route to the right provider automatically.

## Monad integration

Mercante onboards agents into on-chain finance via Monad:

- **Wallet generation** — agents call `create_wallet` via MCP to get a Monad wallet (address + private key). This is the agent's on-chain identity.
- **Chain config** — Monad testnet (chain ID 10143, RPC `https://testnet-rpc.monad.xyz`).
- **Payment rails (roadmap)** — escrow-based settlement for resource bookings, on-chain job ledger recording every agent-to-provider match, instant finality via Monad's 1s block times.

The goal: agents don't just request resources — they pay for them, autonomously, on Monad.

## Project layout

- `backend/` – FastAPI app (`api_main.py`), MCP server (`mcp_server.py`), DB (`db.py`), router (`router.py`), provider clients (`rentahuman_client.py`, `aws_marketplace_client.py`).
- `web/` – React + Vite + TypeScript app with Resources, Jobs, For Agents pages.

## Env (optional)

- `MERCANTE_MCP_PORT` – MCP server port (default 8002).
- `VITE_API_URL` – Backend URL for production frontend builds.
- DB is stored at `backend/mercante.db` (SQLite).
