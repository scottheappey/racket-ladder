# Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration ✅
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all production values in `.env.production`
- [ ] Verify all secrets are production-ready (not test/dev values)
- [ ] Ensure all URLs point to production domains
- [ ] Test environment variables locally with production build

### 2. Database Setup ✅
- [ ] Production PostgreSQL database provisioned
- [ ] Database connection string tested
- [ ] Run `npx prisma migrate deploy` for production schema
- [ ] Seed production data if needed
- [ ] Database backups configured
- [ ] Connection pooling configured

### 3. Authentication & Security ✅
- [ ] Google OAuth configured for production domain
- [ ] AUTH_SECRET generated and secure (32+ characters)
- [ ] CSRF protection enabled
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled

### 4. Payment Processing ✅
- [ ] Stripe live keys configured
- [ ] Webhook endpoints configured for production
- [ ] Test payment flow in production
- [ ] Webhook signature verification working
- [ ] Payment failure handling tested

### 5. Email Notifications ✅
- [ ] Resend API configured for production
- [ ] FROM_EMAIL domain verified
- [ ] Email templates tested
- [ ] Email delivery monitoring setup

### 6. Performance & Monitoring ✅
- [ ] Next.js production build optimized
- [ ] Image optimization configured
- [ ] Caching strategy implemented
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog) configured
- [ ] Performance monitoring setup

### 7. Infrastructure ✅
- [ ] Domain configured and DNS pointing to deployment
- [ ] SSL certificate provisioned
- [ ] CDN configured (if using)
- [ ] Load balancing configured (if needed)
- [ ] Health checks implemented

## Deployment Steps

### Option A: Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - Deploy again to apply changes

3. **Configure Domain**
   - Add custom domain in Vercel Dashboard
   - Update DNS records as instructed
   - Verify SSL certificate

### Option B: Railway Deployment

1. **Deploy from GitHub**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

2. **Configure Environment Variables**
   - Use Railway Dashboard or CLI to set variables
   - Ensure DATABASE_URL points to Railway PostgreSQL

### Option C: Docker Deployment

1. **Build and Deploy**
   ```bash
   # Build production image
   docker build -t racket-ladder .
   
   # Run with environment file
   docker run -d \
     --name racket-ladder \
     --env-file .env.production \
     -p 3000:3000 \
     racket-ladder
   ```

2. **Docker Compose (with PostgreSQL)**
   ```bash
   # Use production docker-compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Post-Deployment Verification

### 1. Functional Testing
- [ ] User registration and login works
- [ ] OAuth flow works with production callbacks
- [ ] Admin dashboard accessible
- [ ] Match creation and results work
- [ ] Payment processing works end-to-end
- [ ] Email notifications sent successfully
- [ ] CSV import functionality works
- [ ] Magic invite links work

### 2. Performance Testing
- [ ] Page load times acceptable (< 3s)
- [ ] Database queries optimized
- [ ] API endpoints responding quickly
- [ ] Image optimization working
- [ ] Caching headers set correctly

### 3. Security Testing
- [ ] HTTPS enforced everywhere
- [ ] Security headers present
- [ ] Authentication working correctly
- [ ] Admin access properly restricted
- [ ] Payment data secure
- [ ] No sensitive data in client

### 4. Monitoring Setup
- [ ] Error tracking receiving events
- [ ] Performance monitoring active
- [ ] Database monitoring configured
- [ ] Uptime monitoring setup
- [ ] Log aggregation working

## Maintenance & Operations

### Regular Tasks
- **Daily**: Monitor error rates and performance
- **Weekly**: Review system logs and user feedback
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance review and optimization

### Backup Strategy
- **Database**: Automated daily backups with 30-day retention
- **Files**: S3 backup of uploaded content
- **Code**: Git repository with tagged releases

### Scaling Considerations
- **Database**: Read replicas for heavy read workloads
- **Application**: Horizontal scaling with load balancer
- **Storage**: CDN for static assets and images
- **Caching**: Redis for session storage and API caching

### Emergency Procedures
- **Downtime**: Rollback process documented
- **Data Loss**: Restore from latest backup
- **Security Incident**: Incident response plan
- **High Load**: Auto-scaling configuration

## Support & Documentation

### User Documentation
- Getting started guide for players
- Admin guide for ladder management
- Payment and refund policies
- Privacy policy and terms of service

### Technical Documentation
- API documentation
- Database schema documentation
- Deployment runbook
- Troubleshooting guide

---

## Quick Start Commands

```bash
# Development
npm run dev

# Production Build Test
npm run build
npm start

# Database Operations
npm run prisma:migrate
npm run prisma:generate
npm run seed

# Testing
npm run test
npm run type-check
npm run lint

# Deployment
vercel --prod
# or
railway up
# or
docker build -t racket-ladder . && docker run -p 3000:3000 racket-ladder
```

## Need Help?

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Review environment variables in `.env.production.example`
3. Test locally with production build: `npm run build && npm start`
4. Verify all external services are configured correctly

---

**✅ This checklist ensures a smooth, secure, and scalable production deployment of your Racket Ladder application.**
