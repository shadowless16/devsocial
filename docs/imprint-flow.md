# On-Chain Imprint Flow

## Overview

The on-chain imprint system provides cryptographic proof of content authenticity by storing content hashes on the Hedera Consensus Service. This ensures content integrity and enables verification of posts.

## Architecture

### Components

1. **Canonicalizer** (`lib/canonicalizer.ts`) - Normalizes post content for consistent hashing
2. **Imprint Worker** (`workers/imprintWorker.ts`) - Processes imprint jobs and submits to Hedera
3. **Hedera Adapter** (`lib/hedera-adapter.ts`) - Handles Hedera network interactions
4. **Mirror Node Poller** (`workers/mirrorNodePoller.ts`) - Monitors transaction confirmations
5. **Verification API** (`app/api/posts/verify/route.ts`) - Provides content verification
6. **PostMeta Component** (`components/shared/PostMeta.tsx`) - Shows imprint status in UI

### Flow

1. **Post Creation**: Content hash generated and stored with `imprintStatus: "pending"`
2. **Queue Processing**: Imprint worker processes jobs from queue
3. **Duplicate Check**: System checks for existing content hashes to prevent duplicates
4. **Hedera Submission**: Content hash submitted to Hedera topic
5. **Status Updates**: Post status updated to "submitted" → "confirmed"
6. **UI Display**: Status badge and explorer link shown to users

## Environment Variables

```bash
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_TOPIC_ID=0.0.789012
HEDERA_NETWORK=testnet

# Mirror Node (for confirmation polling)
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

## Testing on Testnet

### 1. Setup Test Environment

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your testnet credentials
```

### 2. Create Test Post

```bash
# Create a test post via API or UI
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Test post for imprint", "tags": ["test"]}'
```

### 3. Monitor Processing

```bash
# Check imprint metrics
curl http://localhost:3000/api/monitoring/imprint

# Check post status
curl http://localhost:3000/api/posts/verify \
  -H "Content-Type: application/json" \
  -d '{"postId": "your_post_id"}'
```

### 4. Verify on Mirror Node

Visit the Hedera testnet explorer:
- **HashScan**: https://hashscan.io/testnet/transaction/{txId}
- **Mirror Node API**: https://testnet.mirrornode.hedera.com/api/v1/transactions/{txId}

## Status Flow

```
none → pending → submitted → confirmed
  ↓       ↓         ↓
duplicate   failed    failed
```

### Status Meanings

- **none**: No imprint requested
- **pending**: Queued for processing
- **submitted**: Sent to Hedera, awaiting confirmation
- **confirmed**: Transaction confirmed on network
- **failed**: Processing failed (will retry)
- **duplicate**: Content already exists on-chain

## API Endpoints

### Verification
```
POST /api/posts/verify
Body: { "postId": "..." } or { "content": {...} }
```

### Monitoring
```
GET /api/monitoring/imprint
Returns: { imprintJobsProcessed, imprintFailures, ... }
```

## Monitoring & Alerts

### Metrics Tracked
- `imprintJobsProcessed`: Total jobs processed
- `imprintFailures`: Failed submissions
- `imprintConfirmedCount`: Successfully confirmed
- `pendingImprintsCount`: Currently pending

### Alert Conditions
- Failure rate > 10%
- Pending queue growing consistently
- No confirmations for extended period

### Log Monitoring
All events logged with structured JSON:
```json
{
  "level": "info",
  "time": "2024-01-01T00:00:00.000Z",
  "msg": "Imprint job completed",
  "postId": "...",
  "txId": "...",
  "status": "confirmed"
}
```

## Troubleshooting

### Common Issues

1. **High Failure Rate**
   - Check Hedera account balance
   - Verify network connectivity
   - Review private key configuration

2. **Pending Jobs Not Processing**
   - Ensure worker is running
   - Check queue service status
   - Verify database connectivity

3. **Confirmations Not Updating**
   - Check mirror node poller
   - Verify mirror node URL
   - Review transaction IDs in logs

### Debug Commands

```bash
# Check worker metrics
npm run test:imprint-metrics

# Verify canonicalizer
npm run test:canonicalizer

# Test Hedera connection
npm run test:hedera-connection
```

## Security Considerations

- Private keys stored securely in environment variables
- Content hashes are one-way (cannot reverse to original content)
- Duplicate detection prevents spam
- Rate limiting on verification endpoints
- Input validation on all API endpoints

## Performance

- Batch processing for high volume
- Exponential backoff for retries
- Database indexing on contentHash and imprintStatus
- Efficient duplicate detection queries