#!/bin/bash

# SSL Setup Script for NormalDance
# Supports Let's Encrypt and Cloudflare SSL

set -e

# Configuration
DOMAIN=${DOMAIN:-"normaldance.com"}
EMAIL=${EMAIL:-"admin@normaldance.com"}
SERVER_IP=${SERVER_IP}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Install required packages
install_dependencies() {
    log "Installing dependencies..."
    
    # Update package list
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        curl \
        wget \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip
    
    log "Dependencies installed successfully"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Reset UFW to defaults
    sudo ufw --force reset
    
    # Set default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow application ports
    sudo ufw allow 3000/tcp
    sudo ufw allow 3001/tcp
    sudo ufw allow 3002/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    log "Firewall configured successfully"
}

# Setup fail2ban
setup_fail2ban() {
    log "Setting up fail2ban..."
    
    # Create jail.local configuration
    sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    # Restart fail2ban
    sudo systemctl restart fail2ban
    sudo systemctl enable fail2ban
    
    log "Fail2ban configured successfully"
}

# Setup Nginx configuration
setup_nginx() {
    log "Setting up Nginx configuration..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/normaldance > /dev/null <<EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

# Upstream servers
upstream app_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream websocket_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

upstream api_backend {
    server 127.0.0.1:3002;
    keepalive 32;
}

# HTTP server (redirects to HTTPS)
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; media-src 'self' https:;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Main application
    location / {
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket connections
    location /socket.io/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
    
    # API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30;
    }
    
    # Login endpoints (stricter rate limiting)
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri @app_backend;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/normaldance /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    log "Nginx configuration created successfully"
}

# Setup Let's Encrypt SSL
setup_letsencrypt() {
    log "Setting up Let's Encrypt SSL..."
    
    # Create webroot directory
    sudo mkdir -p /var/www/certbot
    
    # Get SSL certificate
    sudo certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d ${DOMAIN} \
        -d www.${DOMAIN}
    
    # Setup auto-renewal
    sudo tee /etc/cron.d/certbot > /dev/null <<EOF
# Renew Let's Encrypt certificates twice daily
0 */12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
    
    log "Let's Encrypt SSL configured successfully"
}

# Setup Cloudflare SSL (alternative)
setup_cloudflare_ssl() {
    if [[ -z "$CLOUDFLARE_API_TOKEN" || -z "$CLOUDFLARE_ZONE_ID" ]]; then
        warning "Cloudflare credentials not provided, skipping Cloudflare SSL setup"
        return
    fi
    
    log "Setting up Cloudflare SSL..."
    
    # Set SSL mode to Full (Strict)
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/ssl" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value":"full"}'
    
    # Enable Always Use HTTPS
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/always_use_https" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value":"on"}'
    
    # Enable HTTP/2
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/http2" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value":"on"}'
    
    # Enable HTTP/3 (QUIC)
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/http3" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value":"on"}'
    
    log "Cloudflare SSL configured successfully"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directory
    mkdir -p ~/monitoring
    
    # Download and setup Prometheus
    cd ~/monitoring
    wget https://github.com/prometheus/prometheus/releases/latest/download/prometheus-*.linux-amd64.tar.gz
    tar xzf prometheus-*.linux-amd64.tar.gz
    mv prometheus-*.linux-amd64 prometheus
    
    # Create Prometheus configuration
    tee prometheus/prometheus.yml > /dev/null <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'normaldance-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 10s
EOF

    # Create systemd service for Prometheus
    sudo tee /etc/systemd/system/prometheus.service > /dev/null <<EOF
[Unit]
Description=Prometheus
After=network.target

[Service]
Type=simple
User=prometheus
ExecStart=/home/ubuntu/monitoring/prometheus/prometheus --config.file=/home/ubuntu/monitoring/prometheus/prometheus.yml --storage.tsdb.path=/home/ubuntu/monitoring/prometheus/data
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    # Create prometheus user
    sudo useradd --no-create-home --shell /bin/false prometheus
    sudo chown -R prometheus:prometheus ~/monitoring/prometheus
    
    # Enable and start Prometheus
    sudo systemctl daemon-reload
    sudo systemctl enable prometheus
    sudo systemctl start prometheus
    
    log "Monitoring setup completed"
}

# Main setup function
main() {
    log "Starting SSL and security setup for ${DOMAIN}..."
    
    # Check if domain is provided
    if [[ -z "$DOMAIN" ]]; then
        error "DOMAIN environment variable is required"
    fi
    
    # Check if server IP is provided
    if [[ -z "$SERVER_IP" ]]; then
        warning "SERVER_IP not provided, using current server IP"
        SERVER_IP=$(curl -s ifconfig.me)
    fi
    
    info "Domain: ${DOMAIN}"
    info "Server IP: ${SERVER_IP}"
    info "Email: ${EMAIL}"
    
    # Run setup steps
    check_root
    install_dependencies
    setup_firewall
    setup_fail2ban
    setup_nginx
    
    # Choose SSL method
    if [[ -n "$CLOUDFLARE_API_TOKEN" && -n "$CLOUDFLARE_ZONE_ID" ]]; then
        setup_cloudflare_ssl
    else
        setup_letsencrypt
    fi
    
    setup_monitoring
    
    # Reload Nginx
    sudo systemctl reload nginx
    sudo systemctl enable nginx
    
    log "SSL and security setup completed successfully!"
    log "🌐 Your site is now available at: https://${DOMAIN}"
    log "🔒 SSL certificate is configured and auto-renewing"
    log "🛡️  Firewall and fail2ban are protecting your server"
    log "📊 Monitoring is available at: http://${SERVER_IP}:9090"
    
    # Display final status
    echo ""
    info "=== Setup Summary ==="
    info "Domain: https://${DOMAIN}"
    info "SSL: ✅ Configured"
    info "Firewall: ✅ Active"
    info "Fail2ban: ✅ Active"
    info "Nginx: ✅ Running"
    info "Monitoring: ✅ Active"
    echo ""
}

# Run main function
main "$@"
