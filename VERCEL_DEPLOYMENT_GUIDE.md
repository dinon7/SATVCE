# VCE Career Guidance - Vercel Deployment Guide

## Overview
This guide will help you deploy your VCE Career Guidance application to Vercel. The application consists of a Next.js frontend and a FastAPI backend.

## Prerequisites
- GitHub repository with your code (already done)
- Vercel account (free tier available)
- Environment variables configured

## Step 1: Set Up Vercel Account

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket
   - Connect your GitHub account

2. **Install Vercel CLI (Optional)**
   ```bash
   npm i -g vercel
   ```

## Step 2: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository: `dinon7/VCECareerChooser`

2. **Configure Project Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install`

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Backend API URL (you'll need to deploy backend separately)
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Services
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

   # Other Configuration
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be available at: `https://your-project-name.vercel.app`

### Option B: Deploy via CLI

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow Prompts**
   - Link to existing project or create new
   - Set environment variables
   - Deploy

## Step 3: Deploy Backend (Alternative Options)

Since Vercel is primarily for frontend applications, you have several options for the backend:

### Option A: Deploy Backend to Vercel (Serverless Functions)

1. **Convert Backend to Vercel Functions**
   - Move backend logic to `frontend/src/app/api/` directory
   - Convert FastAPI routes to Next.js API routes
   - Update frontend to use local API routes

2. **Update API Routes**
   - All backend functionality should be in `frontend/src/app/api/`
   - Use Next.js API routes instead of FastAPI

### Option B: Deploy Backend to Railway/Render/Heroku

1. **Railway** (Recommended)
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

2. **Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Heroku**
   - Create `Procfile` in backend directory
   - Add: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Deploy via Heroku CLI or GitHub integration

## Step 4: Update Environment Variables

After deploying backend, update frontend environment variables:

1. **Go to Vercel Dashboard**
   - Project Settings → Environment Variables

2. **Update Backend URL**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
   ```

3. **Redeploy Frontend**
   - Trigger new deployment in Vercel dashboard

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Vercel Dashboard → Domains
   - Add your domain
   - Configure DNS settings

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates

## Step 6: Set Up Environment Variables

### Required Environment Variables

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app

# AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Production Settings
NODE_ENV=production
```

## Step 7: Test Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Test authentication
   - Test quiz functionality
   - Test API calls

2. **Test Backend**
   - Test API endpoints
   - Test database connections
   - Test AI services

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Redeploy after adding variables

3. **API Connection Issues**
   - Verify backend URL is correct
   - Check CORS settings
   - Ensure backend is running

4. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check Clerk dashboard settings
   - Ensure redirect URLs are configured

### Performance Optimization

1. **Enable Caching**
   - Vercel automatically caches static assets
   - Configure caching headers in `vercel.json`

2. **Optimize Images**
   - Use Next.js Image component
   - Configure image domains in `next.config.js`

3. **Bundle Analysis**
   - Use `@next/bundle-analyzer` to analyze bundle size
   - Optimize imports and dependencies

## Monitoring and Analytics

1. **Vercel Analytics**
   - Enable in project settings
   - Monitor performance metrics

2. **Error Tracking**
   - Set up Sentry or similar service
   - Monitor application errors

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to repository
   - Use Vercel's environment variable system

2. **API Security**
   - Implement proper authentication
   - Use HTTPS for all API calls
   - Validate input data

3. **CORS Configuration**
   - Configure CORS properly for production
   - Limit allowed origins

## Next Steps

1. **Set up CI/CD**
   - Configure automatic deployments
   - Set up staging environment

2. **Monitoring**
   - Set up logging and monitoring
   - Configure alerts

3. **Backup Strategy**
   - Set up database backups
   - Configure disaster recovery

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Note**: This deployment guide assumes you have all the necessary API keys and services configured. Make sure to set up Clerk, Supabase, and other services before deployment. 