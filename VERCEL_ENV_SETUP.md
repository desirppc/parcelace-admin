# Vercel Environment Variable Setup

## Critical: Set Environment Variable in Vercel

To fix the API URL issue, you **MUST** set the following environment variable in your Vercel project:

### Steps:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
Name: VITE_API_URL
Value: https://parcelace.in/
```

4. Make sure to set it for **all environments** (Production, Preview, Development)
5. **Redeploy** your application after adding the variable

### Why this is needed:

- The application uses `VITE_API_URL` to determine the API endpoint
- Without this variable, the app falls back to hostname detection which may not work correctly
- The environment variable takes highest priority in the URL resolution logic

### Verification:

After setting the variable and redeploying, check the browser console. You should see:
- `🌍 Environment Configuration:` log showing `VITE_API_URL: https://parcelace.in/`
- `🔗 API URL Construction:` logs showing correct API URLs

### Current Behavior:

- ✅ If `VITE_API_URL` is set → Uses that value
- ⚠️ If not set → Falls back to hostname detection (may not work correctly)
- ✅ Vercel deployments default to production API (`https://parcelace.in/`) if no env var is set

