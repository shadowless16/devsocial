# Gamified Terminology System

## Overview
This document outlines the gamified terminology system implemented across the DevSocial platform to replace traditional social media terms with more engaging, developer-focused language.

## Terminology Mapping

### Social Actions
| Traditional Term | Gamified Term | Usage |
|-----------------|---------------|-------|
| Follow | Connect | "Connect with this developer" |
| Unfollow | Disconnect | "Disconnect from this developer" |
| Following | Connecting | Loading state: "Connecting..." |
| Unfollowing | Disconnecting | Loading state: "Disconnecting..." |

### Social Relationships
| Traditional Term | Gamified Term | Usage |
|-----------------|---------------|-------|
| Followers | Connections | "You have 42 connections" |
| Follower | Connection | "1 connection" |
| Following | Connected | "Connected with 15 developers" |

### Engagement Actions
| Traditional Term | Gamified Term | Usage |
|-----------------|---------------|-------|
| Like | Boost | "Boost this post" |
| Unlike | Remove Boost | "Remove boost" |
| Comment | Contribute | "Add your input" |
| Share | Broadcast | "Broadcast this post" |

### Content Terms
| Traditional Term | Gamified Term | Usage |
|-----------------|---------------|-------|
| Views | Reach | "1.2k reach" |
| Post | Share/Post | Can use either |

### Navigation & UI
| Traditional Term | Gamified Term | Usage |
|-----------------|---------------|-------|
| My Profile | Dev Profile | Navigation menu |
| Messages | Connect | Navigation menu |
| Challenges | Missions | Can use either |

## Implementation

### Centralized Constants
All gamified terms are stored in `/lib/gamified-terms.ts` for easy maintenance and consistency.

```typescript
import { GAMIFIED_TERMS, getFollowActionText } from '@/lib/gamified-terms';

// Usage examples
const buttonText = getFollowActionText(isFollowing); // "Connect" or "Disconnect"
const tooltip = GAMIFIED_TERMS.LIKE_TOOLTIP; // "Boost this post"
```

### Updated Components
The following components have been updated to use gamified terminology:

1. **FollowButton.tsx** - Connect/Disconnect actions
2. **FollowStats.tsx** - Connections/Connected counts
3. **FollowListModal.tsx** - Modal tabs and search
4. **PostCard.tsx** - Boost/Contribute/Broadcast actions
5. **NotificationCenter.tsx** - Notification messages
6. **NavSidebar.tsx** - Navigation labels

## Adding New Terms

### Step 1: Add to Constants
Add new terms to `/lib/gamified-terms.ts`:

```typescript
export const GAMIFIED_TERMS = {
  // ... existing terms
  NEW_TERM: "Gamified Version",
} as const;
```

### Step 2: Create Helper Functions (if needed)
For dynamic terms, create helper functions:

```typescript
export const getNewTermText = (condition: boolean) => 
  condition ? GAMIFIED_TERMS.TERM_A : GAMIFIED_TERMS.TERM_B;
```

### Step 3: Update Components
Import and use the new terms in your components:

```typescript
import { GAMIFIED_TERMS, getNewTermText } from '@/lib/gamified-terms';

// In your component
<Button title={GAMIFIED_TERMS.NEW_TERM}>
  {getNewTermText(someCondition)}
</Button>
```

## Benefits

1. **Consistency** - All terms are centralized and consistent across the platform
2. **Maintainability** - Easy to update terminology in one place
3. **Engagement** - More engaging and developer-focused language
4. **Branding** - Unique platform identity that stands out from generic social media
5. **Extensibility** - Easy to add new terms or modify existing ones

## Future Enhancements

Consider these additional gamified terms:

- **Repositories** → "Code Vaults"
- **Stars** → "Endorsements" 
- **Forks** → "Branches"
- **Issues** → "Quests"
- **Pull Requests** → "Contributions"
- **Commits** → "Progress Updates"

## Guidelines

1. **Keep it intuitive** - Terms should be easily understood by developers
2. **Maintain consistency** - Always use the same term for the same action
3. **Consider context** - Some terms work better in certain contexts
4. **Test with users** - Ensure the terminology resonates with your audience
5. **Document changes** - Update this document when adding new terms

## Migration Notes

When updating existing components:
1. Import the gamified terms constants
2. Replace hardcoded strings with constants
3. Update any related tooltips or help text
4. Test the component thoroughly
5. Update any related documentation

This system provides a solid foundation for maintaining consistent, engaging terminology across your developer-focused social platform.