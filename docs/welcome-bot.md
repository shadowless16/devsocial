# Welcome Bot Feature

## Overview
The Welcome Bot automatically comments on users' first posts to make them feel welcomed to the DevSocial community.

## How It Works

1. **Bot User**: A special bot user (`@welcomebot`) is created in the database
2. **First Post Detection**: When a user creates a post, the system checks if it's their first post
3. **Automatic Comment**: If it's a first post, the bot automatically adds a welcoming comment
4. **Random Messages**: The bot randomly selects from multiple welcome messages for variety

## Welcome Messages

The bot uses these randomized messages:
- "Nice first post, [name]! 🎉 Welcome to DevSocial!"
- "Welcome to the community, [name]! 🎉 Great first post!"
- "Awesome first post, [name]! 🎉 Excited to see more from you!"
- "Hey [name]! 🎉 Welcome aboard! Great way to start!"

## Bot Profile

- **Username**: `welcomebot`
- **Display Name**: Welcome Bot
- **Bio**: Official DevSocial bot welcoming new members 🤖
- **Level**: 100
- **Badges**: bot, verified
- **Avatar**: DiceBear generated

## Setup

### Initialize the Bot

Run the initialization script:
```bash
pnpm tsx scripts/init-welcome-bot.ts
```

This will:
- Create the bot user if it doesn't exist
- Display bot information
- Confirm the bot is ready

### Manual Testing

1. Create a new test user
2. Login as that user
3. Create their first post
4. Check if the welcome bot commented automatically

## Implementation Details

### Files
- `lib/welcome-bot.ts` - Core bot logic
- `app/api/posts/route.ts` - Integration point
- `scripts/init-welcome-bot.ts` - Initialization script

### Functions

#### `getOrCreateWelcomeBot()`
Gets the bot user or creates it if it doesn't exist.

#### `isFirstPost(userId: string)`
Checks if the current post is the user's first post.

#### `createWelcomeComment(postId, authorId, authorName)`
Creates a welcome comment on the specified post.

## Error Handling

The welcome bot runs in a try-catch block and will not fail post creation if it encounters an error. Errors are logged but don't affect the user experience.

## Future Enhancements

Potential improvements:
- More personalized messages based on user profile
- Different messages for different user types (student, developer, etc.)
- Time-based messages (morning/evening greetings)
- Multi-language support
- Achievement tracking for the bot
- Bot responses to common questions

## Monitoring

Check logs for:
- `Welcome bot failed:` - Bot encountered an error
- Bot comment creation in database
- Post comment count increments

## Disabling the Bot

To temporarily disable the bot, comment out the welcome bot section in `app/api/posts/route.ts`:

```typescript
// Welcome bot for first-time posts
// try {
//   const isFirst = await isFirstPost(authorId)
//   if (isFirst) {
//     const authorName = author.displayName || author.firstName || author.username
//     await createWelcomeComment(newPost._id.toString(), authorId, authorName)
//   }
// } catch (botError) {
//   console.warn('Welcome bot failed:', botError)
// }
```
