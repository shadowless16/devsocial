# Canonical Post Hash Schema (v1)

## Overview
This document defines the canonical JSON format used for generating consistent content hashes of posts for on-chain imprinting.

## Version
**v1** - Initial specification

## Hashing Algorithm
- **Algorithm**: SHA-256
- **Output Format**: Hexadecimal lowercase

## Included Fields (in order)
1. `postId` - MongoDB ObjectId as string
2. `authorId` - Author's MongoDB ObjectId as string  
3. `createdAt` - ISO 8601 timestamp string
4. `content` - Post content text
5. `contentType` - Type of content ("text", "image", "video", "mixed")
6. `metadata` - Structured metadata object

## Normalization Rules
- **Whitespace**: Trim leading/trailing whitespace from string values
- **Key Ordering**: Alphabetical ordering of object keys
- **No Extra Whitespace**: Remove unnecessary spaces in JSON serialization
- **Consistent Encoding**: UTF-8 encoding for all text

## Metadata Structure
```json
{
  "tags": ["tag1", "tag2"],
  "hasMedia": boolean,
  "mediaCount": number
}
```

## Exclusions
- No PII (personally identifiable information)
- No transient fields (likes, comments, views counts)
- No mutable data (edit history, status changes)
- No system-internal fields (_id, __v, updatedAt)

## Example Canonical Format
```json
{
  "authorId": "507f1f77bcf86cd799439011",
  "content": "Hello DevSocial community!",
  "contentType": "text",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "hasMedia": false,
    "mediaCount": 0,
    "tags": ["intro", "community"]
  },
  "postId": "507f191e810c19729de860ea"
}
```

## Implementation Notes
- Use stable JSON serialization (no random key ordering)
- Validate all required fields are present before hashing
- Handle null/undefined values consistently
- Ensure reproducible hash generation across different environments