"""
Mercante MCP server: post_need and get_need_status.
Agents connect here; we route to providers and persist in DB.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv

from db import create_need, get_need, init_db
from router import route_need

load_dotenv()

from fastmcp import FastMCP

mcp = FastMCP("Mercante")

init_db()


@mcp.tool()
def post_need(
    category: str,
    description: str,
    constraints: dict | None = None,
) -> dict:
    """
    Submit a need for a real-world resource. Categories: eyes, hands, compute.
    Returns need_id and routing plan. Use get_need_status(need_id) to poll.
    """
    category = category.lower()
    if category not in ("eyes", "hands", "compute"):
        return {
            "error": f"Invalid category '{category}'. Use: eyes, hands, compute.",
            "need_id": None,
            "plan": None,
        }
    constraints = constraints or {}
    plan = route_need(category, description, constraints)
    need_id = create_need(
        category=category,
        description=description,
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


@mcp.tool()
def get_need_status(need_id: str) -> dict:
    """
    Get status of a previously submitted need. Returns status, provider job IDs, and progress info.
    """
    need = get_need(need_id)
    if not need:
        return {"error": f"No need found for need_id: {need_id}"}
    return {
        "need_id": need["need_id"],
        "status": need["status"],
        "category": need["category"],
        "provider_id": need.get("provider_id"),
        "provider_job_id": need.get("provider_job_id"),
        "plan_summary": need.get("plan_summary"),
        "created_at": need.get("created_at"),
        "updated_at": need.get("updated_at"),
    }


if __name__ == "__main__":
    port = int(os.getenv("MERCANTE_MCP_PORT", "8002"))
    mcp.run(transport="streamable-http", host="0.0.0.0", port=port)
