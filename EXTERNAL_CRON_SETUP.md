# External Cron Setup for XP Overtake Notifications

Since Vercel Hobby plan only allows daily cron jobs, use an external service to ping the endpoint more frequently.

## Option 1: cron-job.org (Free, Recommended)

1. **Go to**: https://cron-job.org/en/
2. **Sign up** for free account
3. **Create new cron job**:
   - **Title**: DevSocial XP Overtake Check
   - **URL**: `https://your-app.vercel.app/api/cron/check-overtakes`
   - **Schedule**: Every 5 minutes
   - **Request Method**: GET
   - **Authentication**: Add header `Authorization: Bearer YOUR_CRON_SECRET`

4. **Add environment variable** to Vercel:
   ```
   CRON_SECRET=your-secure-random-string
   ```

## Option 2: EasyCron (Free tier available)

1. **Go to**: https://www.easycron.com/
2. **Sign up** for free account (up to 100 tasks)
3. **Create cron job**:
   - **URL**: `https://your-app.vercel.app/api/cron/check-overtakes`
   - **Cron Expression**: `*/5 * * * *` (every 5 minutes)
   - **HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

## Option 3: UptimeRobot (Free)

1. **Go to**: https://uptimerobot.com/
2. **Sign up** for free account
3. **Add New Monitor**:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: DevSocial Cron
   - **URL**: `https://your-app.vercel.app/api/cron/check-overtakes`
   - **Monitoring Interval**: 5 minutes
   - **Custom HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

## Option 4: GitHub Actions (Free)

Create `.github/workflows/cron-overtakes.yml`:

```yaml
name: Check XP Overtakes

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-overtakes:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Cron Endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/cron/check-overtakes
```

Add `CRON_SECRET` to GitHub repository secrets.

## Option 5: Render Cron Jobs (Free)

1. **Go to**: https://render.com/
2. **Create Cron Job**:
   - **Command**: `curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/check-overtakes`
   - **Schedule**: `*/5 * * * *`

## Recommended Setup

**Use cron-job.org** - It's:
- ✅ Free forever
- ✅ Reliable
- ✅ Easy to set up
- ✅ Supports custom headers
- ✅ Email notifications on failures

## Security

Generate a secure CRON_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local` and Vercel environment variables:
```env
CRON_SECRET=your_generated_secret_here
```

## Testing

Test the endpoint manually:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/check-overtakes
```

Expected response:
```json
{
  "success": true,
  "message": "Checked overtakes - All-time: 0, Weekly: 0, Monthly: 0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Current Setup

- **Vercel Cron**: Runs once daily at midnight (backup)
- **External Cron**: Runs every 5 minutes (primary)
- **On XP Award**: Immediate check when user earns ≥10 XP

This ensures overtakes are detected quickly while staying within Vercel's free tier limits.
