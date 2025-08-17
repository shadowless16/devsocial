npx tsc --noEmit --project tsconfig.json

# Amazon Q Session Initialization

## 🔧 MCP Server Status
- **Server**: DevSocial Database MCP
- **Status**: Use `pnpm run mcp:check` to verify
- **Tools Available**: get_leaderboard, get_user_feed, update_user_xp

## 📋 Quick Start Checklist
1. ✅ MCP server running (`pnpm run dev:with-mcp`)
2. ✅ Database connected (MongoDB)
3. ✅ API endpoints accessible

## 🎯 Common MCP Operations
- **Get leaderboard**: Use MCP tool `get_leaderboard`
- **Check user data**: Use MCP tool `get_user_feed`
- **Update XP**: Use MCP tool `update_user_xp`

## 💡 Request New Capabilities
Say: "I need MCP capability to [describe functionality]"

---
*This file helps Amazon Q understand your MCP setup in new chat sessions*