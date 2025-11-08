# Force Vercel Redeploy

## The Issue
Vercel is serving cached/old code even after updating environment variables.

## ✅ Solution: Force Fresh Deployment

### Step 1: Clear Vercel Build Cache
```bash
# In Vercel Dashboard:
# Settings → General → Clear Build Cache
```

### Step 2: Force Redeploy
```bash
# Make a dummy change to force rebuild
git commit --allow-empty -m "force redeploy - fix auth"
git push origin main
```

### Step 3: Wait for Build
- Go to Vercel Dashboard → Deployments
- Wait for build to complete (~2-3 minutes)
- Check build logs for errors

### Step 4: Test
1. Clear browser cookies completely
2. Close all browser tabs
3. Open new incognito window
4. Visit: `https://techdevsocial.vercel.app/auth/login`
5. Try logging in

## Alternative: Redeploy from Vercel Dashboard

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Find latest deployment
5. Click "..." menu → "Redeploy"
6. Select "Use existing Build Cache: NO"
7. Click "Redeploy"

## Check Environment Variables Are Applied

After deployment, check:
```
https://techdevsocial.vercel.app/api/auth/providers
```

Should return:
```json
{
  "credentials": {
    "id": "credentials",
    "name": "Credentials",
    "type": "credentials",
    ...
  }
}
```

If you get 404, environment variables aren't loaded.

## Nuclear Option: Delete and Redeploy

If nothing works:
1. Delete the deployment in Vercel
2. Push a new commit
3. Let Vercel create fresh deployment
