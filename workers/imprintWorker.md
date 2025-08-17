# Imprint Worker Specification

## Purpose
Worker process to handle imprint jobs by submitting post content hashes to Hedera consensus service.

## Job Contract

### Input
```typescript
interface ImprintJob {
  postId: string      // MongoDB ObjectId as string
  contentHash: string // SHA-256 hash in lowercase hex
}
```

### Processing Steps
1. Receive job from queue with `{ postId, contentHash }`
2. Update post `imprintStatus` to "submitted"
3. Call Hedera adapter to submit consensus message
4. Handle success/failure responses
5. Update post record with transaction details

### Success Flow
- Call `submitConsensusMessage(topicId, contentHash)`
- Update post with transaction ID and submission timestamp
- Set `imprintStatus` to "submitted"
- Store `onChainProof.txId` and `onChainProof.submittedAt`

### Error Handling
- Network failures: Retry with exponential backoff
- Invalid hash: Set `imprintStatus` to "failed"
- Hedera service errors: Log and retry up to 3 times
- Permanent failures: Set `imprintStatus` to "failed"

### Retry Policy
- Max retries: 3
- Backoff: 1s, 2s, 4s
- Permanent failure conditions:
  - Invalid post ID
  - Malformed content hash
  - Post already submitted

## Dependencies
- Hedera adapter (`lib/hedera-adapter`)
- Post model for status updates
- Database connection
- Logging service

## Configuration
- `HEDERA_TOPIC_ID`: Target consensus topic
- `MAX_RETRIES`: Maximum retry attempts (default: 3)
- `RETRY_DELAY_MS`: Base retry delay (default: 1000)