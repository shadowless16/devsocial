# Vercel Login Issue Fix

## Problem
Login redirects to `/auth/login?callbackUrl=%2Fhome` in an infinite loop on https://techdevsocial.vercel.app

## Root Cause
`NEXTAUTH_URL` environment variable is not set correctly in Vercel

## ✅ Solution

### Step 1: Set Vercel Environment Variables

Go to your Vercel project settings:
1. Navigate to: https://vercel.com/your-username/devsocial/settings/environment-variables
2. Add/Update these variables:

```
NEXTAUTH_URL=https://techdevsocial.vercel.app
NEXTAUTH_SECRET=your-production-secret-here-change-this
MONGODB_URI=mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-production-jwt-secret-here
```

### Step 2: Generate Secure Secrets

Run these commands to generate secure secrets:

```bash
# For NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Redeploy

After setting environment variables, redeploy:
```bash
git push origin main
```

Or trigger manual redeploy in Vercel dashboard.

## Important Notes

1. **NEXTAUTH_URL must match your domain exactly**
   - ✅ `https://techdevsocial.vercel.app`
   - ❌ `http://techdevsocial.vercel.app` (wrong protocol)
   - ❌ `https://techdevsocial.vercel.app/` (trailing slash)

2. **Use different secrets for production**
   - Never use `dev-secret-key-change-in-production` in production
   - Generate new random secrets

3. **All environment variables must be set**
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - MONGODB_URI
   - JWT_SECRET
   - All Cloudinary variables
   - All Hedera variables (if using)

## Quick Check

After deployment, test:
1. Go to https://techdevsocial.vercel.app/auth/login
2. Enter credentials
3. Should redirect to /home successfully

If still failing, check Vercel logs:
```bash
vercel logs
```
