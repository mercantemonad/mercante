"""
Mercante REST API — resources, jobs, and provider proxies.
Run: uvicorn api_main:app --reload --port 8008
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import init_db, list_needs, get_need, create_need
from router import route_need
from rentahuman_client import fetch_humans, fetch_human
from aws_marketplace_client import search_solutions, get_solution

init_db()

app = FastAPI(
    title="Mercante API",
    description="Agent resource exchange — resources, jobs, and provider proxies.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static catalog
# ---------------------------------------------------------------------------
RESOURCES = [
    {
        "id": "eyes",
        "name": "Eyes",
        "description": "Human observers on the ground: verify locations, read signs, capture photos.",
        "provider": "RentAHuman",
        "provider_url": "https://rentahuman.ai",
        "status": "live",
    },
    {
        "id": "hands",
        "name": "Hands",
        "description": "Physical tasks: deliveries, assembly, in-person errands.",
        "provider": "RentAHuman",
        "provider_url": "https://rentahuman.ai",
        "status": "live",
    },
    {
        "id": "software",
        "name": "Software",
        "description": "Cloud software and SaaS: monitoring, security, databases, AI/ML tools.",
        "provider": "AWS Marketplace",
        "provider_url": "https://aws.amazon.com/marketplace",
        "status": "live",
    },
    {
        "id": "compute",
        "name": "Compute",
        "description": "GPU instances, batch jobs, serverless functions, and raw infrastructure.",
        "provider": "Coming soon",
        "provider_url": None,
        "status": "coming_soon",
    },
    {
        "id": "data",
        "name": "Data",
        "description": "Datasets, data feeds, web scraping, and enrichment services.",
        "provider": "Coming soon",
        "provider_url": None,
        "status": "coming_soon",
    },
    {
        "id": "robotics",
        "name": "Robotics",
        "description": "Rent robots, drones, and autonomous fleets for physical-world automation.",
        "provider": "Coming soon",
        "provider_url": None,
        "status": "coming_soon",
    },
]


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "mercante"}


# ---------------------------------------------------------------------------
# Resources catalog
# ---------------------------------------------------------------------------
@app.get("/api/resources")
def resources():
    return {"resources": RESOURCES}


# ---------------------------------------------------------------------------
# RentAHuman proxy
# ---------------------------------------------------------------------------
@app.get("/api/humans")
async def list_humans(
    skill: str | None = None,
    maxRate: float | None = None,
    name: str | None = None,
    limit: int = 20,
    offset: int = 0,
):
    """Proxy search to RentAHuman REST API."""
    try:
        data = await fetch_humans(
            skill=skill, max_rate=maxRate, name=name, limit=limit, offset=offset
        )
        return data
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"RentAHuman API error: {exc}")


@app.get("/api/humans/{human_id}")
async def get_human_detail(human_id: str):
    """Proxy single-human lookup to RentAHuman."""
    try:
        data = await fetch_human(human_id)
        return data
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"RentAHuman API error: {exc}")


# ---------------------------------------------------------------------------
# AWS Marketplace proxy
# ---------------------------------------------------------------------------
@app.get("/api/software")
async def search_software(q: str = "cloud infrastructure", limit: int = 6):
    """Search AWS Marketplace for software solutions via their MCP."""
    try:
        results = await search_solutions(query=q, max_results=limit)
        return {"success": True, "solutions": results, "count": len(results)}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AWS Marketplace MCP error: {exc}")


@app.get("/api/software/{solution_id}")
async def get_software_detail(solution_id: str):
    """Get a single AWS Marketplace solution detail."""
    try:
        data = await get_solution(solution_id)
        return {"success": True, "solution": data}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AWS Marketplace MCP error: {exc}")


# ---------------------------------------------------------------------------
# Jobs (needs)
# ---------------------------------------------------------------------------
class CreateNeedBody(BaseModel):
    category: str
    description: str
    constraints: dict[str, Any] | None = None


@app.post("/api/jobs")
def create_job(body: CreateNeedBody):
    """Create a need from the web UI (same logic as the MCP post_need tool)."""
    category = body.category.lower()
    valid = ("eyes", "hands", "software", "compute", "data", "robotics")
    if category not in valid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Use: {', '.join(valid)}.",
        )
    constraints = body.constraints or {}
    plan = route_need(category, body.description, constraints)
    need_id = create_need(
        category=category,
        description=body.description,
        constraints=constraints,
        provider_id=plan.get("provider_id"),
        provider_job_id=plan.get("provider_job_id"),
        plan_summary=plan.get("plan_summary"),
    )
    return {
        "need_id": need_id,
        "plan": {
            "provider": plan.get("provider_id"),
            "provider_job_id": plan.get("provider_job_id"),
            "summary": plan.get("plan_summary"),
        },
    }


@app.get("/api/jobs")
def jobs(status: str | None = None, category: str | None = None):
    items = list_needs(status=status, category=category)
    return {"jobs": items}


@app.get("/api/jobs/{need_id}")
def job_detail(need_id: str):
    need = get_need(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Need not found")
    return need


# ---------------------------------------------------------------------------
# Wallet generation (Monad)
# ---------------------------------------------------------------------------
MONAD_CHAIN_ID = 10143
MONAD_RPC = "https://testnet-rpc.monad.xyz"

@app.post("/api/wallet/create")
def create_wallet():
    from eth_account import Account
    acct = Account.create()
    return {
        "address": acct.address,
        "private_key": acct.key.hex(),
        "chain": "Monad",
        "chain_id": MONAD_CHAIN_ID,
        "rpc_url": MONAD_RPC,
        "instructions": [
            f"Your Monad wallet address: {acct.address}",
            "Store your private key securely — it will not be shown again.",
            f"Connect to Monad via RPC: {MONAD_RPC} (chain ID {MONAD_CHAIN_ID})",
            "Fund your wallet with MON to pay for agent resource transactions.",
            "Mercante will soon support direct payment settlement on Monad for all resource bookings.",
        ],
    }
