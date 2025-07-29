const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.MONITORING_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for metrics (in production, use a proper database)
let metrics = {
  healthChecks: [],
  errors: [],
  performance: [],
  securityAlerts: []
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const healthStatus = {
      status: 'healthy',
      timestamp,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    // Store health check
    metrics.healthChecks.push({
      ...healthStatus,
      timestamp
    });

    // Keep only last 100 health checks
    if (metrics.healthChecks.length > 100) {
      metrics.healthChecks = metrics.healthChecks.slice(-100);
    }

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Filter recent metrics
  const recentHealthChecks = metrics.healthChecks.filter(
    check => new Date(check.timestamp) > oneHourAgo
  );
  const recentErrors = metrics.errors.filter(
    error => new Date(error.timestamp) > oneHourAgo
  );

  const response = {
    healthChecks: {
      total: metrics.healthChecks.length,
      recent: recentHealthChecks.length,
      successRate: recentHealthChecks.length > 0 ? 
        (recentHealthChecks.filter(check => check.status === 'healthy').length / recentHealthChecks.length * 100).toFixed(2) : 100
    },
    errors: {
      total: metrics.errors.length,
      recent: recentErrors.length,
      critical: recentErrors.filter(error => error.severity === 'critical').length
    },
    performance: {
      averageResponseTime: calculateAverageResponseTime(),
      uptime: process.uptime()
    },
    securityAlerts: {
      total: metrics.securityAlerts.length,
      recent: metrics.securityAlerts.filter(
        alert => new Date(alert.timestamp) > oneHourAgo
      ).length
    }
  };

  res.json(response);
});

// Error logging endpoint
app.post('/api/log-error', (req, res) => {
  const { error, severity = 'medium', source } = req.body;
  
  const errorLog = {
    error,
    severity,
    source,
    timestamp: new Date().toISOString()
  };

  metrics.errors.push(errorLog);

  // Keep only last 1000 errors
  if (metrics.errors.length > 1000) {
    metrics.errors = metrics.errors.slice(-1000);
  }

  // Trigger alerts for critical errors
  if (severity === 'critical') {
    triggerAlert('Critical Error Detected', errorLog);
  }

  res.json({ status: 'logged' });
});

// Security alert endpoint
app.post('/api/security-alert', (req, res) => {
  const { alert, severity = 'medium', source } = req.body;
  
  const securityAlert = {
    alert,
    severity,
    source,
    timestamp: new Date().toISOString()
  };

  metrics.securityAlerts.push(securityAlert);

  // Keep only last 100 security alerts
  if (metrics.securityAlerts.length > 100) {
    metrics.securityAlerts = metrics.securityAlerts.slice(-100);
  }

  // Trigger alerts for high/critical security issues
  if (severity === 'high' || severity === 'critical') {
    triggerAlert('Security Alert', securityAlert);
  }

  res.json({ status: 'logged' });
});

// Performance metrics endpoint
app.post('/api/performance', (req, res) => {
  const { responseTime, endpoint, method } = req.body;
  
  const performanceMetric = {
    responseTime,
    endpoint,
    method,
    timestamp: new Date().toISOString()
  };

  metrics.performance.push(performanceMetric);

  // Keep only last 1000 performance metrics
  if (metrics.performance.length > 1000) {
    metrics.performance = metrics.performance.slice(-1000);
  }

  res.json({ status: 'logged' });
});

// Dashboard HTML
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BookHub Monitoring Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric { font-size: 2em; font-weight: bold; color: #333; }
            .label { color: #666; margin-bottom: 10px; }
            .status { padding: 5px 10px; border-radius: 4px; color: white; }
            .healthy { background: #28a745; }
            .warning { background: #ffc107; color: #333; }
            .error { background: #dc3545; }
            .refresh { margin-bottom: 20px; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>BookHub Production Monitoring</h1>
        <div class="refresh">
            <button onclick="refreshDashboard()">Refresh Dashboard</button>
            <span id="lastUpdate"></span>
        </div>
        <div class="dashboard" id="dashboard">
            <div class="card">
                <div class="label">Application Health</div>
                <div class="metric" id="healthStatus">Loading...</div>
                <div class="status" id="healthClass">-</div>
            </div>
            <div class="card">
                <div class="label">Success Rate</div>
                <div class="metric" id="successRate">-</div>
                <div class="label">Last Hour</div>
            </div>
            <div class="card">
                <div class="label">Error Rate</div>
                <div class="metric" id="errorRate">-</div>
                <div class="label">Last Hour</div>
            </div>
            <div class="card">
                <div class="label">Response Time</div>
                <div class="metric" id="responseTime">-</div>
                <div class="label">Average (ms)</div>
            </div>
            <div class="card">
                <div class="label">Security Alerts</div>
                <div class="metric" id="securityAlerts">-</div>
                <div class="label">Last Hour</div>
            </div>
            <div class="card">
                <div class="label">Uptime</div>
                <div class="metric" id="uptime">-</div>
                <div class="label">Seconds</div>
            </div>
        </div>

        <script>
            function refreshDashboard() {
                fetch('/api/metrics')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('healthStatus').textContent = data.healthChecks.recent > 0 ? 'Active' : 'No Data';
                        document.getElementById('healthClass').textContent = data.healthChecks.successRate + '%';
                        document.getElementById('healthClass').className = 'status ' + (data.healthChecks.successRate > 95 ? 'healthy' : data.healthChecks.successRate > 80 ? 'warning' : 'error');
                        
                        document.getElementById('successRate').textContent = data.healthChecks.successRate + '%';
                        document.getElementById('errorRate').textContent = data.errors.recent;
                        document.getElementById('responseTime').textContent = data.performance.averageResponseTime || 'N/A';
                        document.getElementById('securityAlerts').textContent = data.securityAlerts.recent;
                        document.getElementById('uptime').textContent = Math.floor(data.performance.uptime);
                        
                        document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                    })
                    .catch(error => {
                        console.error('Error fetching metrics:', error);
                        document.getElementById('healthStatus').textContent = 'Error';
                        document.getElementById('healthClass').textContent = 'Failed to load';
                        document.getElementById('healthClass').className = 'status error';
                    });
            }

            // Refresh every 30 seconds
            refreshDashboard();
            setInterval(refreshDashboard, 30000);
        </script>
    </body>
    </html>
  `);
});

// Helper functions
function calculateAverageResponseTime() {
  if (metrics.performance.length === 0) return 0;
  
  const recent = metrics.performance.filter(
    perf => new Date(perf.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
  );
  
  if (recent.length === 0) return 0;
  
  const total = recent.reduce((sum, perf) => sum + perf.responseTime, 0);
  return Math.round(total / recent.length);
}

function triggerAlert(title, data) {
  console.log(`🚨 ALERT: ${title}`, data);
  
  // In production, this would send notifications via:
  // - Email
  // - Slack
  // - PagerDuty
  // - SMS
  
  // For now, just log to console
  const alert = {
    title,
    data,
    timestamp: new Date().toISOString()
  };
  
  console.log('Alert triggered:', alert);
}

// Start server
app.listen(PORT, () => {
  console.log(`Monitoring dashboard running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}/dashboard`);
});

module.exports = app; 