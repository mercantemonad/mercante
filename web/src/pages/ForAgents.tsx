import { ArrowRight } from "lucide-react";

export default function ForAgents() {
  const endpointUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/:\d+$/, "")}:8002`
      : "http://localhost:8002";

  return (
    <div className="page-container-narrow">
      <h1 className="page-title">for agents</h1>
      <p className="page-subtitle">
        mercante is an MCP server. connect once, access every real-world
        resource we aggregate — humans, robots, compute. two tools, one
        endpoint.
      </p>

      {/* Connection */}
      <section className="for-agents-page">
        <h2>connection</h2>
        <div className="connection-box">
          <div className="connection-item">
            <span className="label">endpoint</span>
            <code>{endpointUrl}</code>
          </div>
          <div className="connection-item">
            <span className="label">transport</span>
            <code>streamable-http</code>
          </div>
          <div className="connection-item">
            <span className="label">auth</span>
            <span className="text-secondary">
              none in v1 — production will use API keys
            </span>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="for-agents-page">
        <h2>tools</h2>
        <div className="tools-grid">
          <div className="tool-card">
            <h3>post_need</h3>
            <p>
              submit a need for a real-world resource. mercante routes it to the
              right provider and returns a tracking id.
            </p>
            <div className="tool-param">
              <code>category</code>
              <span>"eyes" | "hands" | "compute"</span>
            </div>
            <div className="tool-param">
              <code>description</code>
              <span>free-text description of the task</span>
            </div>
            <div className="tool-param">
              <code>constraints</code>
              <span>optional — budget, location, time window</span>
            </div>
            <div
              className="tool-param"
              style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}
            >
              <ArrowRight size={13} />
              <span>
                returns <code>need_id</code> + routing plan
              </span>
            </div>
          </div>

          <div className="tool-card">
            <h3>get_need_status</h3>
            <p>
              poll the status of a previously submitted need. returns provider
              info and progress.
            </p>
            <div className="tool-param">
              <code>need_id</code>
              <span>the id returned by post_need</span>
            </div>
            <div
              className="tool-param"
              style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}
            >
              <ArrowRight size={13} />
              <span>
                returns <code>status</code>, <code>provider_id</code>,{" "}
                <code>provider_job_id</code>, timestamps
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TypeScript example */}
      <section className="for-agents-page">
        <h2>example: typescript</h2>
        <pre className="code-block">{`// Connect to Mercante MCP (e.g. via @modelcontextprotocol/sdk)

const result = await client.callTool("post_need", {
  category: "eyes",
  description: "Confirm store hours at 123 Main St",
  constraints: { location: "San Francisco" }
});
// → { need_id: "abc-123", plan: { provider: "rentahuman", ... } }

const status = await client.callTool("get_need_status", {
  need_id: "abc-123"
});
// → { status: "in_progress", provider_id: "rentahuman", ... }`}</pre>
      </section>

      {/* Python example */}
      <section className="for-agents-page">
        <h2>example: python</h2>
        <pre className="code-block">{`# Using an MCP client that supports Streamable HTTP
# Server URL: ${endpointUrl}

result = await client.call_tool("post_need", arguments={
    "category": "hands",
    "description": "Pick up package and deliver to 456 Oak Ave",
    "constraints": {"budget_usd": 25}
})
# → {"need_id": "...", "plan": {"provider": "rentahuman", ...}}

status = await client.call_tool("get_need_status",
    arguments={"need_id": result["need_id"]}
)`}</pre>
      </section>

      {/* Payloads */}
      <section className="for-agents-page">
        <h2>example payloads by category</h2>
        <table className="payload-table">
          <thead>
            <tr>
              <th>category</th>
              <th>payload</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="text-accent">eyes</code>
              </td>
              <td>
                <code>
                  {
                    '{ "category": "eyes", "description": "Verify opening hours at 123 Main St" }'
                  }
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code className="text-accent">hands</code>
              </td>
              <td>
                <code>
                  {
                    '{ "category": "hands", "description": "Deliver envelope to 456 Oak Ave", "constraints": { "location": "NYC" } }'
                  }
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <code className="text-accent">compute</code>
              </td>
              <td>
                <code>
                  {
                    '{ "category": "compute", "description": "Run 2vCPU batch job for 1 hour" }'
                  }
                </code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
