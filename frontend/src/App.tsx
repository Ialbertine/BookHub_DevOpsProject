import { useState, useEffect } from 'react';
import './App.css';

interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
}

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data: HealthStatus) => {
        setHealthStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>BookHub</h1>
        <p>Welcome to BookHub To the Book Management System</p>
        {healthStatus && (
          <div className="health-status">
            <p>Backend Status: <span className="status-ok">{healthStatus.status}</span></p>
            <p>{healthStatus.message}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;