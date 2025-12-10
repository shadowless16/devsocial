# Canonicalizer Utility Specification

## Purpose
Utility module to convert post objects into canonical JSON format and generate SHA-256 hashes for on-chain imprinting.

## Functions

### `canonicalizePost(post: IPost): string`
- Takes a post object (IPost interface)
- Extracts required fields per canonical schema v1
- Applies normalization rules
- Returns canonical JSON string

### `hashPost(post: IPost): string`
- Takes a post object
- Generates canonical JSON via `canonicalizePost()`
- Computes SHA-256 hash
- Returns lowercase hex string

## Sample Test Vector

### Input Post Object
```typescript
{
  _id: "507f191e810c19729de860ea",
  author: "507f1f77bcf86cd799439011",
  content: "  Hello DevSocial community!  ",
  tags: ["community", "intro"],
  imageUrls: ["https://example.com/image.jpg"],
  createdAt: new Date("2024-01-15T10:30:00.000Z"),
  likesCount: 5,
  commentsCount: 2
}
```

### Expected Canonical JSON
```json
{
  "authorId": "507f1f77bcf86cd799439011",
  "content": "Hello DevSocial community!",
  "contentType": "mixed",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "hasMedia": true,
    "mediaCount": 1,
    "tags": ["community", "intro"]
  },
  "postId": "507f191e810c19729de860ea"
}
```

### Expected Hash
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

## Implementation Requirements
- Follow docs/canonical_post_schema.md specification exactly
- Handle edge cases (empty tags, no media, etc.)
- Validate input post object structure
- Throw descriptive errors for invalid inputs
- Ensure deterministic output across environments

## Dependencies
- Node.js crypto module for SHA-256
- Post model interface (IPost)

## Usage Example
```typescript
import { hashPost } from './canonicalizer'

const post = await Post.findById(postId)
const contentHash = hashPost(post)
await Post.findByIdAndUpdate(postId, { contentHash })
```