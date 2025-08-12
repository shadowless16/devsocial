# DevSocial MCP Server Capabilities

## Current Tools Available:

### 🎯 **get_leaderboard**
- **Purpose**: Get top users by XP points
- **Parameters**: `limit` (number, default: 10)
- **Returns**: Array of users with username, points, level, avatar

### 📱 **get_user_feed** 
- **Purpose**: Get user posts feed
- **Parameters**: `userId` (string), `limit` (number, default: 20)
- **Returns**: Array of posts with author info, likes, creation date

### ⚡ **update_user_xp**
- **Purpose**: Update user XP and recalculate level
- **Parameters**: `userId` (string), `xpGain` (number)
- **Returns**: New points and level

---

## 🚀 Capability Extension Requests

When you need new MCP capabilities, I'll add them here:

### 📊 **Analytics Tools** (Requested)
- `get_analytics_overview` - Get dashboard analytics
- `get_content_analytics` - Get post/comment metrics
- `get_user_analytics` - Get user activity data

### 🔍 **Search & Query Tools** (Potential)
- `search_posts` - Search posts by content/tags
- `get_user_activity` - Get specific user's recent activity
- `get_trending_tags` - Get trending hashtags

### 🛠️ **Admin Tools** (Future)
- `moderate_content` - Flag/unflag content
- `manage_users` - User management operations
- `system_health` - Check database/server status

---

## 💡 How to Request New Capabilities

Just ask me: *"I need MCP capability to [describe what you want]"*

I'll:
1. ✅ Check if current tools can handle it
2. 🔧 Extend existing tools if needed  
3. 🆕 Create new tools if required
4. 📝 Update this capability list