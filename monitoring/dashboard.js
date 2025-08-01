const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.MONITORING_PORT || 3001;

// Environment variables for alerting
const ALERT_EMAIL = process.env.ALERT_EMAIL;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

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

// Operational alarm endpoint
app.post('/api/alarm', (req, res) => {
  const { alarm, severity = 'medium', source, threshold, currentValue } = req.body;

  const alarmData = {
    alarm,
    severity,
    source,
    threshold,
    currentValue,
    timestamp: new Date().toISOString()
  };

  // Trigger alert for all alarms
  triggerAlert('Operational Alarm', alarmData);

  res.json({ status: 'alarm triggered' });
});

// Dashboard HTML
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BookHub Production Monitoring</title>
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
            .alarm-section { margin-top: 20px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; }
            .alarm-button { background: #dc3545; margin-left: 10px; }
            .alarm-button:hover { background: #c82333; }
        </style>
    </head>
    <body>
        <h1>BookHub Production Monitoring</h1>
        <div class="refresh">
            <button onclick="refreshDashboard()">Refresh Dashboard</button>
            <button onclick="testCriticalAlarm()" class="alarm-button">Test Critical Alarm</button>
            <button onclick="testSecurityAlarm()" class="alarm-button">Test Security Alarm</button>
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

        <div class="alarm-section">
            <h3>Operational Alarms</h3>
            <p><strong>Status:</strong> <span id="alarmStatus">Active</span></p>
            <p><strong>Alert Channels:</strong> Email and Slack notifications configured</p>
            <p><strong>Last Test:</strong> <span id="lastAlarmTest">Never</span></p>
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

            function testCriticalAlarm() {
                fetch('/api/log-error', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Test critical error from dashboard',
                        severity: 'critical',
                        source: 'dashboard-test'
                    })
                })
                .then(() => {
                    document.getElementById('lastAlarmTest').textContent = new Date().toLocaleTimeString();
                    alert('Critical alarm test triggered!');
                })
                .catch(error => {
                    console.error('Error testing alarm:', error);
                    alert('Failed to test alarm');
                });
            }

            function testSecurityAlarm() {
                fetch('/api/security-alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        alert: 'Test security vulnerability from dashboard',
                        severity: 'high',
                        source: 'dashboard-test'
                    })
                })
                .then(() => {
                    document.getElementById('lastAlarmTest').textContent = new Date().toLocaleTimeString();
                    alert('Security alarm test triggered!');
                })
                .catch(error => {
                    console.error('Error testing security alarm:', error);
                    alert('Failed to test security alarm');
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

async function triggerAlert(title, data) {
  console.log(`🚨 ALERT: ${title}`, data);

  const alert = {
    title,
    data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  // Send email alert if configured
  if (ALERT_EMAIL) {
    await sendEmailAlert(alert);
  }

  // Send Slack alert if configured
  if (SLACK_WEBHOOK_URL) {
    await sendSlackAlert(alert);
  }

  console.log('Alert triggered:', alert);
}

async function sendEmailAlert(alert) {
  try {
    // In production, use a proper email service like SendGrid, AWS SES, etc.
    console.log(`📧 Email alert would be sent to ${ALERT_EMAIL}:`, alert.title);

    // For demonstration, we'll just log the email alert
    const emailContent = `
      Subject: BookHub Alert - ${alert.title}
      
      Alert Details:
      - Title: ${alert.title}
      - Time: ${alert.timestamp}
      - Environment: ${alert.environment}
      - Data: ${JSON.stringify(alert.data, null, 2)}
      
      Please investigate immediately.
    `;

    console.log('Email content:', emailContent);
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
}

async function sendSlackAlert(alert) {
  try {
    const slackMessage = {
      text: `🚨 *BookHub Alert: ${alert.title}*`,
      attachments: [
        {
          color: alert.data.severity === 'critical' ? '#ff0000' : '#ffa500',
          fields: [
            {
              title: 'Environment',
              value: alert.environment,
              short: true
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toLocaleString(),
              short: true
            },
            {
              title: 'Details',
              value: JSON.stringify(alert.data, null, 2),
              short: false
            }
          ]
        }
      ]
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with status: ${response.status}`);
    }

    console.log('📱 Slack alert sent successfully');
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Monitoring dashboard running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}/dashboard`);
  console.log(`Alert email configured: ${ALERT_EMAIL ? 'Yes' : 'No'}`);
  console.log(`Slack webhook configured: ${SLACK_WEBHOOK_URL ? 'Yes' : 'No'}`);
});

module.exports = app; 