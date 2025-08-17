# Production Deployment Guide

This guide covers deploying the Racket Ladders MVP to production.

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Auth.js
AUTH_SECRET="your-production-auth-secret-256-bit-random-string"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (Email)
RESEND_API_KEY="re_..."

# App Configuration
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Feature Flags
FEATURE_WHATSAPP=false
```

### Security Considerations

1. **AUTH_SECRET**: Generate a 256-bit random string for production
2. **Database**: Use connection pooling and SSL in production
3. **Stripe**: Use live keys (sk_live_*, pk_live_*) for production
4. **CORS**: Configure proper origins for your domain

## Deployment Platforms

### Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables** in Vercel dashboard

4. **Database**: Use Vercel Postgres or external PostgreSQL

### Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add PostgreSQL service** in Railway dashboard

### Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t racket-ladders .
   ```

2. **Run Container**:
   ```bash
   docker run -p 3000:3000 --env-file .env racket-ladders
   ```

## Database Setup

### Production Database

1. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Client**:
   ```bash
   npx prisma generate
   ```

3. **Seed Initial Data** (optional):
   ```bash
   npx prisma db seed
   ```

### Backup Strategy

- Set up automated daily backups
- Test restore procedures
- Monitor database performance

## Third-Party Service Configuration

### Stripe Setup

1. **Webhook Endpoint**: Configure `https://yourdomain.com/api/payments/webhook`
2. **Events to Monitor**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
3. **Test Webhook** using Stripe CLI

### Resend Email Setup

1. **Domain Verification**: Add DNS records for your domain
2. **Email Templates**: Test email delivery
3. **Rate Limits**: Monitor sending quotas

### Google OAuth Setup

1. **Authorized Origins**: Add your production domain
2. **Redirect URIs**: Configure callback URLs
3. **Domain Verification**: Verify domain ownership

## Performance Optimization

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Database Optimization

- Enable connection pooling
- Add database indexes for frequently queried fields
- Monitor query performance
- Set up database monitoring

## Monitoring & Logging

### Application Monitoring

- Set up error tracking (Sentry, Bugsnag)
- Monitor API response times
- Track user engagement metrics
- Set up uptime monitoring

### Database Monitoring

- Query performance monitoring
- Connection pool monitoring
- Disk usage alerts
- Backup verification

## Maintenance

### Regular Tasks

1. **Security Updates**: Keep dependencies updated
2. **Database Maintenance**: Analyze and vacuum tables
3. **Log Rotation**: Manage log file sizes
4. **Performance Review**: Monitor and optimize slow queries

### Backup Procedures

1. **Database Backups**: Automated daily backups with retention
2. **File Storage**: Backup user uploads if applicable
3. **Configuration Backup**: Store environment configurations securely

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Configure proper CORS headers
- [ ] Enable rate limiting on APIs
- [ ] Use environment variables for secrets
- [ ] Set up proper authentication flows
- [ ] Configure security headers
- [ ] Regular security audits
- [ ] Monitor for suspicious activity

## Go-Live Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks tested
- [ ] Email delivery tested
- [ ] Google OAuth configured
- [ ] Domain DNS configured
- [ ] SSL certificates active
- [ ] Error monitoring setup
- [ ] Performance monitoring setup
- [ ] Backup procedures tested
- [ ] Load testing completed

## Post-Launch

### Immediate (First 24 hours)

- Monitor error rates
- Check email delivery
- Verify payment processing
- Monitor performance metrics

### First Week

- Review user feedback
- Monitor usage patterns
- Optimize database queries
- Check backup procedures

### Ongoing

- Regular security updates
- Performance optimization
- Feature usage analysis
- User support and feedback
