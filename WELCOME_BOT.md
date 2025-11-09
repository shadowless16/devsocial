# 🤖 Welcome Bot - Quick Start Guide

## What is it?
An automated bot that welcomes new users by commenting on their first post with a friendly message like:
> "Nice first post, [name]! 🎉 Welcome to DevSocial!"

## Setup (One-time)

Initialize the bot:
```bash
pnpm bot:init
```

This creates the `@welcomebot` user in your database.

## Testing

Test the bot functionality:
```bash
pnpm bot:test
```

This will:
- Verify bot exists
- Create a test post
- Check if welcome comment is created
- Display results

## How It Works

1. **User creates their first post** → Post API detects it's their first post
2. **Bot automatically comments** → Welcome message is added
3. **User sees welcome** → Feels welcomed to the community! 🎉

## Files Created

- `lib/welcome-bot.ts` - Core bot logic
- `scripts/init-welcome-bot.ts` - Initialization script
- `scripts/test-welcome-bot.ts` - Testing script
- `docs/welcome-bot.md` - Full documentation
- `app/api/posts/route.ts` - Integration (modified)

## Bot Profile

- **Username**: `welcomebot`
- **Display Name**: Welcome Bot
- **Level**: 100
- **Badges**: bot, verified

## Customization

Edit welcome messages in `lib/welcome-bot.ts`:
```typescript
const welcomeMessages = [
  `Nice first post, ${authorName}! 🎉 Welcome to DevSocial!`,
  // Add more messages here...
]
```

## Troubleshooting

**Bot not commenting?**
- Run `pnpm bot:init` to ensure bot exists
- Check logs for "Welcome bot failed:" errors
- Verify it's actually the user's first post

**Want to disable it?**
- Comment out the welcome bot section in `app/api/posts/route.ts`

## Next Steps

See `docs/welcome-bot.md` for:
- Detailed implementation
- Future enhancements
- Monitoring tips
- Advanced configuration

---

Built with ❤️ for the DevSocial community
