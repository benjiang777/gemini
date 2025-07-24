# Deployment Guide

## Overview

This guide covers all deployment options for the Gemini Proxy service, including local development, cloud platforms, and containerized deployments. Choose the deployment method that best fits your infrastructure and requirements.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Deno Deploy](#deno-deploy)
- [Cloudflare Workers](#cloudflare-workers)
- [Docker Deployment](#docker-deployment)
- [VPS/Server Deployment](#vpsserver-deployment)
- [Configuration](#configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Git**: For cloning the repository
- **Basic understanding**: HTTP, REST APIs, and WebSocket concepts

### Platform-Specific Requirements

- **Deno Deploy**: GitHub account
- **Cloudflare Workers**: Cloudflare account, Wrangler CLI
- **Docker**: Docker and Docker Compose
- **VPS**: Server with Node.js or Deno runtime

## Local Development

### Option 1: Deno (Recommended)

**1. Install Deno:**

**Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

**2. Clone and run:**
```bash
git clone https://github.com/trueai-org/gemini.git
cd gemini
deno run --allow-net --allow-read src/deno_index.ts
```

**3. Access the service:**
- URL: `http://localhost:8000`
- Test with: `curl http://localhost:8000/models -H "Authorization: Bearer YOUR_API_KEY"`

### Option 2: Node.js

**1. Install Node.js (v18+):**
Download from [nodejs.org](https://nodejs.org/)

**2. Clone and run:**
```bash
git clone https://github.com/trueai-org/gemini.git
cd gemini
npm install
npm run dev
```

**3. Access the service:**
- URL: `http://localhost:8000`

### Local Development Configuration

Create a `.env` file for local environment variables:
```bash
# .env
GEMINI_API_KEY=your_api_key_here
PORT=8000
NODE_ENV=development
```

**Development Features:**
- Hot reload (Deno with `--watch` flag)
- Debug logging enabled
- CORS headers for local testing
- Error stack traces

## Deno Deploy

### Step-by-Step Deployment

**1. Fork the Repository:**
- Go to [GitHub repository](https://github.com/trueai-org/gemini)
- Click "Fork" button
- Star the repository (optional but appreciated)

**2. Create Deno Deploy Project:**
- Visit [Deno Deploy](https://dash.deno.com/)
- Click "New Project"
- Connect your GitHub account
- Select your forked repository

**3. Configure Deployment:**
```yaml
Project Settings:
- Repository: your-username/gemini
- Branch: main
- Entry Point: src/deno_index.ts
- Environment Variables: (leave empty)
- Build Command: (leave empty)
```

**4. Deploy:**
- Click "Deploy Project"
- Wait for deployment to complete
- Note the assigned domain (e.g., `your-project.deno.dev`)

**5. Test Deployment:**
```bash
curl https://your-project.deno.dev/models \
  -H "Authorization: Bearer YOUR_GEMINI_API_KEY"
```

### Deno Deploy Configuration

**Environment Variables:**
```bash
# Optional: Set in Deno Deploy dashboard
GEMINI_API_KEY=your_default_key  # Not recommended for security
LOG_LEVEL=info
```

**Custom Domain:**
1. Go to project settings in Deno Deploy
2. Add custom domain
3. Configure DNS CNAME record
4. SSL certificate is automatically provisioned

**Scaling:**
- Automatic scaling based on traffic
- No configuration needed
- Global edge deployment

## Cloudflare Workers

### Prerequisites

**1. Install Wrangler CLI:**
```bash
npm install -g wrangler
```

**2. Authenticate:**
```bash
wrangler login
```

### Deployment Steps

**1. Clone Repository:**
```bash
git clone https://github.com/trueai-org/gemini.git
cd gemini
```

**2. Configure Wrangler:**
Create `wrangler.toml`:
```toml
name = "gemini-proxy"
main = "src/index.js"
compatibility_date = "2023-10-30"
compatibility_flags = ["streams_enable_constructors"]

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CONFIG"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"

[site]
bucket = "./dist"
entry-point = "workers-site"
```

**3. Deploy:**
```bash
wrangler deploy
```

**4. Set Environment Variables:**
```bash
wrangler secret put GEMINI_API_KEY
# Enter your API key when prompted
```

**5. Test Deployment:**
```bash
curl https://gemini-proxy.your-subdomain.workers.dev/models \
  -H "Authorization: Bearer YOUR_GEMINI_API_KEY"
```

### Cloudflare Workers Configuration

**Environment Variables (Secrets):**
```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put WEBHOOK_SECRET  # Optional
```

**KV Storage (Optional):**
For caching or configuration:
```bash
wrangler kv:namespace create "CONFIG"
wrangler kv:key put --binding=CONFIG "cache_ttl" "3600"
```

**Custom Domain:**
1. Add domain to Cloudflare
2. Add route in Workers dashboard
3. Configure SSL/TLS

**Scaling:**
- Automatic scaling to 0
- Pay-per-request pricing
- Global edge network

## Docker Deployment

### Docker Compose (Recommended)

**1. Clone Repository:**
```bash
git clone https://github.com/trueai-org/gemini.git
cd gemini
```

**2. Configure Environment:**
Create `.env` file:
```bash
GEMINI_API_KEY=your_api_key_here
PORT=8000
NODE_ENV=production
```

**3. Deploy:**
```bash
# Using provided deployment script
chmod +x deploy.sh
./deploy.sh

# Or manually
docker-compose up -d
```

**4. Verify Deployment:**
```bash
docker-compose ps
curl http://localhost:8000/models -H "Authorization: Bearer YOUR_API_KEY"
```

### Docker Compose Configuration

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  gemini-proxy:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - PORT=8000
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/models"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.gemini.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.services.gemini.loadbalancer.server.port=8000"
```

### Advanced Docker Configuration

**Multi-stage Production Build:**
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
EXPOSE 8000
USER node
CMD ["node", "src/index.js"]
```

**Health Checks:**
```bash
# Add to Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/models || exit 1
```

## VPS/Server Deployment

### Ubuntu/Debian Server Setup

**1. Server Prerequisites:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx
```

**2. Deploy Application:**
```bash
# Clone repository
git clone https://github.com/trueai-org/gemini.git
cd gemini

# Install dependencies
npm install --production

# Create environment file
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "PORT=3000" >> .env
echo "NODE_ENV=production" >> .env
```

**3. Configure PM2:**
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'gemini-proxy',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
}
```

**4. Start Application:**
```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

**5. Configure Nginx Reverse Proxy:**
```nginx
# /etc/nginx/sites-available/gemini-proxy
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**6. Enable Site and SSL:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gemini-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### CentOS/RHEL Setup

**1. Install Dependencies:**
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo yum install epel-release
sudo yum install nginx
```

**2. Configure Firewall:**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

Follow similar steps as Ubuntu for application deployment.

### Deno Server Deployment

**1. Install Deno on Server:**
```bash
curl -fsSL https://deno.land/install.sh | sh
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**2. Create Systemd Service:**
```ini
# /etc/systemd/system/gemini-proxy.service
[Unit]
Description=Gemini Proxy Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/gemini
ExecStart=/home/user/.deno/bin/deno run --allow-net --allow-read src/deno_index.ts
Restart=always
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

**3. Enable and Start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable gemini-proxy
sudo systemctl start gemini-proxy
```

## Configuration

### Environment Variables

**Core Configuration:**
```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
PORT=8000                    # Server port
NODE_ENV=production         # Environment mode
LOG_LEVEL=info             # Logging level
MAX_REQUESTS_PER_MINUTE=60 # Rate limiting
CORS_ORIGIN=*              # CORS configuration
```

**Advanced Configuration:**
```bash
# Security
API_KEY_HEADER=Authorization  # Custom auth header
WEBHOOK_SECRET=secret123      # Webhook validation

# Performance
CACHE_TTL=3600               # Cache timeout
MAX_PAYLOAD_SIZE=10485760    # 10MB max payload
WORKER_THREADS=4             # Worker thread count

# Monitoring
METRICS_ENABLED=true         # Enable metrics
HEALTH_CHECK_PATH=/health    # Health check endpoint
```

### Configuration Files

**For Docker deployments:**
```yaml
# config/production.yml
server:
  port: 8000
  host: 0.0.0.0

api:
  baseUrl: https://generativelanguage.googleapis.com
  version: v1beta
  timeout: 30000

security:
  cors:
    origin: "*"
    methods: ["GET", "POST", "OPTIONS"]
    headers: ["Content-Type", "Authorization"]

logging:
  level: info
  format: json
```

### Runtime Configuration

**PM2 Configuration:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gemini-proxy',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      LOG_LEVEL: 'warn'
    }
  }]
}
```

## Monitoring and Maintenance

### Health Monitoring

**Health Check Endpoint:**
```bash
# Check service health
curl http://your-domain.com/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

**Monitoring Script:**
```bash
#!/bin/bash
# monitor.sh
URL="http://localhost:8000/models"
API_KEY="your_api_key"

response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $API_KEY" "$URL")
http_code="${response: -3}"

if [ "$http_code" != "200" ]; then
    echo "Service unhealthy: HTTP $http_code"
    # Restart service
    pm2 restart gemini-proxy
    # Send alert
    curl -X POST "https://hooks.slack.com/your-webhook" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"Gemini Proxy service restarted due to health check failure\"}"
fi
```

### Logging

**Log Configuration:**
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

**Log Rotation:**
```bash
# /etc/logrotate.d/gemini-proxy
/opt/gemini/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Performance Monitoring

**Metrics Collection:**
```javascript
// metrics.js
const promClient = require('prom-client');

const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const requestCount = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Export metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

### Backup and Recovery

**Configuration Backup:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/gemini-proxy"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup configuration
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  .env \
  ecosystem.config.js \
  docker-compose.yml \
  nginx.conf

# Backup logs
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" logs/

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -type f -mtime +30 -delete
```

**Automated Updates:**
```bash
#!/bin/bash
# update.sh
cd /opt/gemini

# Pull latest changes
git fetch origin
git pull origin main

# Install dependencies
npm install --production

# Restart service
pm2 restart gemini-proxy

# Verify deployment
sleep 5
curl -f http://localhost:3000/models -H "Authorization: Bearer $GEMINI_API_KEY"
```

## Troubleshooting

### Common Issues

**1. API Key Issues:**
```bash
# Test API key directly with Gemini
curl https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: YOUR_API_KEY"

# Check proxy logs
pm2 logs gemini-proxy | grep -i "auth\|key\|401"
```

**2. CORS Issues:**
```bash
# Test CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://your-domain.com/chat/completions
```

**3. WebSocket Connection Issues:**
```bash
# Test WebSocket connection
wscat -c ws://localhost:8000/ws

# Check nginx WebSocket configuration
# Ensure proxy_set_header Upgrade $http_upgrade;
# Ensure proxy_set_header Connection 'upgrade';
```

**4. Memory Issues:**
```bash
# Monitor memory usage
pm2 monit

# Restart if memory exceeds limit
pm2 restart gemini-proxy

# Check for memory leaks
node --inspect src/index.js
```

### Debug Mode

**Enable Debug Logging:**
```bash
# Set environment variable
export DEBUG=gemini:*
export LOG_LEVEL=debug

# Or in .env file
DEBUG=gemini:*
LOG_LEVEL=debug
```

**Debug Request/Response:**
```javascript
// Add to request handler
console.log('Request:', {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers),
  body: await request.clone().text()
});
```

### Performance Issues

**1. High Latency:**
```bash
# Check network latency to Gemini API
curl -w "@curl-format.txt" -s -o /dev/null \
  https://generativelanguage.googleapis.com/v1beta/models

# Monitor request times
tail -f logs/combined.log | grep "request_duration"
```

**2. High CPU Usage:**
```bash
# Check PM2 cluster status
pm2 list

# Monitor CPU usage
htop

# Optimize cluster size
pm2 scale gemini-proxy 4
```

**3. Memory Leaks:**
```bash
# Monitor memory over time
pm2 monit

# Generate heap snapshot
node --inspect-brk src/index.js
# Connect Chrome DevTools to capture heap snapshots
```

### Recovery Procedures

**Service Recovery:**
```bash
#!/bin/bash
# recovery.sh
SERVICE_NAME="gemini-proxy"

# Check if service is running
if ! pm2 list | grep -q "$SERVICE_NAME"; then
    echo "Service not found, starting..."
    pm2 start ecosystem.config.js --env production
else
    echo "Restarting service..."
    pm2 restart "$SERVICE_NAME"
fi

# Wait for service to start
sleep 10

# Health check
if curl -f http://localhost:3000/models -H "Authorization: Bearer $GEMINI_API_KEY"; then
    echo "Service recovered successfully"
else
    echo "Service recovery failed"
    # Send alert
    # Escalate to manual intervention
fi
```

**Database Recovery (if using persistence):**
```bash
# Restore from backup
tar -xzf /backup/gemini-proxy/config_latest.tar.gz
pm2 restart gemini-proxy
```

This comprehensive deployment guide should help you deploy and maintain the Gemini Proxy service in any environment. Choose the deployment method that best fits your needs and infrastructure requirements.