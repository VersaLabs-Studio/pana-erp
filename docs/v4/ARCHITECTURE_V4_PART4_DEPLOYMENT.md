# Obsidian ERP v4.0 — Architecture Document (Part 4 of 4)
# Deployment, Multi-Tenant Operations, CI/CD & Client Onboarding

> **Product:** Obsidian ERP  
> **Company:** VersaLabs Studio  
> **Document Version:** 4.0.0  
> **Last Updated:** 2026-05-31  
> **Depends On:** Part 1 (Foundation), Part 2 (UX), Part 3 (AI)

---

## Table of Contents

1. [Deployment Architecture](#1-deployment-architecture)
2. [Docker Configuration](#2-docker-configuration)
3. [Multi-Tenant Operations](#3-multi-tenant-operations)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Environment Management](#5-environment-management)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [Client Onboarding Flow](#7-client-onboarding-flow)
8. [Backup & Disaster Recovery](#8-backup--disaster-recovery)
9. [Security Hardening](#9-security-hardening)
10. [Scaling Strategy](#10-scaling-strategy)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Appendix: Complete Module Registry](#appendix-complete-module-registry)

---

## 1. Deployment Architecture

### 1.1 Production Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION VPS                                   │
│                   (Hetzner / DigitalOcean / Vultr)                       │
│                     Ubuntu 22.04+ / 4GB+ RAM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        TRAEFIK (Reverse Proxy)                     │   │
│  │  Port 80/443 → Auto SSL (Let's Encrypt)                          │   │
│  │  Route: *.obsidian.versalabs.io → services                       │   │
│  └──────┬─────────────────────────────────┬──────────────────────── │   │
│         │                                   │                          │   │
│         ▼                                   ▼                          │   │
│  ┌──────────────────┐             ┌──────────────────┐                │   │
│  │  NEXT.JS FRONTEND │             │  FRAPPE BACKEND   │                │   │
│  │  (Docker Container)│             │  (Docker Container)│                │   │
│  │                    │             │                    │                │   │
│  │  Port: 3000        │             │  Port: 8000        │                │   │
│  │  Node 20           │─── API ───▶│  Python 3.11       │                │   │
│  │  Next.js 16        │  Calls     │  Frappe v15        │                │   │
│  │                    │             │  ERPNext           │                │   │
│  └──────────────────┘             └────────┬───────────┘                │   │
│                                             │                            │   │
│         ┌───────────────────────────────────┼──────────────────┐        │   │
│         │                                   │                    │        │   │
│         ▼                                   ▼                    │        │   │
│  ┌──────────────────┐             ┌──────────────────┐          │        │   │
│  │  REDIS             │             │  MARIADB           │          │        │   │
│  │  (Docker Container)│             │  (Docker Container)│          │        │   │
│  │                    │             │                    │          │        │   │
│  │  Port: 6379        │             │  Port: 3306        │          │        │   │
│  │  Cache + Queue     │             │  Per-tenant DBs    │          │        │   │
│  └──────────────────┘             └──────────────────┘          │        │   │
│                                                                   │        │   │
│  ┌──────────────────────────────────────────────────────────────┐│        │   │
│  │  PERSISTENT VOLUMES                                           ││        │   │
│  │  /data/frappe/sites/     → Frappe sites + files               ││        │   │
│  │  /data/mariadb/          → Database files                     ││        │   │
│  │  /data/redis/            → Redis persistence                  ││        │   │
│  │  /data/backups/          → Automated backups                  ││        │   │
│  └──────────────────────────────────────────────────────────────┘│        │   │
│                                                                           │   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Domain Structure

```
obsidian.versalabs.io          → Marketing site / Login portal
app.obsidian.versalabs.io      → Main application (default tenant)
{tenant}.obsidian.versalabs.io → Per-tenant subdomain

Examples:
  pana.obsidian.versalabs.io     → Pana Promotion (first client)
  abebe.obsidian.versalabs.io    → Abebe Trading PLC
  demo.obsidian.versalabs.io     → Demo / sandbox environment
```

---

## 2. Docker Configuration

### 2.1 Production Docker Compose

```yaml
# docker/docker-compose.yml

version: "3.8"

services:
  # ── REVERSE PROXY ──
  traefik:
    image: traefik:v3.0
    container_name: obsidian-traefik
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@versalabs.io"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "letsencrypt:/letsencrypt"
    networks:
      - obsidian-network
    restart: unless-stopped

  # ── NEXT.JS FRONTEND ──
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: obsidian-frontend
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_FRAPPE_URL=http://frappe:8000
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - NEXT_PUBLIC_AI_ENABLED=true
      - NEXT_PUBLIC_APP_URL=https://app.obsidian.versalabs.io
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`app.obsidian.versalabs.io`) || HostRegexp(`{subdomain:[a-z]+}.obsidian.versalabs.io`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
    depends_on:
      - frappe
    networks:
      - obsidian-network
    restart: unless-stopped

  # ── FRAPPE BACKEND ──
  frappe:
    image: frappe/bench:v15
    container_name: obsidian-frappe
    environment:
      - FRAPPE_SITE=${DEFAULT_SITE:-obsidian.local}
      - DB_HOST=mariadb
      - DB_PORT=3306
      - REDIS_CACHE=redis://redis:6379/0
      - REDIS_QUEUE=redis://redis:6379/1
      - REDIS_SOCKETIO=redis://redis:6379/2
    volumes:
      - frappe-sites:/home/frappe/frappe-bench/sites
      - frappe-logs:/home/frappe/frappe-bench/logs
    depends_on:
      - mariadb
      - redis
    networks:
      - obsidian-network
    restart: unless-stopped

  # ── DATABASE ──
  mariadb:
    image: mariadb:10.11
    container_name: obsidian-mariadb
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_CHARACTER_SET_SERVER=utf8mb4
      - MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci
    volumes:
      - mariadb-data:/var/lib/mysql
    networks:
      - obsidian-network
    restart: unless-stopped

  # ── CACHE & QUEUE ──
  redis:
    image: redis:7-alpine
    container_name: obsidian-redis
    volumes:
      - redis-data:/data
    networks:
      - obsidian-network
    restart: unless-stopped

volumes:
  letsencrypt:
  frappe-sites:
  frappe-logs:
  mariadb-data:
  redis-data:

networks:
  obsidian-network:
    driver: bridge
```

### 2.2 Next.js Dockerfile

```dockerfile
# docker/Dockerfile

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2.3 Development Docker Compose

```yaml
# docker/docker-compose.dev.yml

version: "3.8"

services:
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.dev
    container_name: obsidian-dev
    volumes:
      - ..:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_FRAPPE_URL=http://localhost:8000
    command: pnpm dev
```

---

## 3. Multi-Tenant Operations

### 3.1 Tenant Provisioning

```bash
#!/bin/bash
# scripts/setup-tenant.sh

# Usage: ./setup-tenant.sh <tenant-name> <admin-email>
# Example: ./setup-tenant.sh pana admin@panapromo.com

TENANT_NAME=$1
ADMIN_EMAIL=$2
SITE_NAME="${TENANT_NAME}.obsidian.local"

echo "🏢 Provisioning tenant: ${TENANT_NAME}"
echo "   Site: ${SITE_NAME}"
echo "   Admin: ${ADMIN_EMAIL}"

# 1. Create new Frappe site (creates new database)
docker exec obsidian-frappe bench new-site ${SITE_NAME} \
  --db-name "obsidian_${TENANT_NAME}" \
  --admin-password "${ADMIN_PASSWORD:-admin}" \
  --mariadb-root-password "${DB_ROOT_PASSWORD}"

# 2. Install ERPNext on the site
docker exec obsidian-frappe bench --site ${SITE_NAME} install-app erpnext

# 3. Set up the company
docker exec obsidian-frappe bench --site ${SITE_NAME} execute \
  "erpnext.setup.setup_wizard.setup_complete" \
  --kwargs "{'company_name': '${TENANT_NAME}', 'currency': 'ETB'}"

# 4. Create API credentials for the frontend
docker exec obsidian-frappe bench --site ${SITE_NAME} execute \
  "frappe.core.doctype.user.user.generate_keys" \
  --args "'Administrator'"

# 5. Register tenant in frontend config
cat >> ../lib/tenant/tenants.json <<EOF
{
  "${TENANT_NAME}": {
    "site": "${SITE_NAME}",
    "subdomain": "${TENANT_NAME}",
    "company": "${TENANT_NAME}",
    "currency": "ETB",
    "timezone": "Africa/Addis_Ababa",
    "active": true,
    "created": "$(date -Iseconds)"
  }
}
EOF

echo "✅ Tenant ${TENANT_NAME} provisioned successfully"
echo "   URL: https://${TENANT_NAME}.obsidian.versalabs.io"
```

### 3.2 Tenant Resolution Middleware

```typescript
// lib/tenant/tenant-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { TENANT_CONFIG } from './tenant-config';

/**
 * Middleware that resolves the current tenant from:
 * 1. Subdomain: pana.obsidian.versalabs.io → tenant "pana"
 * 2. Header: X-Tenant-ID → tenant "pana"
 * 3. Default: Falls back to default tenant
 */
export function resolveTenant(request: NextRequest): TenantInfo {
  // 1. Try subdomain
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  
  if (TENANT_CONFIG[subdomain]) {
    return TENANT_CONFIG[subdomain];
  }

  // 2. Try header
  const headerTenant = request.headers.get('x-tenant-id');
  if (headerTenant && TENANT_CONFIG[headerTenant]) {
    return TENANT_CONFIG[headerTenant];
  }

  // 3. Default tenant
  return TENANT_CONFIG['default'] || TENANT_CONFIG[Object.keys(TENANT_CONFIG)[0]];
}

/**
 * Inject tenant context into API requests to Frappe.
 * Sets the X-Frappe-Site-Name header so Frappe routes to the correct database.
 */
export function injectTenantHeaders(
  tenant: TenantInfo,
  headers: Headers
): Headers {
  headers.set('X-Frappe-Site-Name', tenant.site);
  return headers;
}

interface TenantInfo {
  id: string;
  site: string;                    // Frappe site name
  subdomain: string;
  company: string;
  currency: string;
  timezone: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
  active: boolean;
}
```

### 3.3 Tenant Branding

```typescript
// lib/tenant/tenant-branding.ts

/**
 * Per-tenant branding customization.
 * Loaded at runtime based on resolved tenant.
 */
export interface TenantBranding {
  logo: string;                    // URL to logo image
  logoAlt: string;                 // Alt text for logo
  companyName: string;             // Display name
  tagline?: string;                // Optional tagline
  primaryColor?: string;           // Override brand color (OKLCH)
  faviconUrl?: string;             // Custom favicon
}

/**
 * Apply tenant branding to the UI.
 * Called once on app initialization.
 */
export function applyTenantBranding(branding: TenantBranding): void {
  // Update CSS custom property for brand color
  if (branding.primaryColor) {
    document.documentElement.style.setProperty(
      '--color-obsidian-brand',
      branding.primaryColor
    );
  }

  // Update document title
  document.title = `${branding.companyName} — Obsidian ERP`;

  // Update favicon
  if (branding.faviconUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = branding.faviconUrl;
    }
  }
}
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

name: Deploy Obsidian ERP

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: versalabs-studio/obsidian-erp

jobs:
  # ── BUILD & TEST ──
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      
      # Build Docker image
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  # ── DEPLOY TO VPS ──
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/obsidian-erp
            docker compose pull frontend
            docker compose up -d frontend --no-deps
            echo "✅ Deployed $(date)"
```

### 4.2 Deployment Checklist

```
PRE-DEPLOY:
[ ] All tests pass (pnpm lint, pnpm build)
[ ] TypeScript compiles with zero errors
[ ] No `any` in production paths
[ ] Environment variables verified
[ ] Database migrations applied (if any)

DEPLOY:
[ ] Docker image built and pushed
[ ] VPS pulls latest image
[ ] docker compose up -d (zero-downtime)
[ ] Health check passes

POST-DEPLOY:
[ ] Verify frontend loads
[ ] Verify API connectivity to Frappe
[ ] Verify AI panel functional
[ ] Verify all tenant subdomains resolve
[ ] Check error logs
[ ] Notify team
```

---

## 5. Environment Management

### 5.1 Environment Variables

```env
# ── CORE ──
NODE_ENV=production
NEXT_PUBLIC_FRAPPE_URL=http://frappe:8000
FRAPPE_API_KEY=xxxxx
FRAPPE_API_SECRET=xxxxx

# ── AI ──
OPENROUTER_API_KEY=sk-or-v1-xxxxx
NEXT_PUBLIC_AI_ENABLED=true
NEXT_PUBLIC_APP_URL=https://app.obsidian.versalabs.io

# ── MULTI-TENANT ──
DEFAULT_SITE=obsidian.local
TENANT_MODE=subdomain

# ── DATABASE ──
DB_ROOT_PASSWORD=xxxxx

# ── SECURITY ──
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=https://app.obsidian.versalabs.io

# ── MONITORING ──
UPTIME_KUMA_URL=https://status.versalabs.io
```

### 5.2 Environment Hierarchy

| Environment | Purpose | Frappe Site | AI |
|-------------|---------|-------------|-----|
| **Development** | Local dev | `dev.local` | Optional (mock available) |
| **Staging** | Pre-production testing | `staging.obsidian.local` | Enabled |
| **Production** | Live clients | `{tenant}.obsidian.local` | Enabled |
| **Demo** | Sales demonstrations | `demo.obsidian.local` | Enabled |

---

## 6. Monitoring & Observability

### 6.1 Health Checks

```typescript
// app/api/health/route.ts

export async function GET() {
  const checks = {
    frontend: 'ok',
    frappe: await checkFrappe(),
    redis: await checkRedis(),
    ai: await checkAI(),
    timestamp: new Date().toISOString(),
    version: '4.0.0',
  };

  const isHealthy = Object.values(checks)
    .filter(v => typeof v === 'string')
    .every(v => v === 'ok');

  return Response.json(checks, { 
    status: isHealthy ? 200 : 503 
  });
}
```

### 6.2 Monitoring Stack

```
┌─────────────────────────────────────────┐
│           MONITORING                     │
├─────────────────────────────────────────┤
│                                          │
│  UPTIME KUMA                            │
│  ├── Frontend health: /api/health       │
│  ├── Frappe health: /api/method/ping    │
│  ├── MariaDB: TCP 3306                  │
│  ├── Redis: TCP 6379                    │
│  └── SSL Certificate expiry             │
│                                          │
│  ALERTS → Email + Telegram              │
│                                          │
│  LOGS                                    │
│  ├── Next.js: docker logs frontend      │
│  ├── Frappe: /data/frappe/logs/         │
│  ├── MariaDB: /data/mariadb/logs/       │
│  └── AI Audit: /data/ai-audit.jsonl     │
│                                          │
└─────────────────────────────────────────┘
```

---

## 7. Client Onboarding Flow

### 7.1 Onboarding Steps

```
STEP 1: TENANT PROVISIONING (VersaLabs Admin)
  ├── Run setup-tenant.sh
  ├── Configure subdomain DNS
  ├── Generate API credentials
  └── Verify site is accessible

STEP 2: COMPANY SETUP (Client Admin)
  ├── Company name, logo, address
  ├── Currency (ETB default)
  ├── Fiscal year
  ├── Chart of Accounts (standard Ethiopian)
  └── Tax templates (Ethiopian VAT 15%)

STEP 3: MASTER DATA (Client Admin)
  ├── Item Groups (categories)
  ├── Items (products / services)
  ├── Warehouses
  ├── Customers (import from spreadsheet)
  ├── Suppliers (import from spreadsheet)
  └── Employees

STEP 4: CONFIGURATION (VersaLabs Support)
  ├── Approval workflows
  ├── Email notifications
  ├── Print formats
  ├── User accounts + roles
  └── AI assistant activation

STEP 5: TRAINING (VersaLabs Support)
  ├── 30-minute guided tour (react-joyride)
  ├── Create first quotation (live)
  ├── Process first sale (live)
  ├── AI assistant walkthrough
  └── Support contact provided
```

### 7.2 Onboarding Portal (VersaLabs Website)

```
obsidian.versalabs.io/onboarding

Page Flow:
1. Company Information Form
2. Industry Selection (Manufacturing / Services / Trading)
3. Module Selection (which modules to activate)
4. Admin Account Setup
5. Demo Data Option (populate with sample data?)
6. Review & Launch
```

### 7.3 Demo Data Seeder

```typescript
// scripts/seed-data.js

/**
 * Seed demo data for a new tenant.
 * Creates realistic sample data for each module.
 */
const DEMO_DATA = {
  customers: [
    { customer_name: 'Abebe Trading PLC', customer_type: 'Company', territory: 'Addis Ababa' },
    { customer_name: 'Tigist Materials', customer_type: 'Company', territory: 'Addis Ababa' },
    { customer_name: 'Dawit & Sons', customer_type: 'Company', territory: 'Dire Dawa' },
  ],
  items: [
    { item_code: 'BC-PM', item_name: 'Business Cards (Premium Matte)', item_group: 'Printed Materials', stock_uom: 'Box' },
    { item_code: 'LH-A4', item_name: 'Letterhead A4 Color', item_group: 'Printed Materials', stock_uom: 'Ream' },
    { item_code: 'BRO-TF', item_name: 'Tri-Fold Brochure', item_group: 'Printed Materials', stock_uom: 'Nos' },
    { item_code: 'INK-CY', item_name: 'Cyan Ink Cartridge', item_group: 'Raw Materials', stock_uom: 'Nos' },
    { item_code: 'PPR-A4', item_name: 'A4 Paper 80gsm', item_group: 'Raw Materials', stock_uom: 'Ream' },
  ],
  warehouses: [
    { warehouse_name: 'Main Warehouse', warehouse_type: 'Storage' },
    { warehouse_name: 'WIP', warehouse_type: 'Production' },
    { warehouse_name: 'Finished Goods', warehouse_type: 'Dispatch' },
  ],
  suppliers: [
    { supplier_name: 'Mega Printing Supplies', supplier_group: 'Raw Material' },
    { supplier_name: 'Addis Paper Co', supplier_group: 'Raw Material' },
  ],
};
```

---

## 8. Backup & Disaster Recovery

### 8.1 Backup Strategy

```
AUTOMATED BACKUPS (Daily):
  ├── MariaDB dump (all tenant databases)
  ├── Frappe sites directory (files, uploads)
  ├── Redis snapshot
  └── Compressed and uploaded to backup storage

RETENTION POLICY:
  ├── Daily backups: 30 days
  ├── Weekly backups: 12 weeks
  └── Monthly backups: 12 months

BACKUP SCRIPT:
  docker exec obsidian-mariadb mysqldump --all-databases > /data/backups/$(date +%Y%m%d).sql
  tar -czf /data/backups/sites-$(date +%Y%m%d).tar.gz /data/frappe/sites/
```

### 8.2 Disaster Recovery Procedure

```
RTO (Recovery Time Objective): < 2 hours
RPO (Recovery Point Objective): < 24 hours

RECOVERY STEPS:
1. Provision new VPS (10 min)
2. Install Docker + pull images (10 min)
3. Restore MariaDB from backup (20 min)
4. Restore Frappe sites from backup (10 min)
5. Update DNS to new VPS (5 min + propagation)
6. Verify all tenants accessible (30 min)
7. Notify clients (10 min)
```

---

## 9. Security Hardening

### 9.1 Infrastructure Security

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Network** | Firewall (UFW) | Only 80, 443, SSH open |
| **SSH** | Key-only authentication | Password auth disabled |
| **SSL** | Let's Encrypt auto-renewal | Traefik handles |
| **Docker** | Non-root containers | USER directive in Dockerfile |
| **Database** | No external access | MariaDB on internal network only |
| **Redis** | No external access | Redis on internal network only |
| **Secrets** | Environment variables | Never in code or Docker images |

### 9.2 Application Security

| Concern | Implementation |
|---------|----------------|
| **Authentication** | Frappe token-based auth (API key + secret) |
| **Authorization** | Role-based access control via Frappe roles |
| **Input Validation** | Zod schemas on all API boundaries |
| **CORS** | Strict origin policy (only tenant subdomains) |
| **Rate Limiting** | Per-tenant, per-user limits on API routes |
| **XSS** | React's built-in escaping + CSP headers |
| **CSRF** | SameSite cookies + token validation |
| **SQL Injection** | Frappe ORM (parameterized queries) |
| **AI Security** | Guardrails, confirmation, audit logging |

---

## 10. Scaling Strategy

### 10.1 Vertical Scaling (Phase 1: 1-20 Tenants)

```
Single VPS:
  4 vCPU / 8GB RAM / 160GB SSD
  Handles: ~20 concurrent tenants, ~100 concurrent users
  Cost: ~$30/month
```

### 10.2 Horizontal Scaling (Phase 2: 20-100 Tenants)

```
Load Balanced:
  2x Frontend servers (behind Traefik)
  1x Dedicated DB server (MariaDB)
  1x Dedicated Redis server
  Shared storage (NFS or S3)
  Handles: ~100 tenants, ~500 concurrent users
  Cost: ~$120/month
```

### 10.3 Managed Services (Phase 3: 100+ Tenants)

```
Cloud-Managed:
  Frontend: Vercel or AWS ECS
  Database: AWS RDS / DigitalOcean Managed DB
  Cache: AWS ElastiCache / Managed Redis
  Storage: S3 / Spaces
  CDN: CloudFront / Cloudflare
  Handles: Unlimited tenants
  Cost: Usage-based
```

---

## 11. Implementation Roadmap

### 11.1 V4 Phase Plan

```
PHASE 1: FOUNDATION (Weeks 1-3)
├── Brand migration (Pana → Obsidian)
├── Package.json, metadata, theme updates
├── V4 directory structure setup
├── SmartForm Wizard engine (FlowWizard component)
├── Command Palette component
├── Flow Tracker component
├── KPI Card + Action Card components
└── Sales Order module rebuild (Golden Template)

PHASE 2: MODULE COMPLETION (Weeks 4-8)
├── Complete semi-complete modules (Stock Entry, Material Request)
├── Build documented-only modules (Delivery Note, Accounting suite)
├── Build new modules (RFQ, Supplier Quotation, Product Bundle)
├── Customer → Master Module upgrade
├── Project → Master Module upgrade
├── Item → Master Module extension
├── Tax Templates Master Module
└── Terms & Conditions Master Module

PHASE 3: AI INTEGRATION (Weeks 9-11)
├── OpenRouter client + model router
├── Tool calling framework
├── Context resolution engine
├── Action execution engine
├── AI Copilot UI component
├── System prompt engineering
├── Testing with 10 scenarios
└── Guardrails + audit logging

PHASE 4: DEPLOYMENT & ONBOARDING (Weeks 12-14)
├── Docker configuration
├── Multi-tenant middleware
├── Tenant provisioning script
├── CI/CD pipeline (GitHub Actions)
├── VPS setup + SSL
├── Demo tenant with seed data
├── Client onboarding flow
└── VersaLabs website integration

PHASE 5: POLISH & PILOT (Weeks 15-16)
├── End-to-end testing (all flows)
├── Performance optimization
├── Accessibility audit
├── Mobile responsiveness verification
├── Pilot deployment to 3 clients
├── Feedback collection + iteration
└── GA preparation
```

### 11.2 Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| SmartForm Wizard | 🔴 Critical | Medium | **P0** |
| Flow Tracker | 🔴 Critical | Low | **P0** |
| Command Palette | 🟡 High | Low | **P1** |
| KPI Dashboards | 🟡 High | Medium | **P1** |
| AI Copilot | 🟡 High | High | **P1** |
| Module Completion | 🔴 Critical | High | **P0** |
| Multi-Tenant | 🟡 High | Medium | **P1** |
| Docker Deployment | 🟡 High | Low | **P1** |
| Activity Tracking | 🟢 Medium | Low | **P2** |
| Onboarding Portal | 🟢 Medium | Medium | **P2** |
| Reseller Module | 🟢 Medium | Medium | **P2** |

---

## Appendix: Complete Module Registry

### V4 Complete DocType/Module Map

```
MODULE: CRM
├── Lead (Master Module — V4 upgrade)
│   ├── Lead Source (Settings)
│   └── Lead → Customer conversion
├── Customer (Master Module — V4 upgrade)
│   ├── Customer Group (Settings)
│   ├── Territory (Settings)
│   └── Linked: Addresses, Contacts, Orders, Invoices, Payments
├── Contact (Standard)
├── Address (Standard)
├── Opportunity (Standard)
└── Settings: Industry Type, Salutation, Gender, Country

MODULE: SALES
├── Quotation (Standard + attachment support)
├── Sales Order (Golden Template — V4)
│   ├── Auto-create from Quotation
│   └── Auto-create Work Orders
├── Sales Person (Settings)
├── Sales Partner (Settings)
├── Project (Master Module — V4 upgrade)
│   ├── Task
│   └── Timesheet
└── Settings: Tax Template, Terms & Conditions, Sales Partner Type

MODULE: STOCK
├── Item (Master Module — V4 extension)
│   ├── Item Group (Settings)
│   ├── Item Price (Master Module — V4)
│   ├── UOM (Settings)
│   └── Product Bundle (NEW)
├── Warehouse (Standard)
├── Material Request (Complete + UX)
├── Stock Entry (Complete + UX)
├── Delivery Note (Full build + UX)
│   ├── Driver (Settings)
│   └── Vehicle (Settings)
├── Purchase Receipt (Standard)
└── Item Export (NEW)

MODULE: BUYING
├── Supplier (Standard)
├── Purchase Order (Standard + approval workflow)
│   ├── Auto-repeat support
│   └── Min stock qty notification
├── Request for Quotation (NEW)
└── Supplier Quotation (NEW)

MODULE: MANUFACTURING
├── BOM (Standard + Quality Inspection + Scrap/Loss)
│   ├── BOM Item
│   ├── BOM Operation
│   ├── BOM Scrap Item
│   └── Fixed time option on Operation
├── Work Order (Standard + UOM roundup fix)
│   ├── Work Order Item
│   └── Work Order Operation
├── Workstation (Standard + Operation flow)
├── Operation (Standard + Workstation flow)
└── Quality Inspection (NEW)
    └── Quality Inspection Template

MODULE: ACCOUNTING
├── Sales Invoice (Full build)
├── Purchase Invoice (Full build)
├── Payment Entry (Full build)
├── Journal Entry (Full build)
├── Account / Chart of Accounts (Settings)
├── Cost Center (Settings)
├── Mode of Payment (Settings)
├── Payment Terms Template (Master Module — V4)
├── Fiscal Year (Settings)
├── Currency (Settings)
├── Price List (Settings)
├── Tax Category (NEW Master Module)
└── Tax Template (NEW Master Module)

MODULE: HR
├── Employee (Standard)
├── Department (Settings)
└── Designation (Settings)

MODULE: ASSETS
├── Asset (Standard)
└── Asset Category (Settings)

MODULE: SYSTEM (Cross-Cutting)
├── Activity Tracking (NEW — global)
├── Notification (System + Email)
├── AI Assistant (NEW)
└── Company (Settings)

MODULE: RESELLER (Add-On)
├── Reseller (NEW)
├── Commission (NEW)
└── Reseller Dashboard (NEW)

TOTAL: ~65 DocTypes across 9 modules + 1 add-on
```

---

## Summary

Part 4 completes the architecture:

1. ✅ **Deployment Architecture** — Traefik + Next.js + Frappe + MariaDB + Redis
2. ✅ **Docker Configuration** — Production + dev compose files, Dockerfile
3. ✅ **Multi-Tenant** — Provisioning script, middleware, branding
4. ✅ **CI/CD** — GitHub Actions build → deploy → verify
5. ✅ **Environment Management** — Variables, hierarchy, secrets
6. ✅ **Monitoring** — Health checks, Uptime Kuma, logging
7. ✅ **Client Onboarding** — 5-step process, demo seeder, portal
8. ✅ **Backup & DR** — Daily backups, retention, recovery procedure
9. ✅ **Security** — Infrastructure + application hardening
10. ✅ **Scaling Strategy** — Vertical → horizontal → managed services
11. ✅ **Implementation Roadmap** — 16-week phased plan
12. ✅ **Complete Module Registry** — All 65 DocTypes mapped

---

*Obsidian ERP v4.0 Architecture — Part 4 of 4*  
*© 2026 VersaLabs Studio. All rights reserved.*
