# Fix for Multiple Vercel URLs

## Problem
You have multiple Vercel deployment URLs:
- ✅ Working: `https://devsocial-git-main-shadowless16s-projects.vercel.app/`
- ❌ Not working: `https://techdevsocial.vercel.app/`

## ✅ Solution Applied

Updated `lib/auth.ts` to automatically use `VERCEL_URL` environment variable, which Vercel provides automatically for all deployments.

## What Changed

1. **Cookie domain**: Now set to `.vercel.app` in production (works for all Vercel URLs)
2. **Redirect callback**: Uses `VERCEL_URL` as fallback if `NEXTAUTH_URL` not set

## Vercel Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Option 1: Use your custom domain (recommended)
NEXTAUTH_URL=https://techdevsocial.vercel.app
NEXTAUTH_SECRET=<your-secret>

# Option 2: Leave NEXTAUTH_URL unset, it will auto-detect from VERCEL_URL
# (Vercel provides VERCEL_URL automatically)
```

## Quick Fix

### If you want to use techdevsocial.vercel.app:
1. Go to Vercel Dashboard
2. Set `NEXTAUTH_URL=https://techdevsocial.vercel.app`
3. Redeploy

### If you want to keep using the git-main URL:
1. Don't set `NEXTAUTH_URL` at all
2. It will auto-detect from `VERCEL_URL`
3. Redeploy

## Deploy Changes

```bash
git add .
git commit -m "fix: support multiple Vercel URLs"
git push origin main
```

Both URLs should work after deployment! 🎉
