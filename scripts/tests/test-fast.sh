#!/bin/bash

echo "Running fast tests..."

# Run only the 3 test files that were running
pnpm jest __tests__/referrals/referral-system.test.ts __tests__/referrals/referral-api-fixed.test.ts __tests__/analytics/growth-simple.test.ts --verbose --runInBand --forceExit

echo "Fast tests completed!"