# Database Issues Fixed

## Problems Identified

1. **E11000 Duplicate Key Errors in Views Collection**
   - Index `post_1_user_1` causing conflicts
   - Multiple views being created for same post/user combination

2. **E11000 Duplicate Key Errors in Likes Collection**
   - Index `userId_1_targetId_1_targetType_1` with null values
   - Conflicts when creating post likes

3. **MongoDB Connection Timeouts**
   - Server monitor timeouts
   - Connection pool issues

## Fixes Applied

### 1. Database Index Fixes (`scripts/fix-database-indexes.js`)
- **Views Collection:**
  - Removed problematic `post_1_user_1` index
  - Added compound unique index: `post_1_user_1_ipAddress_1` (sparse)
  - Cleaned duplicate view records
  
- **Likes Collection:**
  - Dropped all existing indexes
  - Created separate unique indexes for post likes and comment likes
  - Used `partialFilterExpression` to handle null values properly
  - Cleaned invalid likes with null values

### 2. Model Updates

#### Like Model (`models/Like.ts`)
- Added pre-save validation
- Fixed index definitions with proper partial filters
- Added performance indexes

#### View Model (`models/View.ts`)
- Updated to compound unique index with sparse option
- Better handling of null user values

### 3. API Route Improvements

#### Likes API (`app/api/likes/posts/[postId]/route.ts`)
- Removed undefined comment field assignment
- Added centralized error handling
- Better duplicate key error handling

#### Views API (`app/api/posts/[id]/views/route.ts`)
- Added duplicate key error catching
- Improved error handling with centralized handler

### 4. Connection Optimization (`lib/db.ts`)
- Increased timeout values to 30 seconds
- Optimized connection pool settings
- Added heartbeat frequency configuration
- Better retry logic

### 5. Centralized Error Handling (`lib/api-error-handler.ts`)
- Handles E11000 duplicate key errors gracefully
- Provides user-friendly error messages
- Handles connection timeouts
- Validates data format errors

## How to Apply Fixes

1. **Run the database fix script:**
   ```bash
   node scripts/fix-database-indexes.js
   # OR
   ./fix-database.bat
   ```

2. **Restart your development server:**
   ```bash
   pnpm dev
   ```

## Expected Results

- ✅ No more E11000 duplicate key errors
- ✅ Better handling of connection timeouts
- ✅ Improved database performance with proper indexes
- ✅ User-friendly error messages
- ✅ Graceful handling of duplicate operations

## Monitoring

After applying fixes, monitor logs for:
- Reduced error frequency
- Faster database operations
- No duplicate key conflicts
- Stable connection performance

## Prevention

- Models now have proper validation
- Indexes use partial filters for null handling
- APIs handle duplicates gracefully
- Connection pool is optimized for stability