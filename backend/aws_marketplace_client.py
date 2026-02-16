"""
Client for AWS Marketplace MCP server.
Handles session init, tool calls, and stateless search/get.
"""
from __future__ import annotations

import uuid
from typing import Any

import httpx

AWS_MCP_URL = "https://marketplace-mcp.us-east-1.api.aws/mcp"
TIMEOUT = 20.0

HEADERS_BASE = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
}


async def _init_session() -> str:
    """Initialize an MCP session and return the server-assigned session ID."""
    client_session = str(uuid.uuid4())
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            AWS_MCP_URL,
            headers={**HEADERS_BASE, "mcp-session-id": client_session},
            json={
                "jsonrpc": "2.0",
                "id": 0,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2025-06-18",
                    "capabilities": {},
                    "clientInfo": {"name": "mercante", "version": "0.1.0"},
                },
            },
        )
        resp.raise_for_status()
        server_session = resp.headers.get("mcp-session-id", client_session)
        return server_session


async def _call_tool(session_id: str, tool_name: str, arguments: dict, req_id: int = 1) -> dict[str, Any]:
    """Call an MCP tool and return the structured result."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            AWS_MCP_URL,
            headers={**HEADERS_BASE, "mcp-session-id": session_id},
            json={
                "jsonrpc": "2.0",
                "id": req_id,
                "method": "tools/call",
                "params": {"name": tool_name, "arguments": arguments},
            },
        )
        resp.raise_for_status()
        data = resp.json()
        result = data.get("result", {})
        if result.get("isError"):
            text = result.get("content", [{}])[0].get("text", "Unknown error")
            raise RuntimeError(f"AWS MCP error: {text}")
        return result.get("structuredContent") or result


async def search_solutions(query: str, max_results: int = 6) -> list[dict[str, Any]]:
    """Search AWS Marketplace for software solutions."""
    session_id = await _init_session()
    result = await _call_tool(session_id, "search_aws_marketplace_solutions", {
        "queries": [query],
        "max_results": max_results,
    })
    return result.get("results", [])


async def get_solution(solution_id: str) -> dict[str, Any]:
    """Get detailed info about a specific AWS Marketplace solution."""
    session_id = await _init_session()
    result = await _call_tool(session_id, "get_aws_marketplace_solution", {
        "solution_id": solution_id,
    })
    return result
