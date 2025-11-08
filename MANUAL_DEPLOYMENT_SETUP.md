# Manual Deployment Setup - Netlify

## Current Status ✅

**No automatic deployments are currently enabled.**
- No GitHub repository is connected
- All deployments are manual via CLI

## How to Deploy Manually

### Option 1: Using Netlify CLI (Current Method)

```bash
# Build the project
npm run build:production

# Deploy to production
npx netlify-cli deploy --prod --dir=dist
```

### Option 2: Using Netlify Dashboard

1. Go to: https://app.netlify.com/projects/parcelacechlogin
2. Navigate to: **Deploys** tab
3. Drag and drop your `dist` folder
4. Or use the **Deploy manually** option

---

## If You Connect GitHub in the Future

If you want to connect GitHub but **disable automatic deployments**, follow these steps:

### Step 1: Connect GitHub (Optional)
1. Go to: Site settings → **Build & deploy** → **Continuous Deployment**
2. Click **Link to Git provider**
3. Select your repository

### Step 2: Disable Automatic Deploys
1. Go to: Site settings → **Build & deploy** → **Continuous Deployment**
2. Under **Deploy settings**, find **Branch deploys**
3. **Disable** automatic deploys for:
   - Production branch (main/master)
   - Branch deploys
   - Deploy previews (optional)

### Step 3: Enable Manual Deploy Only
1. In **Deploy settings**, set:
   - **Production branch**: Keep it set, but disable auto-deploy
   - **Branch deploys**: **OFF**
   - **Deploy previews**: **OFF** (or keep ON if you want PR previews)

### Alternative: Use Netlify API to Disable

```bash
# Disable automatic deployments via API
npx netlify-cli api updateSite --data '{
  "site_id": "eef23602-ebae-44ed-8c09-f17b954fca19",
  "build_settings": {
    "deploy_on_push": false
  }
}'
```

---

## Recommended Workflow

### For Manual Deployments Only:

1. **Make your changes** locally
2. **Test locally**: `npm run dev`
3. **Build**: `npm run build:production`
4. **Deploy when ready**: `npx netlify-cli deploy --prod --dir=dist`

### Quick Deploy Script

You can create a script in `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build:production && npx netlify-cli deploy --prod --dir=dist"
  }
}
```

Then deploy with:
```bash
npm run deploy
```

---

## Current Configuration

- **Site ID**: `eef23602-ebae-44ed-8c09-f17b954fca19`
- **Site URL**: https://parcelacechlogin.netlify.app
- **GitHub Connected**: ❌ No
- **Auto Deploy**: ❌ Disabled (no repo connected)
- **Deployment Method**: Manual via CLI

---

## Notes

- ✅ **Current setup is already manual-only** - no automatic deployments
- ✅ You can deploy anytime using: `npx netlify-cli deploy --prod --dir=dist`
- ⚠️ If you connect GitHub in the future, make sure to disable auto-deploy in settings
- 💡 Consider using a deployment script for convenience

---

## Troubleshooting

**If automatic deployments start happening:**
1. Check if GitHub was accidentally connected
2. Go to Site settings → Build & deploy → Continuous Deployment
3. Disable automatic deployments or unlink the repository

**To verify deployment settings:**
```bash
npx netlify-cli status
npx netlify-cli api getSite --data '{"site_id":"eef23602-ebae-44ed-8c09-f17b954fca19"}'
```

