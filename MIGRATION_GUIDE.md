# Avatar Migration Guide

## Overview
This script migrates all users with ReadyPlayerMe avatars to unique DiceBear avatars.

## What It Does

1. Finds all users with "models.readyplayer.me" in their avatar field
2. Generates a unique DiceBear avatar for each user (based on username)
3. Updates the avatar field with the new DiceBear avatar
4. Sets `isGenerated: true` flag
5. Provides detailed progress and summary

## How to Run

### Option 1: Using Node.js (Recommended)
```bash
node scripts/migrate-avatars.js
```

### Option 2: Using ts-node
```bash
npx ts-node scripts/migrate-avatars.ts
```

## Before Running

1. **Backup your database** (important!)
   ```bash
   # MongoDB Atlas: Use the backup feature in the dashboard
   # Local MongoDB: Use mongodump
   mongodump --uri="your-mongodb-uri" --out=backup
   ```

2. **Verify environment variables**
   - Ensure `.env.local` has `MONGODB_URI` set

3. **Test on staging first** (if available)

## Expected Output

```
🚀 Starting avatar migration...

✅ Connected to database

📊 Found 6 users with ReadyPlayerMe avatars

✅ [1/6] Updated: Amanda
✅ [2/6] Updated: Jaikit
✅ [3/6] Updated: Tosinworks
✅ [4/6] Updated: Ayosholami
✅ [5/6] Updated: SamuelCodes_001
✅ [6/6] Updated: Adepetun

============================================================
📊 MIGRATION SUMMARY
============================================================
Total users found: 6
Successfully updated: 6
Errors: 0
============================================================

✅ Migration complete!
```

## What Changes

### Before Migration
```json
{
  "_id": "...",
  "username": "Amanda",
  "avatar": "https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.png",
  "isGenerated": true
}
```

### After Migration
```json
{
  "_id": "...",
  "username": "Amanda",
  "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53...",
  "isGenerated": true
}
```

## Safety Features

- ✅ Only updates users with ReadyPlayerMe avatars
- ✅ Doesn't affect users with custom uploaded photos
- ✅ Sets `isGenerated: true` so users can still earn XP for uploading
- ✅ Provides detailed logging
- ✅ Error handling for individual users (continues on error)

## Rollback

If you need to rollback:

1. **From backup:**
   ```bash
   mongorestore --uri="your-mongodb-uri" backup/
   ```

2. **Manual rollback** (if you have the old data):
   ```javascript
   // Run in MongoDB shell or script
   db.users.updateMany(
     { isGenerated: true },
     { $set: { avatar: "https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.png" } }
   )
   ```

## Verification

After migration, verify the changes:

```javascript
// Check how many users have DiceBear avatars
db.users.countDocuments({ avatar: { $regex: '^data:image/svg' } })

// Check how many still have ReadyPlayerMe
db.users.countDocuments({ avatar: { $regex: 'models.readyplayer.me' } })
```

## Troubleshooting

### Error: "Cannot connect to database"
**Solution:** Check your `MONGODB_URI` in `.env.local`

### Error: "Module not found"
**Solution:** Run `pnpm install` to ensure all dependencies are installed

### Some users failed to update
**Solution:** Check the error messages. The script continues on individual errors and shows a summary at the end.

## Post-Migration

After successful migration:

1. ✅ All users now have unique, colorful avatars
2. ✅ Users can still upload custom photos and earn 50 XP
3. ✅ Level frames will display correctly
4. ✅ Platform looks more vibrant and engaging

## Notes

- Migration is **idempotent** - safe to run multiple times
- Only affects users with ReadyPlayerMe avatars
- Users with custom photos are **not affected**
- Each user gets a **unique** avatar based on their username
- Avatars are **deterministic** - same username = same avatar

## Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check the backup before rollback

---

**Ready to migrate?** Run: `node scripts/migrate-avatars.js`
