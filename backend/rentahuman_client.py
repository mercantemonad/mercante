"""
Client for the RentAHuman REST API.
Proxies requests so the Mercante frontend doesn't need to call RentAHuman directly.
"""
from __future__ import annotations

import httpx
from typing import Any

RENTAHUMAN_BASE = "https://rentahuman.ai/api"
TIMEOUT = 15.0


async def fetch_humans(
    skill: str | None = None,
    max_rate: float | None = None,
    name: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> dict[str, Any]:
    """Search / list available humans on RentAHuman."""
    params: dict[str, Any] = {"limit": limit}
    if skill:
        params["skill"] = skill
    if max_rate is not None:
        params["maxRate"] = max_rate
    if name:
        params["name"] = name
    if offset:
        params["offset"] = offset
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{RENTAHUMAN_BASE}/humans", params=params)
        resp.raise_for_status()
        return resp.json()


async def fetch_human(human_id: str) -> dict[str, Any]:
    """Get a single human's profile."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{RENTAHUMAN_BASE}/humans/{human_id}")
        resp.raise_for_status()
        return resp.json()
