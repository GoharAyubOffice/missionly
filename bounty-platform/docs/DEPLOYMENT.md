# Deployment Guide

## Overview

This guide covers the complete deployment process for the Bounty Platform, including CI/CD setup, environment configuration, and production monitoring.

## Prerequisites

- GitHub repository with main branch
- Vercel account
- Supabase project
- Domain name (optional)

## 1. Initial Setup

### 1.1 Vercel Project Setup

1. **Connect GitHub Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link project
   vercel link
   ```

2. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### 1.2 Environment Variables

#### Production Environment Variables (Vercel Dashboard)

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email
RESEND_API_KEY=re_your-production-api-key
RESEND_FROM_EMAIL=noreply@your-domain.com

# Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@your-domain.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Cron Jobs
CRON_SECRET=your-secure-cron-secret
```

#### GitHub Secrets (Repository Settings > Secrets)

```bash
# Vercel Integration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# All environment variables from production
# (Copy all the above environment variables as GitHub secrets)

# Additional CI/CD secrets
LHCI_GITHUB_APP_TOKEN=your-lighthouse-ci-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

## 2. Database Setup

### 2.1 Supabase Configuration

1. **Create Supabase Project**
   ```bash
   # Initialize Supabase
   npx supabase init
   
   # Link to your project
   npx supabase link --project-ref your-project-ref
   ```

2. **Run Migrations**
   ```bash
   # Apply all migrations
   npx supabase db push
   
   # Or apply specific migrations
   npx supabase db push --file supabase/migrations/20250624000001_enable_realtime_messaging.sql
   npx supabase db push --file supabase/migrations/20250624000002_setup_push_notifications.sql
   ```

3. **Deploy Edge Functions**
   ```bash
   # Deploy push notification function
   npx supabase functions deploy send-push-notification
   
   # Set function secrets
   npx supabase secrets set \
     VAPID_PUBLIC_KEY="your-vapid-public-key" \
     VAPID_PRIVATE_KEY="your-vapid-private-key" \
     VAPID_SUBJECT="mailto:admin@your-domain.com"
   ```

### 2.2 Database Security

1. **Enable RLS on all tables**
2. **Configure appropriate policies**
3. **Set up database backups**
4. **Configure database monitoring**

## 3. CI/CD Pipeline

### 3.1 GitHub Actions Workflow

The workflow automatically:
- ✅ Runs linting and type checking
- ✅ Executes test suite with coverage
- ✅ Builds the application
- ✅ Performs security scans
- ✅ Deploys preview for PRs
- ✅ Deploys to production on main branch
- ✅ Runs Lighthouse audits
- ✅ Sends notifications to Slack

### 3.2 Deployment Process

**For Pull Requests:**
1. Code is linted and tested
2. Security scan is performed
3. Preview deployment is created
4. PR comment shows preview URL

**For Main Branch:**
1. Full CI pipeline runs
2. Production deployment to Vercel
3. Supabase functions are deployed
4. Database migrations are applied
5. Health checks are performed
6. Lighthouse audit is run
7. Team is notified via Slack

## 4. Production Monitoring

### 4.1 Error Tracking

**Sentry Configuration:**
- Automatic error capture
- Performance monitoring
- Release tracking
- User feedback collection

**Custom Error Tracking:**
```typescript
import { trackError } from '@/lib/analytics';

try {
  // Your code
} catch (error) {
  trackError(error, { context: 'payment_processing' });
}
```

### 4.2 Analytics & Performance

**Vercel Analytics:**
- Page views and user sessions
- Custom event tracking
- Web Vitals monitoring
- Real user performance data

**Custom Business Metrics:**
```typescript
import { trackBusinessEvent } from '@/lib/analytics';

// Track business events
trackBusinessEvent('bounty_created', {
  bounty_id: 'bounty-123',
  category: 'app_marketing',
  budget: 1000,
});
```

### 4.3 Health Monitoring

**Health Check Endpoint:**
- `/api/health` - System health status
- Database connectivity
- External service status
- Environment validation

**Uptime Monitoring:**
```bash
# Example uptime monitoring setup
curl -f https://your-domain.com/api/health || exit 1
```

## 5. Maintenance & Operations

### 5.1 Scheduled Tasks

**Automated Cleanup (Daily 2 AM):**
- Remove expired push subscriptions
- Clean up old notification logs
- Archive completed bounties

**Weekly Digest (Monday 9 AM):**
- Send user activity summaries
- Business performance reports
- System health reports

### 5.2 Database Management

**Regular Tasks:**
```bash
# Update dependencies (weekly)
npm update && npm audit fix

# Database maintenance
npx prisma db push
npx prisma generate

# Monitor database performance
npx supabase db inspect
```

### 5.3 Security Updates

**Automated Security:**
- Dependabot for dependency updates
- GitHub CodeQL for code analysis
- Regular security audits via `npm audit`

**Manual Security Reviews:**
- Monthly security assessment
- Review access controls
- Update API keys and secrets
- Check for exposed credentials

## 6. Troubleshooting

### 6.1 Common Issues

**Deployment Failures:**
```bash
# Check build logs
vercel logs --url=your-deployment-url

# Local debugging
npm run build
npm run type-check
npm run lint
```

**Database Issues:**
```bash
# Check database connectivity
npx supabase db ping

# Reset database (development only)
npx supabase db reset
```

**Environment Variables:**
```bash
# Verify environment setup
vercel env ls

# Test locally with production variables
vercel env pull .env.local
```

### 6.2 Performance Issues

**Debug Performance:**
1. Check Vercel Analytics for slow pages
2. Review Lighthouse reports
3. Monitor Web Vitals
4. Check database query performance

**Optimize Performance:**
1. Enable Next.js image optimization
2. Implement proper caching
3. Optimize database queries
4. Use CDN for static assets

## 7. Scaling Considerations

### 7.1 Traffic Scaling

**Horizontal Scaling:**
- Vercel automatically scales functions
- Database connection pooling
- Redis for session management
- CDN for static assets

**Performance Optimization:**
- Image optimization and compression
- Code splitting and lazy loading
- Database query optimization
- Caching strategies

### 7.2 Feature Scaling

**Monitoring Thresholds:**
- Response time > 2 seconds
- Error rate > 1%
- Database connections > 80%
- Memory usage > 512MB

**Scaling Actions:**
- Upgrade Vercel plan
- Optimize database queries
- Implement Redis caching
- Review and optimize code

## 8. Backup & Recovery

### 8.1 Data Backup

**Automatic Backups:**
- Supabase: Daily automated backups
- Code: GitHub repository
- Environment: Vercel settings

**Manual Backup Process:**
```bash
# Export database
npx supabase db dump > backup.sql

# Export environment variables
vercel env pull .env.backup
```

### 8.2 Disaster Recovery

**Recovery Steps:**
1. Restore database from backup
2. Redeploy application from GitHub
3. Restore environment variables
4. Verify all services are running
5. Run health checks
6. Notify users if necessary

**Recovery Time Objectives:**
- RTO: 4 hours maximum downtime
- RPO: 24 hours maximum data loss
- Communication: Update status page within 15 minutes

## 9. Post-Deployment Checklist

### 9.1 Immediate Checks

- [ ] Application loads correctly
- [ ] User registration works
- [ ] Database connectivity confirmed
- [ ] Push notifications working
- [ ] Payment processing functional
- [ ] Email sending operational
- [ ] All environment variables set
- [ ] SSL certificate valid
- [ ] Analytics tracking enabled

### 9.2 24-Hour Monitoring

- [ ] Error rates within normal range
- [ ] Performance metrics acceptable
- [ ] User feedback positive
- [ ] No security alerts
- [ ] Backup systems functioning
- [ ] Monitoring alerts working

### 9.3 Weekly Review

- [ ] Review analytics data
- [ ] Check performance trends
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Security scan results
- [ ] User feedback analysis

## 10. Support & Documentation

### 10.1 Documentation Updates

Keep the following updated:
- API documentation
- Environment variable lists
- Deployment procedures
- Troubleshooting guides
- Performance benchmarks

### 10.2 Team Communication

**Deployment Notifications:**
- Slack channel for deployments
- Email alerts for critical issues
- Status page for user communication
- Team wiki for procedures

**On-Call Procedures:**
- 24/7 monitoring setup
- Escalation procedures
- Contact information
- Emergency response plan