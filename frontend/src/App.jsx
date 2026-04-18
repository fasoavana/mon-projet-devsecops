import { useState, useEffect } from 'react'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/v1/')
      .then(res => res.json())
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container">
      <header className="header">
        <h1>🛡️ SecureTask</h1>
        <p className="subtitle">DevSecOps Dashboard</p>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">
            <h2>❌ Connection Error</h2>
            <p>{error}</p>
            <p>Make sure the backend API is running on port 8000</p>
          </div>
        ) : (
          <div className="success">
            <h2>✅ API Connected</h2>
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}

        <div className="services">
          <h2>Services</h2>
          <div className="service-grid">
            <div className="service-card">
              <h3>API</h3>
              <p>http://localhost:8000</p>
              <a href="/api/v1/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
            </div>
            <div className="service-card">
              <h3>SonarQube</h3>
              <p>http://localhost:9000</p>
              <span className="badge">admin/admin</span>
            </div>
            <div className="service-card">
              <h3>Nexus</h3>
              <p>http://localhost:8081</p>
              <span className="badge">admin/admin123</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
