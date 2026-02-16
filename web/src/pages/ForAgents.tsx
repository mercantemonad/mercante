import { useState } from "react";
import { ArrowRight, Wallet, Copy, Check, Shield } from "lucide-react";
import { api } from "@/api/client";

export default function ForAgents() {
  const endpointUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/:\d+$/, "")}:8002`
      : "http://localhost:8002";

  const [wallet, setWallet] = useState<{
    address: string;
    private_key: string;
    chain: string;
    chain_id: number;
    rpc_url: string;
    instructions: string[];
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await api.createWallet();
      setWallet(res);
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="page-container-narrow">
      <h1 className="page-title">for agents</h1>
      <p className="page-subtitle">
        mercante is an MCP server. connect once, access every real-world
        resource we aggregate: humans, robots, compute. two tools, one endpoint.
      </p>

      {/* Wallet Generation */}
      <section className="for-agents-page">
        <h2>
          <Wallet size={18} style={{ verticalAlign: "-3px" }} /> get a monad
          wallet
        </h2>
        <p className="text-secondary" style={{ marginBottom: "1rem" }}>
          generate a Monad-compatible wallet to use with mercante. agents call{" "}
          <code>create_wallet</code> via MCP, or generate one here.
        </p>

        {!wallet ? (
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "generating…" : "generate wallet"}
          </button>
        ) : (
          <div className="wallet-result">
            <div className="wallet-field">
              <span className="wallet-label">address</span>
              <code className="wallet-value">{wallet.address}</code>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(wallet.address, "address")}
              >
                {copied === "address" ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <div className="wallet-field wallet-field-secret">
              <span className="wallet-label">
                <Shield size={12} /> private key
              </span>
              <code className="wallet-value wallet-secret">
                {wallet.private_key}
              </code>
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(wallet.private_key, "private_key")
                }
              >
                {copied === "private_key" ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <div className="wallet-field">
              <span className="wallet-label">chain</span>
              <code className="wallet-value">
                {wallet.chain} (ID {wallet.chain_id})
              </code>
            </div>
            <div className="wallet-field">
              <span className="wallet-label">RPC</span>
              <code className="wallet-value">{wallet.rpc_url}</code>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(wallet.rpc_url, "rpc")}
              >
                {copied === "rpc" ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="wallet-warning">
              <Shield size={14} />
              <span>
                store your private key securely — it will not be shown again.
              </span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setWallet(null)}
              style={{ marginTop: "0.75rem" }}
            >
              generate another
            </button>
          </div>
        )}

        <div className="monad-teaser">
          <h3>payments on monad</h3>
          <ul>
            <li>escrow-based payment settlement for all resource bookings</li>
            <li>
              agents fund wallets with MON and pay providers directly on-chain
            </li>
            <li>
              immutable job ledger — every agent-to-provider match recorded on
              Monad
            </li>
            <li>
              instant finality — Monad's 1s block times mean near-instant
              confirmations
            </li>
          </ul>
        </div>
      </section>

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

          <div className="tool-card">
            <h3>create_wallet</h3>
            <p>
              generate a Monad-compatible wallet for the agent. returns address,
              private key, and chain connection info.
            </p>
            <div
              className="tool-param"
              style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}
            >
              <ArrowRight size={13} />
              <span>
                returns <code>address</code>, <code>private_key</code>,{" "}
                <code>rpc_url</code>, <code>chain_id</code>
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
// → { status: "in_progress", provider_id: "rentahuman", ... }

// Generate a Monad wallet for payments
const wallet = await client.callTool("create_wallet", {});
// → { address: "0x...", private_key: "0x...", chain: "Monad", ... }`}</pre>
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
)

# Generate a Monad wallet
wallet = await client.call_tool("create_wallet", arguments={})
# → {"address": "0x...", "private_key": "0x...", "chain": "Monad"}`}</pre>
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
