# Vercel Deployment Setup Guide

This guide will help you deploy the ParcelAce Admin application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository connected to GitHub, GitLab, or Bitbucket
3. Node.js installed locally (for CLI deployment, optional)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Your Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository (GitHub, GitLab, or Bitbucket)
   - Authorize Vercel to access your repository if needed

2. **Configure Project Settings**
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build:production`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (default)

3. **Environment Variables**
   Add the following environment variables in the Vercel dashboard:
   
   **For Production:**
   - `VITE_API_URL` = `https://parcelace.in/`
   - `NODE_ENV` = `production`
   
   **For Preview/Staging:**
   - `VITE_API_URL` = `https://app.parcelace.io/`
   - `NODE_ENV` = `staging`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - You'll get a deployment URL (e.g., `your-project.vercel.app`)

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   npm run deploy:vercel
   ```

4. **Deploy Preview**
   ```bash
   npm run deploy:vercel:preview
   ```

## Environment Configuration

### Setting Environment Variables

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Production Environment (Production Branch)
```
VITE_API_URL=https://parcelace.in/
NODE_ENV=production
```

#### Preview/Staging Environment (All other branches)
```
VITE_API_URL=https://app.parcelace.io/
NODE_ENV=staging
```

### Environment Detection

The application automatically detects the environment based on:
1. Environment variables (`VITE_API_URL`)
2. Hostname detection (Vercel domains)
3. Build mode (`NODE_ENV`)

Vercel domains are automatically detected:
- Production deployments use the production API
- Preview/branch deployments use the staging API

## Branch Deployments

Vercel automatically creates preview deployments for:
- Pull requests
- Branch pushes
- Commits

Each preview deployment gets a unique URL like:
- `your-project-git-branch-name.vercel.app`

## Custom Domain Setup

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `admin.parcelace.io`)
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

## Build Configuration

The project uses the following build configuration (defined in `vercel.json`):

- **Build Command**: `npm run build:production`
- **Output Directory**: `dist`
- **Framework**: Vite
- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Security Headers**: Configured for XSS protection, frame options, etc.

## Deployment Scripts

The following npm scripts are available:

- `npm run deploy:vercel` - Deploy to production
- `npm run deploy:vercel:preview` - Deploy preview

## Troubleshooting

### Build Failures

1. **Check Build Logs**
   - Go to your deployment in Vercel Dashboard
   - Click on the failed deployment
   - Review build logs for errors

2. **Common Issues**
   - Missing environment variables
   - Node version mismatch (check `package.json` engines)
   - Build command errors

### Environment Variables Not Working

1. Ensure variables are prefixed with `VITE_` for Vite to expose them
2. Redeploy after adding new environment variables
3. Check variable names match exactly (case-sensitive)

### Routing Issues

- The `vercel.json` includes SPA routing configuration
- All routes should redirect to `index.html`
- If routes don't work, check the `rewrites` section in `vercel.json`

## Continuous Deployment

Vercel automatically deploys:
- **Production**: On push to main/master branch
- **Preview**: On push to any other branch or pull request

## Monitoring

- View deployment status in Vercel Dashboard
- Check build logs for each deployment
- Monitor performance in Vercel Analytics (if enabled)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For issues specific to this project, check:
- Build logs in Vercel Dashboard
- Application logs in browser console
- Environment configuration in `src/config/environment.ts`

