# Hedera Blockchain Adapter

## Overview
The Hedera Adapter provides blockchain integration for DevSocial, enabling content imprinting, verification, and immutable record-keeping on the Hedera Hashgraph network.

## Architecture

### Core Components
- **HederaService** - Main service class for blockchain operations
- **Canonicalizer** - Content hashing and normalization
- **Imprint Queue** - Asynchronous content processing
- **Wallet Integration** - User wallet connectivity

### Data Flow
```
Post Creation → Canonicalization → Hash Generation → Queue → Hedera Transaction → Verification
```

## Configuration

### Environment Variables
```env
HEDERA_TESTNET_ACCOUNT_ID=0.0.xxxxx
HEDERA_TESTNET_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_MAINNET_ACCOUNT_ID=0.0.xxxxx (optional)
HEDERA_MAINNET_PRIVATE_KEY=302e020100... (optional)
```

### Network Selection
- **Testnet**: Development and testing
- **Mainnet**: Production deployment

## Content Imprinting

### Canonical Hash Generation
Uses the [Canonical Post Schema v1](./canonical_post_schema.md) for consistent hashing:

```typescript
interface CanonicalPost {
  authorId: string
  content: string
  contentType: "text" | "image" | "video" | "mixed"
  createdAt: string // ISO 8601
  metadata: {
    hasMedia: boolean
    mediaCount: number
    tags: string[]
  }
  postId: string
}
```

### Hash Algorithm
- **Algorithm**: SHA-256
- **Encoding**: UTF-8
- **Output**: Hexadecimal lowercase

## API Endpoints

### POST /api/hedera/imprint
Imprints post content hash on Hedera blockchain.

**Request:**
```json
{
  "postId": "507f191e810c19729de860ea",
  "hash": "a1b2c3d4e5f6...",
  "metadata": {
    "contentType": "text",
    "authorId": "507f1f77bcf86cd799439011"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "0.0.12345@1640995200.123456789",
  "hash": "a1b2c3d4e5f6...",
  "explorerUrl": "https://hashscan.io/testnet/transaction/...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/hedera/verify/{postId}
Verifies post content against blockchain record.

**Response:**
```json
{
  "verified": true,
  "transactionId": "0.0.12345@1640995200.123456789",
  "blockchainHash": "a1b2c3d4e5f6...",
  "currentHash": "a1b2c3d4e5f6...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/hedera/balance
Gets account balance for configured operator.

**Response:**
```json
{
  "success": true,
  "balance": "100.50 ℏ",
  "accountId": "0.0.12345"
}
```

## Transaction Types

### Content Imprint Transaction
- **Type**: Transfer with memo
- **Amount**: Minimal (0.001 HBAR)
- **Memo**: JSON containing post hash and metadata
- **Purpose**: Immutable content timestamping

### Verification Transaction
- **Type**: Query
- **Cost**: Network query fee
- **Purpose**: Retrieve and verify stored content hash

## Error Handling

### Common Errors
```typescript
interface HederaError {
  code: string
  message: string
  transactionId?: string
  retryable: boolean
}
```

### Error Codes
- `INSUFFICIENT_BALANCE` - Not enough HBAR for transaction
- `INVALID_ACCOUNT` - Account ID format invalid
- `NETWORK_ERROR` - Hedera network unavailable
- `TRANSACTION_FAILED` - Transaction execution failed
- `VERIFICATION_FAILED` - Content hash mismatch

### Retry Logic
- **Max Retries**: 3
- **Backoff**: Exponential (1s, 2s, 4s)
- **Conditions**: Network errors, temporary failures

## Security Considerations

### Private Key Management
- Store in secure environment variables
- Never expose in client-side code
- Use separate keys for testnet/mainnet
- Implement key rotation procedures

### Content Integrity
- Hash validation before imprinting
- Canonical format enforcement
- Tamper detection through verification
- Immutable audit trail

### Access Control
- Operator account permissions
- API endpoint authentication
- Rate limiting on imprint operations
- User wallet verification

## Performance Optimization

### Queue Management
```typescript
interface ImprintQueue {
  priority: 'high' | 'normal' | 'low'
  batchSize: number
  processingDelay: number
  retryAttempts: number
}
```

### Batch Processing
- Group multiple imprints per transaction
- Reduce network fees
- Improve throughput
- Maintain order integrity

### Caching Strategy
- Cache verification results
- Store transaction IDs locally
- Implement TTL for cached data
- Background refresh for active content

## Monitoring & Analytics

### Metrics Tracked
- Transaction success rate
- Average confirmation time
- Queue processing time
- Network fee costs
- Verification requests

### Health Checks
```typescript
interface HealthStatus {
  network: 'healthy' | 'degraded' | 'down'
  balance: number
  queueSize: number
  lastTransaction: string
}
```

### Alerting
- Low balance warnings
- Failed transaction alerts
- Queue backup notifications
- Network connectivity issues

## Development Workflow

### Local Testing
```bash
# Start with testnet configuration
npm run dev:hedera

# Run imprint tests
npm test -- hedera-adapter

# Verify test transactions
npm run verify:testnet
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Network endpoints verified
- [ ] Account balances sufficient
- [ ] Queue workers running
- [ ] Monitoring dashboards active

## Integration Examples

### Post Creation Hook
```typescript
// After post is saved to database
const hash = hashPost(post)
await imprintQueue.add({
  postId: post._id,
  hash,
  priority: 'normal'
})
```

### Content Verification
```typescript
const verification = await hederaService.verifyPost(postId)
if (!verification.verified) {
  // Handle content tampering
  await flagPost(postId, 'INTEGRITY_VIOLATION')
}
```

### Wallet Integration
```typescript
// User connects wallet for premium features
const walletBalance = await hederaService.getAccountBalance(userAccountId)
if (walletBalance.hbars > 10) {
  await enablePremiumFeatures(userId)
}
```

## Future Enhancements

### Planned Features
- Smart contract integration
- NFT minting for achievements
- Decentralized identity verification
- Cross-chain bridge support

### Scalability Improvements
- Sharding for high-volume content
- Layer 2 solutions integration
- Optimized consensus mechanisms
- Enhanced query performance

## Troubleshooting

### Common Issues

**Transaction Timeout**
```typescript
// Increase timeout for slow networks
const client = Client.forTestnet().setRequestTimeout(30000)
```

**Invalid Account Format**
```typescript
// Validate account ID format
const isValid = /^0\.0\.\d+$/.test(accountId)
```

**Insufficient Balance**
```typescript
// Check balance before transaction
const balance = await client.getAccountBalance(operatorId)
if (balance.hbars.toTinybars() < requiredAmount) {
  throw new Error('Insufficient balance')
}
```

### Debug Mode
```typescript
// Enable detailed logging
process.env.HEDERA_DEBUG = 'true'
```

## Support & Resources

### Documentation Links
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis)
- [Hashgraph Developer Portal](https://hedera.com/developers)
- [Network Explorer](https://hashscan.io)

### Community Support
- Discord: Hedera Developer Community
- GitHub: Issues and feature requests
- Stack Overflow: Technical questions

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: DevSocial Team