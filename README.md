# Mercante – Agent Resource Exchange

Mercante is a unified agent resource exchange: one interface where agents and humans can see and request real-world capabilities (eyes, hands, compute). In v1 we route requests to existing MCP-compatible providers and expose a single MCP endpoint for agents.

## Quick start

### Backend (API + DB)

```bash
cd mercante/backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Run the REST API (for the web app):

```bash
uvicorn api_main:app --reload --port 8006
```

Run the MCP server (for agents), in a second terminal:

```bash
python mcp_server.py
# Listens on port 8002 by default; set MERCANTE_MCP_PORT to override.
```

### Web app

```bash
cd mercante/web
npm install
npm run dev
```

Open http://localhost:5174. You’ll see:

- **Resources** – Categories (Eyes, Hands, Compute) and which providers back each.
- **Jobs** – Table of submitted needs with status filters.
- **For Agents** – Docs and code snippets for connecting to Mercante as an MCP server.

## MCP tools (for agents)

- **post_need** – `category` (eyes | hands | compute), `description`, optional `constraints`. Returns `need_id` and routing plan.
- **get_need_status** – `need_id`. Returns status, provider job IDs, and progress info.

Agents integrate with one MCP server (Mercante); we route to RentAHuman for eyes/hands and to a cloud MCP (stubbed in v1) for compute.

## Project layout

- `backend/` – FastAPI app (`api_main.py`), MCP server (`mcp_server.py`), DB (`db.py`), router (`router.py`).
- `web/` – React + Vite app: Resources, Jobs, For Agents pages.

## Env (optional)

- `MERCANTE_MCP_PORT` – MCP server port (default 8002).
- DB is stored at `backend/mercante.db` (SQLite).
