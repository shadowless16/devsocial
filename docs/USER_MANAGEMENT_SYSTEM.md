# User Management System

## Overview
Complete admin user management system for monitoring and managing platform users.

## Features

### 📋 User List Page (`/admin/users`)
- **Search**: Find users by username, name, or email
- **Filters**: All, Active, Blocked, Moderators
- **User Cards**: Display avatar, name, level, XP, posts count, join date
- **Quick Actions**: Dropdown menu for each user

### 👤 User Detail Page (`/admin/users/[userId]`)
- **Profile Overview**: Avatar, bio, contact info, badges
- **Stats Dashboard**: Total XP, posts, badges, comments
- **4 Tabs**:
  - **Activity**: Recent user actions with timestamps
  - **XP History**: Breakdown of XP sources (posts, comments, login)
  - **Posts**: Recent posts with engagement metrics
  - **Actions**: Admin action buttons

## Admin Actions

### Available Actions:
1. ✅ **Block/Unblock User** - Suspend account access
2. ✅ **Delete User** - Permanently remove account and content
3. ✅ **Change Role** - Promote to moderator/admin
4. ✅ **Adjust XP** - Add, remove, or set XP amount
5. 🔄 **Reset Password** - Force password reset (UI ready)
6. 🔄 **Send Warning** - Send official warning (UI ready)

## API Endpoints

### User Management
- `GET /api/admin/users` - List users with filters
- `GET /api/admin/users/[userId]` - Get detailed user info
- `POST /api/admin/users/[userId]/block` - Block/unblock user
- `DELETE /api/admin/users/[userId]/delete` - Delete user
- `PATCH /api/admin/users/[userId]/role` - Change user role
- `PATCH /api/admin/users/[userId]/xp` - Adjust user XP

### Request Examples

#### Block User
```typescript
POST /api/admin/users/[userId]/block
// Toggles block status
```

#### Change Role
```typescript
PATCH /api/admin/users/[userId]/role
Body: { "role": "moderator" | "admin" | "user" }
```

#### Adjust XP
```typescript
PATCH /api/admin/users/[userId]/xp
Body: { 
  "action": "add" | "remove" | "set",
  "amount": 100 
}
```

#### Delete User
```typescript
DELETE /api/admin/users/[userId]/delete
// Deletes user and all their content
```

## User Stats Displayed

### Overview Stats
- Total XP and current level
- Number of posts created
- Number of badges earned
- Number of comments made

### Activity Tracking
- Recent posts with timestamps
- XP earning events
- Engagement metrics (likes, comments)
- Account creation date

### XP Breakdown
- Posts Created: 10 XP each
- Comments: 2 XP each
- Daily Login: 5 XP per day
- Total XP from each source

## Navigation

### Desktop
- Added "User Management" link in side navigation (admin only)
- Located under admin section with UserCog icon

### Mobile
- Added "User Management" in mobile menu (admin only)
- Accessible via hamburger menu

## Security

### Authorization
- All endpoints require admin role
- Session validation on every request
- Unauthorized access returns 403

### Data Protection
- User deletion cascades to posts and comments
- XP adjustments recalculate level automatically
- Block status prevents user actions

## UI Components

### User List
- Responsive grid layout
- Search with debounce
- Filter dropdown
- Action dropdown menu per user

### User Detail
- Tabbed interface
- Stat cards with icons
- Activity timeline
- Action buttons

## Future Enhancements

### Planned Features
- [ ] Password reset functionality
- [ ] Warning system with templates
- [ ] Email verification toggle
- [ ] Export user data (GDPR)
- [ ] Bulk actions (block multiple users)
- [ ] Activity charts and graphs
- [ ] User comparison tool
- [ ] Automated moderation rules

### Analytics
- [ ] User growth charts
- [ ] Engagement metrics
- [ ] Retention analysis
- [ ] Top contributors

## Usage

### Access User Management
1. Login as admin
2. Click "User Management" in sidebar
3. Browse, search, or filter users
4. Click on user to view details
5. Use action buttons to manage user

### Block a User
1. Navigate to user list or detail page
2. Click "Block User" action
3. User is immediately blocked from platform
4. Click again to unblock

### Adjust User XP
1. Go to user detail page
2. Click "Adjust XP" button
3. Choose action: Add, Remove, or Set
4. Enter amount
5. Level recalculates automatically

### Delete a User
1. Go to user detail page
2. Click "Delete User" (red button)
3. Confirm deletion
4. User and all content removed permanently

## Notes
- Only admins can access user management
- All actions are logged (future feature)
- Deleted users cannot be recovered
- XP adjustments affect leaderboard rankings
