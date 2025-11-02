# Comment Images Fix

## Issue
When users added images to comments, the comment was posted but the image didn't display.

## Root Cause
The Comment model didn't have an `imageUrl` field, so images were being sent to the API but not saved to the database or displayed in the UI.

## Solution

### 1. Updated Comment Model
**File**: `models/Comment.ts`

Added `imageUrl` field to the Comment schema:
```typescript
imageUrl: {
  type: String,
  required: false,
}
```

### 2. Updated API Route
**File**: `app/api/comments/[postId]/route.ts`

Modified to accept and save `imageUrl`:
```typescript
const { content, parentCommentId, imageUrl } = await request.json()

const comment = new Comment({
  author: userId,
  post: postId,
  content: content.trim(),
  imageUrl: imageUrl || undefined,
  parentComment: parentCommentId
})
```

### 3. Updated FeedItem Component
**File**: `components/feed/FeedItem.tsx`

Added image display in comments:
```typescript
{comment.imageUrl && (
  <div className="mb-3 rounded-lg overflow-hidden">
    <Image
      src={comment.imageUrl}
      alt="Comment image"
      width={400}
      height={300}
      className="w-full h-auto rounded-lg"
      style={{ maxHeight: '400px' }}
    />
  </div>
)}
```

### 4. Updated Post Detail Page
**File**: `app/(authenticated)/post/[id]/page.tsx`

Added image display in comments and replies:
- Comments show images with max height of 400px
- Replies show images with max height of 300px

## Changes Summary

| File | Changes |
|------|---------|
| `models/Comment.ts` | Added `imageUrl` field |
| `app/api/comments/[postId]/route.ts` | Accept and save `imageUrl` |
| `components/feed/FeedItem.tsx` | Display comment images |
| `app/(authenticated)/post/[id]/page.tsx` | Display comment and reply images |

## Testing

1. ✅ Add a comment with an image
2. ✅ Verify image displays in feed
3. ✅ Verify image displays in post detail
4. ✅ Verify image displays in replies
5. ✅ Verify comments without images still work

## Status
✅ Fixed and ready for testing
