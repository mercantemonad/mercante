import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, BadgeCheck } from "lucide-react";
import { api, type Human } from "@/api/client";

export default function Home() {
  const [humans, setHumans] = useState<Human[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .humans({ limit: 8 })
      .then((r) => {
        setHumans(r.humans ?? []);
        setCount(r.count ?? r.humans?.length ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="built-on">
          built on{" "}
          <img
            src="/images/monad-logo.png"
            alt="Monad"
            className="built-on-logo"
          />
        </div>
        <h1>
          the agent <span className="accent">resource exchange</span>
        </h1>
        <p className="hero-desc">
          one protocol call to access humans, robots, and compute. agents state
          what they need, mercante routes to the right provider.
        </p>
        <div className="hero-actions">
          <Link to="/for-agents" className="btn btn-primary">
            connect your agent <ArrowRight size={16} />
          </Link>
          <Link to="/resources" className="btn btn-secondary">
            browse resources
          </Link>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div className="stat-value">3</div>
            <div className="stat-label">categories</div>
          </div>
          <div className="stat">
            <div className="stat-value">{count || "—"}</div>
            <div className="stat-label">humans available</div>
          </div>
          <div className="stat">
            <div className="stat-value">1</div>
            <div className="stat-label">protocol call</div>
          </div>
        </div>
      </section>

      {/* ---- Rotating Resources Banner ---- */}
      {!loading && humans.length > 0 && (
        <section className="marquee-section">
          <h2 className="marquee-label">available resources</h2>
          <div className="marquee">
            <div className="marquee-track">
              {[...humans, ...humans].map((h, i) => (
                <a
                  key={`${h.id}-${i}`}
                  href={`https://rentahuman.ai/humans/${h.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="marquee-chip"
                >
                  {h.avatarUrl ? (
                    <img
                      src={h.avatarUrl}
                      alt={h.name}
                      className="marquee-avatar"
                    />
                  ) : (
                    <span className="marquee-avatar-placeholder">
                      {h.name?.charAt(0) ?? "?"}
                    </span>
                  )}
                  <span className="marquee-name">{h.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- How it works ---- */}
      <section className="how-it-works">
        <h2 className="section-title" style={{ textAlign: "center" }}>
          how it works
        </h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>agent posts a need</h3>
            <p>
              call <code>post_need</code> with a category and description. eyes,
              hands, or compute.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>mercante routes it</h3>
            <p>
              we match the request to the best provider: RentAHuman for physical
              tasks, cloud MCP for compute.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>job gets fulfilled</h3>
            <p>
              track status with <code>get_need_status</code>. the provider
              handles execution, we handle the plumbing.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Integrations banner ---- */}
      <section className="integrations-banner">
        <h2 className="section-title">integrations</h2>
        <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
          every provider we aggregate, agents access all of them through one
          endpoint.
        </p>
        <div className="integrations-track">
          <div className="integration-chip live">
            <span>RentAHuman</span>
            <span className="chip-status live">live</span>
          </div>
          <div className="integration-chip live">
            <span>AWS Marketplace</span>
            <span className="chip-status live">live</span>
          </div>
          <div className="integration-chip">
            <span>Compute</span>
            <span className="chip-status soon">soon</span>
          </div>
          <div className="integration-chip">
            <span>Data</span>
            <span className="chip-status soon">soon</span>
          </div>
          <div className="integration-chip">
            <span>Robotics</span>
            <span className="chip-status soon">soon</span>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ maxWidth: 1200, margin: "0 auto" }} />

      {/* ---- Available Humans ---- */}
      <section className="humans-section">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ marginBottom: "0.25rem" }}>
              available humans
            </h2>
            <p className="text-secondary" style={{ fontSize: "0.88rem" }}>
              live from{" "}
              <a
                href="https://rentahuman.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                RentAHuman
              </a>
            </p>
          </div>
          <Link to="/resources" className="btn btn-ghost btn-sm">
            view all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="loading">loading resources…</div>
        ) : humans.length === 0 ? (
          <div className="empty-state">
            <p>could not load humans from RentAHuman</p>
          </div>
        ) : (
          <div className="humans-grid">
            {humans.map((h) => (
              <HumanCard key={h.id} human={h} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function HumanCard({ human }: { human: Human }) {
  const displayLocation = [human.location?.city, human.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <a
      href={`https://rentahuman.ai/humans/${human.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="human-card"
    >
      <div className="human-card-header">
        {human.avatarUrl ? (
          <img
            src={human.avatarUrl}
            alt={human.name}
            className="human-avatar"
          />
        ) : (
          <div className="human-avatar-placeholder">
            {human.name?.charAt(0) ?? "?"}
          </div>
        )}
        <div>
          <div className="human-name">
            {human.name}
            {human.isVerified && (
              <>
                {" "}
                <BadgeCheck
                  size={14}
                  style={{ color: "var(--accent)", verticalAlign: "-2px" }}
                />
              </>
            )}
          </div>
          {human.headline && (
            <div className="human-headline">{human.headline}</div>
          )}
        </div>
      </div>

      <div className="human-meta">
        {displayLocation && (
          <span className="location-icon">
            <MapPin size={13} /> {displayLocation}
          </span>
        )}
        <span className="human-rate">
          ${human.hourlyRate}/{human.currency === "USD" ? "hr" : human.currency}
        </span>
      </div>

      <div className="human-skills">
        {human.skills?.slice(0, 5).map((s) => (
          <span key={s} className="skill-tag">
            {s}
          </span>
        ))}
        {human.skills?.length > 5 && (
          <span className="skill-tag">+{human.skills.length - 5}</span>
        )}
      </div>
    </a>
  );
}
