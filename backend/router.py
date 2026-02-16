"""
Route a need to the appropriate provider.
Returns provider_id, provider_job_id (or placeholder), and plan_summary.
"""
from __future__ import annotations

from typing import Any


def route_need(category: str, description: str, constraints: dict[str, Any] | None) -> dict[str, Any]:
    category = category.lower()
    constraints = constraints or {}

    if category in ("eyes", "hands"):
        return {
            "provider_id": "rentahuman",
            "provider_job_id": f"rah-{category}-stub",
            "plan_summary": f"Routed to RentAHuman for '{category}': {description[:80]}…",
        }

    if category == "software":
        return {
            "provider_id": "aws-marketplace",
            "provider_job_id": "aws-mcp-search",
            "plan_summary": f"Routed to AWS Marketplace MCP for software search: {description[:80]}…",
        }

    if category == "compute":
        return {
            "provider_id": "compute-provider",
            "provider_job_id": "compute-stub",
            "plan_summary": f"Routed to compute provider (coming soon): {description[:80]}…",
        }

    if category == "data":
        return {
            "provider_id": "data-provider",
            "provider_job_id": "data-stub",
            "plan_summary": f"Routed to data provider (coming soon): {description[:80]}…",
        }

    if category == "robotics":
        return {
            "provider_id": "robotics-provider",
            "provider_job_id": "robotics-stub",
            "plan_summary": f"Routed to robotics provider (coming soon): {description[:80]}…",
        }

    return {
        "provider_id": "unknown",
        "provider_job_id": None,
        "plan_summary": f"Unknown category '{category}'; no provider selected.",
    }
