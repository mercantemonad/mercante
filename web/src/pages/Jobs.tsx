import { useEffect, useState } from "react";
import { api, type Job } from "@/api/client";
import { Plus, X } from "lucide-react";

const STATUS_OPTIONS = ["", "created", "in_progress", "completed", "failed"];
const CATEGORY_OPTIONS = [
  "",
  "eyes",
  "hands",
  "software",
  "compute",
  "data",
  "robotics",
];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formCat, setFormCat] = useState("eyes");
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadJobs = () => {
    setLoading(true);
    api
      .jobs({
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
      })
      .then((r) => setJobs(r.jobs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadJobs, [statusFilter, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) return;
    setSubmitting(true);
    try {
      await api.createJob({ category: formCat, description: formDesc.trim() });
      setFormDesc("");
      setShowForm(false);
      loadJobs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="jobs-header">
        <div>
          <h1 className="page-title">jobs</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            needs submitted via the MCP or the web. track status in real time.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <X size={14} /> cancel
            </>
          ) : (
            <>
              <Plus size={14} /> submit a need
            </>
          )}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <form className="submit-need-form" onSubmit={handleSubmit}>
          <h3>new need</h3>
          <div className="form-row">
            <div className="form-group" style={{ minWidth: 140 }}>
              <label>category</label>
              <select
                value={formCat}
                onChange={(e) => setFormCat(e.target.value)}
              >
                <option value="eyes">eyes</option>
                <option value="hands">hands</option>
                <option value="software">software</option>
                <option value="compute">compute</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label>description</label>
              <input
                type="text"
                placeholder="what do you need done?"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !formDesc.trim()}
                style={{ marginTop: "auto" }}
              >
                {submitting ? "submitting…" : "post need"}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && <div className="error-msg">{error}</div>}

      {/* Filters */}
      <div className="filters" style={{ marginBottom: "1rem" }}>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.replace("_", " ") : "all statuses"}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c || "all"} value={c}>
              {c || "all categories"}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <p>no jobs match your filters.</p>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            submit a need above or call <code>post_need</code> via the MCP
            server.
          </p>
        </div>
      ) : (
        <div className="jobs-table-wrap">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>need id</th>
                <th>category</th>
                <th>description</th>
                <th>provider</th>
                <th>status</th>
                <th>created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.need_id}>
                  <td className="need-id">{j.need_id.slice(0, 8)}…</td>
                  <td>{j.category}</td>
                  <td className="desc">
                    {j.description.length > 60
                      ? j.description.slice(0, 60) + "…"
                      : j.description}
                  </td>
                  <td className="text-secondary">{j.provider_id ?? "—"}</td>
                  <td>
                    <span className={`status status-${j.status}`}>
                      {j.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="text-muted" style={{ whiteSpace: "nowrap" }}>
                    {new Date(j.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
