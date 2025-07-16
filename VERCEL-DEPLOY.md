# Quick Vercel Deployment Guide

## Step 1: Deploy to Vercel

Run this command and follow the prompts:
```bash
vercel
```

When prompted:
- Set up and deploy: Y
- Scope: (your account)
- Link to existing project: N
- Project name: art-or-trash (or your choice)
- Directory: ./
- Override settings: N

## Step 2: Set Environment Variables

After deployment, go to your Vercel dashboard:
1. Select your project
2. Go to Settings → Environment Variables
3. Add these variables:

For now (SQLite mode):
- `NODE_ENV`: `development`

Later (with Supabase):
- `NODE_ENV`: `production`
- `SUPABASE_URL`: (from Supabase dashboard)
- `SUPABASE_ANON_KEY`: (from Supabase dashboard)

## Step 3: Deploy to Production

```bash
vercel --prod
```

## Your App URLs

- Preview: https://art-or-trash-[hash].vercel.app
- Production: https://art-or-trash.vercel.app (or your custom domain)

## Notes

- The app will work immediately with SQLite (data won't persist between deployments)
- To persist data, set up Supabase following DEPLOYMENT.md
- Images are loaded from external URLs, so no storage needed
- The database will be empty on first deploy - use the submit feature to add images

## Quick Test

After deployment:
1. Visit your app URL
2. Submit a few test images via /submit.html
3. Play the game!

## Troubleshooting

If images don't load:
- Check browser console for CORS errors
- Ensure image URLs are HTTPS
- Try submitting new images with known-good URLs

If API errors occur:
- Check Vercel function logs
- Verify environment variables are set
- Ensure server-hybrid.js is the entry point