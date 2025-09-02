# 🚀 Production Deployment Guide

This guide will help you deploy JobBoard AI to production using Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Root/sudo access to your server
- Domain name (optional, but recommended)
- SSL certificates (optional, self-signed will be generated for testing)

## 🏗️ Architecture

```
Internet → Nginx (SSL/TLS) → Next.js App → PostgreSQL + Redis
                ↓
            Monitoring (Prometheus + Loki)
```

## 🚀 Quick Start

### 1. Prepare Environment

```bash
# Copy environment template
cp env.production.template .env.production

# Edit environment variables
nano .env.production
```

### 2. Deploy

```bash
# Make deployment script executable
chmod +x deploy-production.sh

# Run deployment (requires sudo)
sudo ./deploy-production.sh
```

### 3. Access Your Application

- **Application**: https://yourdomain.com
- **Monitoring**: http://yourdomain.com:9090 (Prometheus)
- **Logs**: http://yourdomain.com:3100 (Loki)

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `POSTGRES_PASSWORD` | Database password | Yes | `secure_password_123` |
| `REDIS_PASSWORD` | Redis password | Yes | `redis_pass_456` |
| `JWT_SECRET` | JWT signing key | Yes | `min_32_chars_long_secret_key` |
| `NEXT_PUBLIC_API_URL` | Public API URL | Yes | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL endpoint | Yes | `https://yourdomain.com/graphql` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | Yes | `wss://yourdomain.com/ws` |

### SSL Certificates

For production, replace the self-signed certificates:

```bash
# Place your certificates in nginx/ssl/
cp your_cert.pem nginx/ssl/cert.pem
cp your_key.pem nginx/ssl/key.pem

# Set proper permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem

# Restart nginx
docker-compose restart nginx
```

## 🔧 Services

### Core Services

- **job-board-ai-next**: Your Next.js application
- **nginx**: Reverse proxy with SSL termination
- **postgres**: PostgreSQL database
- **redis**: Redis cache

### Monitoring Services

- **prometheus**: Metrics collection
- **loki**: Log aggregation

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# View health check logs
docker-compose logs nginx
docker-compose logs job-board-ai-next
```

### Metrics

- **Prometheus**: http://localhost:9090
- **Application Health**: https://yourdomain.com/api/health

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f job-board-ai-next
docker-compose logs -f nginx
```

## 🔒 Security

### Firewall Configuration

```bash
# Allow required ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9090/tcp  # Prometheus
ufw allow 3100/tcp  # Loki

# Enable firewall
ufw enable
```

### SSL/TLS

- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS headers
- Security headers (XSS, CSRF protection)

### Rate Limiting

- API: 10 requests/second
- Login: 1 request/second
- Burst allowance for legitimate traffic

## 💾 Data Persistence

### Volumes

```bash
# Database data
postgres_data:/var/lib/postgresql/data

# Redis data
redis_data:/data

# Application logs
./logs/app:/usr/src/jobBoardAi-next/logs

# Uploads
./uploads:/usr/src/jobBoardAi-next/public/uploads
```

### Backup Strategy

```bash
# Database backup
docker-compose exec postgres pg_dump -U jobboard_user jobboard > backup.sql

# Volume backup
docker run --rm -v job-board-ai-next_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :80
   netstat -tulpn | grep :443
   ```

2. **Permission issues**
   ```bash
   # Fix ownership
   sudo chown -R 1000:1000 logs uploads
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   ```

### Log Analysis

```bash
# Check nginx error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log

# Check application logs
docker-compose logs -f job-board-ai-next

# Check database logs
docker-compose logs -f postgres
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale the application
docker-compose up -d --scale job-board-ai-next=3

# Load balancer configuration needed
```

### Resource Limits

Current limits per service:
- **Next.js App**: 1 CPU, 1GB RAM
- **PostgreSQL**: 0.5 CPU, 512MB RAM
- **Redis**: 0.2 CPU, 256MB RAM

Adjust in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

## 🔄 Updates

### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Database Migrations

```bash
# Run migrations (if you have them)
docker-compose exec job-board-ai-next yarn migrate

# Or manually
docker-compose exec postgres psql -U jobboard_user -d jobboard -f migration.sql
```

## 📞 Support

### Emergency Commands

```bash
# Stop all services
docker-compose down

# View resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

### Maintenance Mode

```bash
# Enable maintenance mode
docker-compose exec nginx echo "return 503;" > /etc/nginx/maintenance.conf

# Disable maintenance mode
docker-compose exec nginx rm /etc/nginx/maintenance.conf
```

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Resource limits set
- [ ] Health checks passing
- [ ] Security headers enabled
- [ ] Rate limiting configured

---

**⚠️ Important**: This is a production setup. Always test in staging first and ensure you have proper backups before deploying to production.
