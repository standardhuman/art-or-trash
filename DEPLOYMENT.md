# Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel CLI: `npm install -g vercel`
- Supabase CLI: `npm install -g supabase`
- Git repository (already initialized)

## Local Development
```bash
# Install dependencies
npm install

# Create local database and run scrapers
npm run scrape

# Start development server
npm start
```

## Deploying to Vercel

### 1. Initial Setup
```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel
```

### 2. Environment Variables
Set these in Vercel dashboard or CLI:
- `NODE_ENV`: production
- `DATABASE_URL`: (Supabase connection string)
- `SUPABASE_URL`: (from Supabase dashboard)
- `SUPABASE_ANON_KEY`: (from Supabase dashboard)

### 3. Deploy Updates
```bash
# Deploy to production
vercel --prod

# Or push to git (if connected to Vercel)
git push origin main
```

## Setting up Supabase

### 1. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save the database URL and anon key

### 2. Run Migrations
```bash
# Connect to Supabase
supabase login

# Link to your project
supabase link --project-ref <project-id>

# Run migrations
supabase db push
```

### 3. Import Data
```sql
-- Connect to Supabase SQL editor and run:
-- 1. Create tables (from migrations/001_initial_schema.sql)
-- 2. Import existing data or run scrapers
```

### 4. Update Server for Supabase
The server.js file needs to be updated to use Supabase client instead of SQLite for production. Environment variables will determine which database to use.

## Production Checklist
- [ ] Set NODE_ENV to production
- [ ] Configure Supabase connection
- [ ] Run database migrations
- [ ] Set up environment variables in Vercel
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Set up database backups

## Monitoring
- Vercel Dashboard: Check function logs and analytics
- Supabase Dashboard: Monitor database usage and performance
- Consider adding error tracking (Sentry, LogRocket, etc.)

## Troubleshooting

### Images not loading
- Check CORS settings in Supabase Storage
- Verify image URLs are accessible
- Check browser console for errors

### Database connection issues
- Verify environment variables are set correctly
- Check Supabase connection pooling settings
- Monitor database connection limits

### Slow performance
- Enable Vercel Edge Functions for API routes
- Add caching headers for static assets
- Consider CDN for images
- Optimize database queries with indexes