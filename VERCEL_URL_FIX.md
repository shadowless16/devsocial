# Fix Vercel Login - Update NEXTAUTH_URL

## The Issue
Your `NEXTAUTH_URL` is set to:
```
https://devsocial-git-main-shadowless16-projects.vercel.app
```

But you're trying to use:
```
https://techdevsocial.vercel.app
```

NextAuth requires the URL to match EXACTLY.

## ✅ Solution

### Option 1: Use techdevsocial.vercel.app (Recommended)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `NEXTAUTH_URL`
3. Change value to:
   ```
   https://techdevsocial.vercel.app
   ```
4. Click "Save"
5. Redeploy (Vercel will auto-redeploy)

### Option 2: Keep using the old URL

Just use: `https://devsocial-git-main-shadowless16-projects.vercel.app/auth/login`

It should work since NEXTAUTH_URL matches.

## Why This Happens

NextAuth validates that the request URL matches `NEXTAUTH_URL` for security. When they don't match:
- ❌ Login fails
- ❌ Session cookies don't work
- ❌ Redirects break

## After Fixing

1. Clear browser cookies
2. Visit: `https://techdevsocial.vercel.app/auth/login`
3. Login should work ✅

## Quick Test

After updating NEXTAUTH_URL, test:
```
https://techdevsocial.vercel.app/api/auth/providers
```

Should return JSON (not 404).
