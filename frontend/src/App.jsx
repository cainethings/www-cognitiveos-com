import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { getHealth } from './api.js';

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Project Starter</p>
          <h1>Cognitive OS Bootstrap Template</h1>
        </div>
        <nav className="nav-links" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/docs">Docs</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

function HomePage() {
  const [health, setHealth] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let active = true;

    getHealth()
      .then((data) => {
        if (active) {
          setHealth({ loading: false, data, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setHealth({ loading: false, data: null, error: error.message });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout>
      <section className="hero-card">
        <p className="hero-kicker">Vite + React + PHP API</p>
        <h2>Start shipping from a clean baseline</h2>
        <p className="hero-copy">
          This starter includes a React frontend, a minimal PHP API, local proxying for
          <code> /api</code>, and example routes to build from.
        </p>
      </section>

      <section className="grid">
        <article className="panel">
          <h3>Frontend</h3>
          <ul>
            <li>React 18 with React Router</li>
            <li>Vite dev/build setup</li>
            <li>Single starter stylesheet</li>
          </ul>
        </article>

        <article className="panel">
          <h3>Backend</h3>
          <ul>
            <li>Minimal PHP router</li>
            <li>JSON response helper</li>
            <li>Health and echo sample endpoints</li>
          </ul>
        </article>

        <article className="panel">
          <h3>API Status</h3>
          {health.loading && <p>Checking <code>/api/health</code>...</p>}
          {health.error && (
            <p className="status error">
              API unavailable: {health.error}
            </p>
          )}
          {health.data && (
            <pre className="status success">
              {JSON.stringify(health.data, null, 2)}
            </pre>
          )}
        </article>
      </section>
    </Layout>
  );
}

function AboutPage() {
  return (
    <Layout>
      <section className="panel">
        <h2>About This Template</h2>
        <p>
          Replace the sample routes and styles with your product code. Keep the API helper,
          proxy config, and backend router as a starting point.
        </p>
      </section>
    </Layout>
  );
}

function DocsPage() {
  return (
    <Layout>
      <section className="panel">
        <h2>Quick Start</h2>
        <ol>
          <li>Run the PHP API server from <code>backend/public</code>.</li>
          <li>Run <code>npm install</code> and <code>npm run dev</code> in <code>frontend</code>.</li>
          <li>Build your routes and components from this baseline.</li>
        </ol>
      </section>
    </Layout>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <section className="panel">
        <h2>Page Not Found</h2>
        <p>Use this route as your starter 404 page.</p>
      </section>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
