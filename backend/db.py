"""
Simple SQLite persistence for Mercante needs (jobs).
Shared by the REST API and the MCP server.
"""
from __future__ import annotations

import sqlite3
import uuid
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "mercante.db"

_STATUSES = ("created", "in_progress", "completed", "failed")
_CATEGORIES = ("eyes", "hands", "compute", "software", "data", "robotics")


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS needs (
                need_id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                constraints_json TEXT,
                status TEXT NOT NULL DEFAULT 'created',
                provider_id TEXT,
                provider_job_id TEXT,
                plan_summary TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()


def create_need(
    category: str,
    description: str,
    constraints: dict[str, Any] | None = None,
    provider_id: str | None = None,
    provider_job_id: str | None = None,
    plan_summary: str | None = None,
) -> str:
    import json
    from datetime import datetime, timezone
    need_id = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc).isoformat()
    constraints_json = json.dumps(constraints or {})
    with _get_conn() as conn:
        conn.execute(
            """
            INSERT INTO needs (
                need_id, category, description, constraints_json,
                status, provider_id, provider_job_id, plan_summary,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'created', ?, ?, ?, ?, ?)
            """,
            (
                need_id,
                category.lower(),
                description,
                constraints_json,
                provider_id,
                provider_job_id,
                plan_summary,
                now,
                now,
            ),
        )
        conn.commit()
    return need_id


def get_need(need_id: str) -> dict[str, Any] | None:
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM needs WHERE need_id = ?", (need_id,)
        ).fetchone()
    if not row:
        return None
    import json
    d = dict(row)
    if d.get("constraints_json"):
        d["constraints"] = json.loads(d["constraints_json"])
    d.pop("constraints_json", None)
    return d


def update_need_status(
    need_id: str,
    status: str,
    provider_job_id: str | None = None,
) -> bool:
    from datetime import datetime, timezone
    if status not in _STATUSES:
        return False
    now = datetime.now(tz=timezone.utc).isoformat()
    with _get_conn() as conn:
        if provider_job_id is not None:
            conn.execute(
                "UPDATE needs SET status = ?, provider_job_id = ?, updated_at = ? WHERE need_id = ?",
                (status, provider_job_id, now, need_id),
            )
        else:
            conn.execute(
                "UPDATE needs SET status = ?, updated_at = ? WHERE need_id = ?",
                (status, now, need_id),
            )
        conn.commit()
        return conn.total_changes > 0


def list_needs(
    status: str | None = None,
    category: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    import json
    conditions: list[str] = []
    params: list[Any] = []
    if status:
        conditions.append("status = ?")
        params.append(status)
    if category:
        conditions.append("category = ?")
        params.append(category.lower())
    where = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    with _get_conn() as conn:
        q = "SELECT * FROM needs" + where + " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(q, params).fetchall()
    out = []
    for row in rows:
        d = dict(row)
        if d.get("constraints_json"):
            d["constraints"] = json.loads(d["constraints_json"])
        d.pop("constraints_json", None)
        out.append(d)
    return out
