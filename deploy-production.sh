#!/bin/bash

# Production Deployment Script for JobBoard AI
# Make sure to run this script as root or with sudo

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_warning "Please copy env.production.template to .env.production and configure it"
    exit 1
fi

# Create required directories
print_status "Creating required directories..."
mkdir -p nginx/ssl
mkdir -p logs/{nginx,app,postgres,redis}
mkdir -p uploads
mkdir -p monitoring

# Generate self-signed SSL certificate (for testing - replace with real certs in production)
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    print_status "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    print_warning "Self-signed certificate generated. Replace with real certificates for production!"
fi

# Create Prometheus configuration
if [ ! -f monitoring/prometheus.yml ]; then
    print_status "Creating Prometheus configuration..."
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nextjs'
    static_configs:
      - targets: ['job-board-ai-next:3000']
    metrics_path: '/api/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
fi

# Create Loki configuration
if [ ! -f monitoring/loki-config.yaml ]; then
    print_status "Creating Loki configuration..."
    cat > monitoring/loki-config.yaml << EOF
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /tmp/loki/boltdb-shipper-active
    cache_location: /tmp/loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /tmp/loki/chunks

compactor:
  working_directory: /tmp/loki/boltdb-shipper-compactor
  shared_store: filesystem

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
EOF
fi

# Set proper permissions
print_status "Setting proper permissions..."
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem
chown -R 1000:1000 logs uploads

# Load environment variables
print_status "Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Check required environment variables
required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        exit 1
    fi
done

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
if docker-compose ps | grep -q "unhealthy"; then
    print_error "Some services are unhealthy. Check logs with: docker-compose logs"
    exit 1
fi

# Create database tables (if needed)
print_status "Checking database connection..."
if docker-compose exec -T postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; then
    print_status "Database is ready!"
else
    print_warning "Database might not be ready yet. You may need to run migrations manually."
fi

print_status "✅ Production deployment completed successfully!"
echo ""
echo "🌐 Your application is now running at:"
echo "   HTTP:  http://localhost (redirects to HTTPS)"
echo "   HTTPS: https://localhost"
echo ""
echo "📊 Monitoring:"
echo "   Prometheus: http://localhost:9090"
echo "   Loki:       http://localhost:3100"
echo ""
echo "📝 Next steps:"
echo "   1. Replace self-signed SSL certificate with real certificates"
echo "   2. Update domain names in .env.production"
echo "   3. Configure your firewall (ports 80, 443, 9090, 3100)"
echo "   4. Set up automated backups for postgres_data volume"
echo "   5. Configure log rotation"
echo ""
echo "🔍 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart"
echo "   Update:        git pull && docker-compose up -d --build"
