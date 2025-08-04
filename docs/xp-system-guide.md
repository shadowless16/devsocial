# DevSocial XP System Documentation

## Overview
The DevSocial XP system is designed to encourage user engagement through gamification. Users earn XP (Experience Points) for various activities, which helps them level up, unlock ranks, and earn badges.

## XP Values for Activities

### Account & Onboarding
- **Sign Up**: 10 XP
- **Complete Profile**: 15 XP  
- **Add Profile Picture**: 5 XP
- **Connect GitHub**: 10 XP

### Content Creation
- **Create Post**: 8 XP (base)
  - **Bonus for code snippet**: +3 XP
  - **First post of the day**: +2 XP
  - **Helpful content**: +2 XP
  - **Quality content (500+ chars with code)**: +2 XP

- **Create Comment**: 4 XP (base)
  - **Solution provided**: +5 XP
  - **Helpful content**: +2 XP
  - **Code snippet included**: +3 XP

- **Anonymous Confession**: 5 XP

### Engagement
- **Like a Post**: 2 XP (daily limit: 20)
- **Receive Mod Super Like**: 10 XP

### Community Activities
- **Join Weekly Challenge**: 12 XP
- **First Responder Bonus**: 20 XP
- **Report Bug**: 15 XP
- **Refer a Friend**: 25 XP

### Daily Activities
- **Daily Login**: 5 XP (once per day)
  - **7-day streak bonus**: +10 XP
  - **14-day streak bonus**: +20 XP
  - **30-day streak bonus**: +50 XP

## XP Multipliers

### Level Multiplier
- 10% bonus per level (e.g., Level 5 = 1.4x multiplier)

### Streak Multiplier
- 5% bonus per day, max 50% at 10+ days

### Time-Based Multipliers
- **Weekend Warrior**: 1.5x XP on weekends
- **Happy Hour**: 2x XP from 6 PM - 8 PM daily

## Daily XP Caps
To prevent gaming the system:
- **Post Likes**: Max 20 per day (40 XP)
- **Posts Created**: Max 5 per day
- **Comments Created**: Max 10 per day
- **Daily Login**: Once per day

## Implementation Example

```typescript
// Award XP for creating a post
const result = await GamificationService.awardXP(
  userId,
  'post_created',
  postContent,
  postId
);

if (result.success) {
  // Show XP notification
  showXPNotification({
    xpGained: result.xpAwarded,
    action: 'post_created',
    levelUp: result.levelUp,
    newRank: result.newRank,
    badgesEarned: result.badgesEarned
  });
}
```

## XP Calculation Formula

```
Final XP = (Base XP + Bonuses) × Level Multiplier × Streak Multiplier × Time Multiplier
```

### Example Calculation
User creates a post with code snippet on a weekend:
- Base XP: 8
- Code snippet bonus: +3
- Level 5 multiplier: 1.4x
- 7-day streak: 1.35x
- Weekend bonus: 1.5x
- **Final XP**: (8 + 3) × 1.4 × 1.35 × 1.5 = 31 XP

## Best Practices

1. **Check Daily Caps**: Always verify if the user has reached their daily limit before awarding XP.

2. **Content Quality**: Use the `isHelpfulContent()` and `hasCodeSnippet()` functions to detect quality content.

3. **Streak Management**: Award streak bonuses separately to avoid double-counting.

4. **Error Handling**: Always handle failures gracefully and provide feedback to users.

5. **Real-time Updates**: Use the XP notification component to show real-time XP gains.

## API Methods

### `GamificationService.awardXP()`
Awards XP to a user for a specific action.

### `GamificationService.checkStreakBonuses()`
Checks and awards streak bonuses if eligible.

### `GamificationService.getTodayActionCount()`
Gets the count of a specific action performed today.

### `GamificationService.resetPeriodicalXP()`
Resets weekly/monthly XP counters (should be run via cron job).
