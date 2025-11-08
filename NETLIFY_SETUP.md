# Netlify Setup Guide for ParcelAce Admin

## Current Status
- ✅ Netlify account: **neha@parcelace.io** (logged in)
- ✅ `netlify.toml` configuration file exists
- ✅ GitHub repository: `https://github.com/desirppc/parcelace-admin.git`
- ⚠️ Site needs to be created and linked

## Option 1: Connect via Netlify Dashboard (Recommended)

### Step 1: Create New Site
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account if needed
5. Select the repository: **`desirppc/parcelace-admin`**

### Step 2: Configure Build Settings
Netlify should auto-detect these settings from `netlify.toml`:
- **Build command**: `npm run build:production`
- **Publish directory**: `dist`
- **Base directory**: (leave empty)

### Step 3: Set Environment Variables
In the site settings, add these environment variables:
- `VITE_API_URL` = `https://parcelace.in/` (for production)
- `NODE_ENV` = `production`

### Step 4: Deploy
1. Click **"Deploy site"**
2. Netlify will build and deploy your site
3. Your site will be available at a URL like: `https://parcelace-admin.netlify.app`

### Step 5: Link Local Project (Optional)
After the site is created, run this command locally:
```bash
npx netlify-cli link
```
Then select the site you just created.

## Option 2: Complete Setup via CLI

Since the CLI requires interactive input, you can complete the setup manually:

1. **Create the site** (you'll need to select the team interactively):
   ```bash
   npx netlify-cli sites:create --name parcelace-admin
   ```
   - When prompted, select **"ParcelAce- Admin"** team
   - Note the site ID that's created

2. **Link the local project**:
   ```bash
   npx netlify-cli link
   ```
   - Select **"Search by full or partial project name"**
   - Enter: `parcelace-admin`
   - Or select **"Enter a project ID"** and paste the site ID from step 1

3. **Connect to GitHub** (via dashboard):
   - Go to your site settings in Netlify dashboard
   - Go to **"Build & deploy"** → **"Continuous Deployment"**
   - Click **"Link to Git provider"**
   - Select GitHub and authorize
   - Select repository: `desirppc/parcelace-admin`
   - Select branch: `main`
   - Build settings should auto-populate from `netlify.toml`

## Environment Configuration

The `netlify.toml` file is already configured with:
- ✅ Production build command
- ✅ Publish directory (`dist`)
- ✅ Environment-specific settings
- ✅ SPA redirect rules
- ✅ Security headers

## Custom Domain (Optional)

To add a custom domain:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `admin.parcelace.io`)
4. Follow DNS configuration instructions

## Verification

After setup, verify the connection:
```bash
npx netlify-cli status
```

You should see:
- ✅ Current Netlify User: Neha Dixit (neha@parcelace.io)
- ✅ Admin URL: (your site's Netlify admin URL)
- ✅ Project URL: (your site's public URL)

## Troubleshooting

If you encounter issues:
1. **Check build logs** in Netlify dashboard
2. **Verify environment variables** are set correctly
3. **Ensure Node.js version** is compatible (check `package.json` engines if specified)
4. **Clear Netlify cache** if builds fail unexpectedly

## Next Steps

After successful deployment:
1. ✅ Test the deployed site
2. ✅ Verify API connections work
3. ✅ Set up custom domain (if needed)
4. ✅ Configure branch previews for staging
5. ✅ Set up deployment notifications

