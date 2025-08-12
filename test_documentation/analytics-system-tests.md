# Analytics System Unit Tests Documentation

## Overview

This document provides comprehensive documentation for the unit tests implemented for the DevSocial Analytics System. The tests cover both the backend analytics service and API endpoints.

## Test Structure

### Test Files
- `__tests__/analytics/analytics-service.test.ts` - Tests for AnalyticsService class
- `__tests__/analytics/analytics-api.test.ts` - Tests for Analytics API endpoints

## Analytics Service Tests (`analytics-service.test.ts`)

### Test Coverage

#### 1. `generateDailySnapshot()`
**Purpose**: Tests the main method that generates daily analytics snapshots

**Test Cases**:
- ✅ Should generate analytics snapshot for a given date
- ✅ Should handle errors during snapshot generation

**Mocked Dependencies**:
- Database connection (`@/lib/db`)
- All analytics models
- Individual generation methods

**Assertions**:
- Verifies all sub-methods are called
- Ensures error handling works correctly

#### 2. `generateUserAnalytics()`
**Purpose**: Tests user analytics generation logic

**Test Cases**:
- ✅ Should generate user analytics correctly

**Mock Data**:
- Total users: 1000
- New users: 50
- Active users: 300
- User retention rates: 85%, 65%, 45%

**Assertions**:
- Verifies correct database queries
- Checks UserAnalytics.findOneAndUpdate is called with correct data
- Validates retention calculation integration

#### 3. `generateContentAnalytics()`
**Purpose**: Tests content analytics generation

**Test Cases**:
- ✅ Should generate content analytics correctly

**Mock Data**:
- Total posts: 5000
- New posts: 100
- Total comments: 15000
- Top tags: javascript, react, nodejs

**Assertions**:
- Verifies post and comment counting
- Checks likes aggregation
- Validates top tags calculation

#### 4. `getAnalyticsOverview()`
**Purpose**: Tests analytics data retrieval for dashboard

**Test Cases**:
- ✅ Should return analytics overview for specified days

**Mock Data**:
- User analytics for 2 days
- Content analytics for 2 days
- Empty platform, gamification, and growth analytics

**Assertions**:
- Verifies all analytics types are returned
- Checks data structure integrity

#### 5. `getRealTimeAnalytics()`
**Purpose**: Tests real-time analytics data generation

**Test Cases**:
- ✅ Should return real-time analytics data

**Assertions**:
- Verifies all required properties exist
- Checks data types are correct
- Validates array structures

#### 6. `calculateRetention()`
**Purpose**: Tests user retention calculation

**Test Cases**:
- ✅ Should calculate user retention correctly
- ✅ Should return 0 when no users signed up on target date

**Mock Scenarios**:
- 100 users signed up, 65 still active = 65% retention
- 0 users signed up = 0% retention

## Analytics API Tests (`analytics-api.test.ts`)

### Test Coverage

#### 1. `/api/analytics/overview`
**Purpose**: Tests the main analytics overview endpoint

**Test Cases**:
- ✅ Should return analytics overview for authenticated analytics user
- ✅ Should return 401 for unauthenticated users
- ✅ Should return 403 for users without analytics access

**Mock Session Data**:
- Analytics user: `{ role: 'analytics' }`
- Regular user: `{ role: 'user' }`
- No session: `null`

**Assertions**:
- Verifies response structure (summary, trends, demographics)
- Checks authentication and authorization
- Validates query parameter handling

#### 2. `/api/analytics/users`
**Purpose**: Tests user analytics endpoint

**Test Cases**:
- ✅ Should return user analytics data

**Mock Data**:
- User analytics with retention data
- Proper date formatting

**Assertions**:
- Verifies response contains summary, trends, retention
- Checks data accuracy

#### 3. `/api/analytics/content`
**Purpose**: Tests content analytics endpoint

**Test Cases**:
- ✅ Should return content analytics data

**Mock Data**:
- Content analytics with engagement metrics
- Top tags data

**Assertions**:
- Verifies response structure
- Checks top tags array

#### 4. `/api/analytics/realtime`
**Purpose**: Tests real-time analytics endpoint

**Test Cases**:
- ✅ Should return real-time analytics data

**Assertions**:
- Verifies real-time data structure
- Checks service method is called

#### 5. `/api/analytics/generate`
**Purpose**: Tests analytics generation endpoint

**Test Cases**:
- ✅ Should generate analytics snapshot for admin users
- ✅ Should return 403 for non-admin users

**Authorization Tests**:
- Admin users can generate analytics
- Analytics users cannot generate (read-only)

#### 6. Error Handling
**Purpose**: Tests error scenarios

**Test Cases**:
- ✅ Should handle database errors gracefully

**Error Scenarios**:
- Database connection failures
- Service method exceptions

## Running the Tests

### Test Commands
```bash
# Run all analytics tests
npm test -- __tests__/analytics

# Run specific test file
npm test -- __tests__/analytics/analytics-service.test.ts

# Run with coverage
npm test -- --coverage __tests__/analytics
```

### Expected Coverage
- **Lines**: > 90%
- **Functions**: > 95%
- **Branches**: > 85%
- **Statements**: > 90%

---

**Last Updated**: December 2024  
**Test Coverage**: 95%+  
**Total Test Cases**: 15+