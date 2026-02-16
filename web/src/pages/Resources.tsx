import { useEffect, useState } from "react";
import {
  Eye,
  Hand,
  Cpu,
  MapPin,
  BadgeCheck,
  Search,
  Package,
  Database,
  Bot,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  api,
  type Human,
  type Resource,
  type SoftwareSolution,
} from "@/api/client";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  eyes: <Eye size={22} />,
  hands: <Hand size={22} />,
  software: <Package size={22} />,
  compute: <Cpu size={22} />,
  data: <Database size={22} />,
  robotics: <Bot size={22} />,
};

type SearchTab = "humans" | "software";

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified search state
  const [tab, setTab] = useState<SearchTab>("humans");
  const [query, setQuery] = useState("");

  // Data
  const [humans, setHumans] = useState<Human[]>([]);
  const [solutions, setSolutions] = useState<SoftwareSolution[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    api
      .resources()
      .then((r) => setResources(r.resources))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch based on active tab + query
  useEffect(() => {
    setDataLoading(true);
    if (tab === "humans") {
      const params: { limit: number; skill?: string } = { limit: 20 };
      if (query.trim()) params.skill = query.trim();
      api
        .humans(params)
        .then((r) => setHumans(r.humans ?? []))
        .catch(() => {})
        .finally(() => setDataLoading(false));
    } else {
      api
        .software({
          q: query.trim() || "cloud infrastructure",
          limit: 6,
        })
        .then((r) => setSolutions(r.solutions ?? []))
        .catch(() => {})
        .finally(() => setDataLoading(false));
    }
  }, [tab, query]);

  const liveResources = resources.filter((r) => r.status === "live");
  const comingSoon = resources.filter((r) => r.status === "coming_soon");

  return (
    <div className="page-container">
      <h1 className="page-title">resources</h1>
      <p className="page-subtitle">
        real-world capabilities aggregated from multiple MCP providers. one
        protocol call through mercante accesses all of them.
      </p>

      {/* Live category cards */}
      {!loading && (
        <div className="category-cards">
          {liveResources.map((r) => (
            <div key={r.id} className="category-card">
              <div className="category-card-icon">
                {CATEGORY_ICONS[r.id] ?? <Cpu size={22} />}
              </div>
              <h3>{r.name}</h3>
              <p>{r.description}</p>
              <div className="category-provider">
                <span className="label">provider:</span>
                <strong>{r.provider}</strong>
                {r.provider_url && (
                  <a
                    href={r.provider_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.provider_url.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coming soon cards */}
      {!loading && comingSoon.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: "1rem" }}>
            coming soon
          </h2>
          <div className="category-cards" style={{ marginBottom: "3rem" }}>
            {comingSoon.map((r) => (
              <div key={r.id} className="category-card coming-soon-card">
                <div className="category-card-icon coming-soon-icon">
                  {CATEGORY_ICONS[r.id] ?? <Cpu size={22} />}
                </div>
                <h3>
                  {r.name}{" "}
                  <span className="coming-soon-badge">coming soon</span>
                </h3>
                <p>{r.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="divider" />

      {/* Unified search */}
      <h2 className="section-title">search resources</h2>

      <div className="search-tabs">
        <button
          className={`search-tab ${tab === "humans" ? "active" : ""}`}
          onClick={() => {
            setTab("humans");
            setQuery("");
          }}
        >
          humans
        </button>
        <button
          className={`search-tab ${tab === "software" ? "active" : ""}`}
          onClick={() => {
            setTab("software");
            setQuery("");
          }}
        >
          software
        </button>
      </div>

      <p
        className="text-secondary"
        style={{ marginBottom: "1rem", fontSize: "0.85rem" }}
      >
        {tab === "humans" ? (
          <>
            live from{" "}
            <a
              href="https://rentahuman.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              RentAHuman
            </a>
          </>
        ) : (
          <>
            live from{" "}
            <a
              href="https://aws.amazon.com/marketplace"
              target="_blank"
              rel="noopener noreferrer"
            >
              AWS Marketplace
            </a>{" "}
            via MCP
          </>
        )}
      </p>

      <div className="search-bar">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="search-input"
            placeholder={
              tab === "humans"
                ? "search by skill (e.g. Photography, Delivery, Meetings…)"
                : "search software (e.g. monitoring, security, database, AI/ML…)"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>
      </div>

      {/* Results */}
      {dataLoading ? (
        <div className="loading">
          loading {tab === "humans" ? "humans" : "solutions"}…
        </div>
      ) : tab === "humans" ? (
        humans.length === 0 ? (
          <div className="empty-state">
            <p className="text-secondary">
              {query
                ? `no humans found for "${query}"`
                : "could not load humans"}
            </p>
          </div>
        ) : (
          <div className="humans-grid">
            {humans.map((h) => (
              <HumanCard key={h.id} human={h} />
            ))}
          </div>
        )
      ) : solutions.length === 0 ? (
        <div className="empty-state">
          <p className="text-secondary">no solutions found</p>
        </div>
      ) : (
        <div className="software-grid">
          {solutions.map((s) => (
            <SolutionCard key={s.solution_id} solution={s} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

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

function SolutionCard({ solution }: { solution: SoftwareSolution }) {
  return (
    <a
      href={solution.solution_url}
      target="_blank"
      rel="noopener noreferrer"
      className="solution-card"
    >
      <div className="solution-card-top">
        <h3 className="solution-name">{solution.solution_name}</h3>
        <ExternalLink size={14} className="solution-link-icon" />
      </div>
      <p className="solution-vendor">{solution.vendor_name}</p>
      <p className="solution-desc">
        {solution.solution_description?.length > 140
          ? solution.solution_description.slice(0, 140) + "…"
          : solution.solution_description}
      </p>
      {solution.reviews_summary &&
        solution.reviews_summary.reviews_count > 0 && (
          <div className="solution-rating">
            <Star size={13} />
            <span>{solution.reviews_summary.average_rating.toFixed(1)}</span>
            <span className="text-muted">
              ({solution.reviews_summary.reviews_count})
            </span>
          </div>
        )}
    </a>
  );
}
