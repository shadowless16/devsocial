// ESLint Rule to Enforce UserAvatar Usage
// Add this to your .eslintrc.js or .eslintrc.json

module.exports = {
  rules: {
    // Prevent direct Avatar imports - force use of UserAvatar
    "no-restricted-imports": ["error", {
      "paths": [
        {
          "name": "@/components/ui/avatar",
          "message": "❌ Don't use Avatar directly! Use UserAvatar from @/components/ui/user-avatar instead. This ensures consistent avatar behavior across the app."
        }
      ],
      "patterns": [
        {
          "group": ["**/components/ui/avatar"],
          "message": "❌ Don't use Avatar directly! Use UserAvatar from @/components/ui/user-avatar instead."
        }
      ]
    }],
    
    // Prevent importing getAvatarUrl (now handled by UserAvatar)
    "no-restricted-imports": ["warn", {
      "paths": [
        {
          "name": "@/lib/avatar-utils",
          "importNames": ["getAvatarUrl"],
          "message": "⚠️ getAvatarUrl is handled automatically by UserAvatar. Consider using UserAvatar component instead."
        }
      ]
    }]
  }
}

// How to use:
// 1. Copy the rules section to your existing .eslintrc.js
// 2. Run: pnpm lint
// 3. ESLint will now warn/error when someone tries to use Avatar directly

// Example error message:
// ❌ Don't use Avatar directly! Use UserAvatar from @/components/ui/user-avatar instead.
//    This ensures consistent avatar behavior across the app.
