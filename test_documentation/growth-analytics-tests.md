# Growth Analytics Testing Documentation

## Overview
This document describes the testing strategy and implementation for the DevSocial growth analytics system, including both API endpoints and MCP (Model Context Protocol) tools.

## Test Structure

### 1. Unit Tests (`__tests__/analytics/`)
- **growth-analytics.test.ts**: Tests for the main growth analytics API endpoint
- **mcp-growth.test.ts**: Tests for MCP growth metrics tools

### 2. Test Data Generator (`scripts/generate-test-growth-data.js`)
- Creates realistic test data for manual testing
- Generates 50 test users with varied registration dates
- Creates 100 test posts with different engagement metrics

## Test Coverage

### Authentication Tests
- ✅ Unauthorized access (401)
- ✅ Insufficient permissions (403)
- ✅ Valid admin/analytics role access

### Growth Metrics Calculation
- ✅ Empty database handling
- ✅ Growth rate calculation with historical data
- ✅ Acquisition channel analysis
- ✅ Different time period handling

### MCP Tool Tests
- ✅ `get_growth_metrics` with various scenarios
- ✅ `get_leaderboard` sorting and limits
- ✅ Error handling for invalid requests

## Running Tests

### Unit Tests
```bash
# Run all analytics tests
npm test -- __tests__/analytics/

# Run specific test file
npm test -- __tests__/analytics/growth-analytics.test.ts

# Run with coverage
npm run test:coverage
```

### Generate Test Data
```bash
# Generate sample users and posts
node scripts/generate-test-growth-data.js
```

### Manual Testing
```bash
# Test MCP growth metrics
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_growth_metrics", "args": {"days": 30}}'

# Test growth analytics API (requires admin session)
curl http://localhost:3000/api/analytics/growth?days=30
```

## Test Scenarios

### Scenario 1: New Platform (No Users)
- **Expected**: All metrics return 0
- **Growth Rate**: 0%
- **Acquisition Channels**: Empty array

### Scenario 2: Growing Platform
- **Setup**: 50 users over 60 days
- **Expected**: Positive growth rate
- **Channels**: Mix of direct, referral, social, organic

### Scenario 3: Declining Platform
- **Setup**: More users in previous period than current
- **Expected**: Negative growth rate
- **Metrics**: Proper churn calculation

## Key Metrics Tested

### Growth Rate Calculation
```typescript
growthRate = ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100
```

### Acquisition Channel Distribution
- Direct registration
- Referral links
- Social media
- Organic search

### Time Period Flexibility
- 7-day periods
- 30-day periods
- 90-day periods
- Custom date ranges

## Mock Data Structure

### Test Users
```javascript
{
  username: 'testuser1',
  email: 'testuser1@example.com',
  registrationSource: 'direct|referral|social|organic',
  createdAt: Date,
  lastActive: Date,
  points: Number,
  level: Number
}
```

### Test Posts
```javascript
{
  content: 'Test post content...',
  author: ObjectId,
  tags: ['tag1', 'tag2'],
  likesCount: Number,
  commentsCount: Number,
  viewsCount: Number,
  createdAt: Date
}
```

## Error Handling Tests

### Database Connection Issues
- MongoDB connection failures
- Network timeouts
- Invalid queries

### Data Validation
- Invalid date ranges
- Negative day values
- Missing required fields

### Authentication Failures
- Expired sessions
- Invalid tokens
- Role-based access control

## Performance Considerations

### Database Queries
- Indexed fields for fast lookups
- Aggregation pipeline optimization
- Memory usage monitoring

### API Response Times
- Target: < 500ms for growth metrics
- Caching strategies for frequently accessed data
- Pagination for large datasets

## Continuous Integration

### Pre-commit Hooks
- Run unit tests
- Check code coverage
- Lint TypeScript files

### CI/CD Pipeline
- Automated test execution
- Coverage reporting
- Integration with MongoDB Atlas

## Future Test Enhancements

### Load Testing
- Simulate high user volumes
- Stress test analytics calculations
- Monitor memory usage

### Integration Tests
- End-to-end user journey testing
- Real database integration
- Cross-browser compatibility

### Visual Regression Tests
- Chart rendering accuracy
- Dashboard layout consistency
- Mobile responsiveness

## Troubleshooting

### Common Issues
1. **MongoDB Memory Server**: Ensure sufficient RAM
2. **Date Calculations**: Handle timezone differences
3. **Async Operations**: Proper await/async usage

### Debug Commands
```bash
# Check test database state
npm run test -- --verbose

# Debug specific test
npm run test -- --testNamePattern="growth metrics"

# Monitor test performance
npm run test -- --detectOpenHandles
```

## Conclusion

The growth analytics testing suite provides comprehensive coverage of:
- Core business logic
- Edge cases and error conditions
- Performance characteristics
- Security and authentication

This ensures reliable analytics data for business decision-making and platform optimization.