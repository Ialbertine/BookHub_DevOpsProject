const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.MONITORING_PORT || 3001;

// Environment variables for monitoring
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint - This is the main one you need
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      service: 'BookHub Monitoring Dashboard'
    };

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Backend health check
app.get('/api/backend-health', async (req, res) => {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'healthy',
        responseTime,
        backendData: data,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        status: 'unhealthy',
        responseTime,
        error: `Backend responded with status: ${response.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.json({
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Frontend health check
app.get('/api/frontend-health', async (req, res) => {
  try {
    const startTime = Date.now();
    const response = await fetch(FRONTEND_URL, {
      method: 'GET',
      timeout: 5000
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      res.json({
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        status: 'unhealthy',
        responseTime,
        error: `Frontend responded with status: ${response.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.json({
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Combined application health check
app.get('/api/app-health', async (req, res) => {
  try {
    const [backendHealth, frontendHealth] = await Promise.allSettled([
      fetch(`${BACKEND_URL}/api/health`, { timeout: 5000 }),
      fetch(FRONTEND_URL, { timeout: 5000 })
    ]);

    const backendStatus = backendHealth.status === 'fulfilled' && backendHealth.value.ok ? 'healthy' : 'unhealthy';
    const frontendStatus = frontendHealth.status === 'fulfilled' && frontendHealth.value.ok ? 'healthy' : 'unhealthy';

    const overallStatus = backendStatus === 'healthy' && frontendStatus === 'healthy' ? 'healthy' : 'degraded';

    res.json({
      status: overallStatus,
      backend: {
        status: backendStatus,
        url: BACKEND_URL,
        error: backendHealth.status === 'rejected' ? backendHealth.reason.message : null
      },
      frontend: {
        status: frontendStatus,
        url: FRONTEND_URL,
        error: frontendHealth.status === 'rejected' ? frontendHealth.reason.message : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple dashboard endpoint
app.get('/dashboard', (req, res) => {
  const dashboardHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BookHub Monitoring Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #333; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .metric { font-size: 2em; font-weight: bold; color: #333; }
            .label { color: #666; margin-bottom: 10px; }
            .status { padding: 5px 10px; border-radius: 3px; color: white; }
            .healthy { background: #28a745; }
            .degraded { background: #ffc107; color: #333; }
            .error { background: #dc3545; }
            .refresh { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-bottom: 20px; }
            .info { background: #17a2b8; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .url { font-size: 0.8em; color: #666; margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BookHub Monitoring Dashboard</h1>
                <p>Real-time monitoring for BookHub application</p>
            </div>
            
            <div class="info">
                <h3>What This Dashboard Monitors:</h3>
                <ul>
                    <li><strong>Monitoring Service:</strong> This dashboard's health</li>
                    <li><strong>Backend API:</strong> BookHub backend service health and performance</li>
                    <li><strong>Frontend App:</strong> React frontend availability</li>
                    <li><strong>Overall Application:</strong> Combined health status</li>
                </ul>
            </div>
            
            <button class="refresh" onclick="loadAllHealth()">Refresh All Services</button>
            
            <div class="grid">
                <div class="card">
                    <div class="label">Monitoring Service</div>
                    <div class="metric" id="monitoring-status">Loading...</div>
                    <div class="url">http://localhost:${PORT}</div>
                </div>
                
                <div class="card">
                    <div class="label">Backend API</div>
                    <div class="metric" id="backend-status">Loading...</div>
                    <div class="url">${BACKEND_URL}</div>
                </div>
                
                <div class="card">
                    <div class="label">Frontend App</div>
                    <div class="metric" id="frontend-status">Loading...</div>
                    <div class="url">${FRONTEND_URL}</div>
                </div>
                
                <div class="card">
                    <div class="label">Overall Application</div>
                    <div class="metric" id="app-status">Loading...</div>
                    <div class="url">Combined health check</div>
                </div>
                
                <div class="card">
                    <div class="label">Backend Response Time</div>
                    <div class="metric" id="backend-response">Loading...</div>
                    <div class="url">Last check</div>
                </div>
                
                <div class="card">
                    <div class="label">Frontend Response Time</div>
                    <div class="metric" id="frontend-response">Loading...</div>
                    <div class="url">Last check</div>
                </div>
            </div>
        </div>

        <script>
            async function loadAllHealth() {
                await Promise.all([
                    loadMonitoringHealth(),
                    loadBackendHealth(),
                    loadFrontendHealth(),
                    loadAppHealth()
                ]);
            }

            async function loadMonitoringHealth() {
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    
                    document.getElementById('monitoring-status').innerHTML = 
                        '<span class="status healthy">' + data.status + '</span>';
                } catch (error) {
                    document.getElementById('monitoring-status').innerHTML = 
                        '<span class="status error">Error</span>';
                }
            }

            async function loadBackendHealth() {
                try {
                    const response = await fetch('/api/backend-health');
                    const data = await response.json();
                    
                    const statusClass = data.status === 'healthy' ? 'healthy' : 'error';
                    document.getElementById('backend-status').innerHTML = 
                        '<span class="status ' + statusClass + '">' + data.status + '</span>';
                    
                    if (data.responseTime) {
                        document.getElementById('backend-response').textContent = data.responseTime + 'ms';
                    } else {
                        document.getElementById('backend-response').textContent = 'N/A';
                    }
                } catch (error) {
                    document.getElementById('backend-status').innerHTML = 
                        '<span class="status error">Error</span>';
                    document.getElementById('backend-response').textContent = 'N/A';
                }
            }

            async function loadFrontendHealth() {
                try {
                    const response = await fetch('/api/frontend-health');
                    const data = await response.json();
                    
                    const statusClass = data.status === 'healthy' ? 'healthy' : 'error';
                    document.getElementById('frontend-status').innerHTML = 
                        '<span class="status ' + statusClass + '">' + data.status + '</span>';
                    
                    if (data.responseTime) {
                        document.getElementById('frontend-response').textContent = data.responseTime + 'ms';
                    } else {
                        document.getElementById('frontend-response').textContent = 'N/A';
                    }
                } catch (error) {
                    document.getElementById('frontend-status').innerHTML = 
                        '<span class="status error">Error</span>';
                    document.getElementById('frontend-response').textContent = 'N/A';
                }
            }

            async function loadAppHealth() {
                try {
                    const response = await fetch('/api/app-health');
                    const data = await response.json();
                    
                    let statusClass = 'healthy';
                    if (data.status === 'degraded') statusClass = 'degraded';
                    else if (data.status === 'unhealthy') statusClass = 'error';
                    
                    document.getElementById('app-status').innerHTML = 
                        '<span class="status ' + statusClass + '">' + data.status + '</span>';
                } catch (error) {
                    document.getElementById('app-status').innerHTML = 
                        '<span class="status error">Error</span>';
                }
            }

            // Load all health checks on page load
            loadAllHealth();
            
            // Refresh every 30 seconds
            setInterval(loadAllHealth, 30000);
        </script>
    </body>
    </html>
  `;

  res.send(dashboardHTML);
});

// Start server
app.listen(PORT, () => {
  console.log(`Monitoring dashboard running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}/dashboard`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

module.exports = app; 