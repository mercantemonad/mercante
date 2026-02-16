import { Outlet, NavLink, Link } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="logo">
            <img src="/images/mercantelogo.png" alt="" className="logo-icon" />
            mercante
          </NavLink>
          <nav className="nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              home
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              resources
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              jobs
            </NavLink>
            <NavLink
              to="/for-agents"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              for agents
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/images/mercantelogo.png" alt="" className="footer-logo-icon" />
                mercante
              </div>
              <div className="footer-copy">
                Mercante Labs &copy; {new Date().getFullYear()}
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Product</h4>
                <ul>
                  <li>
                    <Link to="/resources">Resources</Link>
                  </li>
                  <li>
                    <Link to="/jobs">Jobs</Link>
                  </li>
                  <li>
                    <Link to="/for-agents">For Agents</Link>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Providers</h4>
                <ul>
                  <li>
                    <a
                      href="https://rentahuman.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RentAHuman
                    </a>
                  </li>
                  <li>
                    <span
                      style={{
                        color: "var(--dark-text-secondary)",
                        fontSize: "0.82rem",
                      }}
                    >
                      Cloud MCP (soon)
                    </span>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Built on</h4>
                <ul>
                  <li>
                    <a
                      href="https://monad.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Monad
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://modelcontextprotocol.io"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      MCP
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-big">
            <div className="footer-big-text">MERCANTE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
