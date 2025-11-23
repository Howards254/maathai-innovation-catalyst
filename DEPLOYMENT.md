# Deployment Guide - GreenVerse

## Production Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional)
- SSL certificate (for HTTPS)

#### Quick Start
```bash
# Build and run with Docker Compose
npm run docker:compose

# Or build and run manually
npm run docker:build
npm run docker:run
```

#### Environment Variables
Create `.env.production` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Analytics (Optional)
VITE_GA_TRACKING_ID=your-google-analytics-id
```

### Option 2: Static Hosting (Vercel, Netlify)

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify Deployment
```bash
# Build for production
npm run build

# Deploy dist folder to Netlify
```

### Option 3: Traditional VPS/Server

#### Prerequisites
- Node.js 18+ and npm
- Nginx (recommended)
- PM2 for process management

#### Steps
```bash
# Clone repository
git clone <your-repo-url>
cd greenverse

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Serve with nginx (copy dist/ to web root)
# Or use a simple HTTP server
npx serve -s dist -l 3000
```

## Database Setup

### Supabase Production Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migrations**
   ```sql
   -- Copy and run SQL from supabase/migrations/ files
   -- In Supabase SQL Editor
   ```

3. **Configure Environment**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Alternative: PostgreSQL Setup

If using your own PostgreSQL:
```bash
# Create database
createdb maathai_catalyst

# Run migrations
psql -d maathai_catalyst -f supabase/migrations/001_initial_schema.sql
psql -d maathai_catalyst -f supabase/migrations/002_rls_policies.sql
# ... continue with all migration files
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Type checking
npm run type-check

# Linting
npm run lint
```

### CDN Configuration
- Enable gzip compression
- Set proper cache headers
- Use CDN for static assets
- Optimize images

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't expose sensitive data
- [ ] Security headers configured (see nginx.conf)

## Monitoring & Analytics

### Error Tracking
- Integrate with Sentry or similar service
- Monitor error rates and performance
- Set up alerts for critical issues

### Analytics
- Google Analytics integration ready
- Custom event tracking implemented
- User behavior monitoring

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query optimization

## Backup Strategy

### Database Backups
```bash
# Supabase: Use built-in backup features
# PostgreSQL: Regular pg_dump
pg_dump maathai_catalyst > backup_$(date +%Y%m%d).sql
```

### File Backups
- User uploaded images
- Configuration files
- SSL certificates

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple app instances
- Database read replicas

### Caching Strategy
- Redis for session storage
- CDN for static assets
- Database query caching

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor security vulnerabilities
- [ ] Review error logs weekly
- [ ] Database maintenance
- [ ] SSL certificate renewal

### Health Checks
```bash
# Application health endpoint
curl https://your-domain.com/health

# Database connectivity
# Monitor connection pool usage
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Verify environment variables

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

3. **Performance Issues**
   - Enable gzip compression
   - Optimize images
   - Review bundle size
   - Check database queries

### Support
- Check application logs
- Monitor error tracking service
- Review performance metrics
- Database query analysis

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Production Build
npm run build

# Docker Deployment
npm run docker:compose

# Database Setup
npm run supabase:start

# Quality Checks
npm run lint
npm run type-check
```