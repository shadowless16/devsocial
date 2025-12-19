#!/bin/bash

# Quick Migration Script - Migrates Priority 1 routes
# Run: bash quick-migrate.sh

echo "🚀 Starting Quick Migration - Priority 1 Routes"
echo "================================================"
echo ""

# Priority 1 routes to migrate
ROUTES=("feed" "search" "tags" "trending")

for route in "${ROUTES[@]}"; do
  echo "📦 Generating $route routes..."
  node generate-routes.js "$route"
  echo "✅ $route routes generated"
  echo ""
done

echo "================================================"
echo "✅ Priority 1 route boilerplate generated!"
echo ""
echo "📋 Next steps:"
echo "   1. Implement each route in backend/src/routes/"
echo "   2. Copy logic from app/api/ to backend/src/routes/"
echo "   3. Add routes to backend/src/server.ts"
echo "   4. Test with: cd backend && pnpm dev"
echo "   5. Update frontend API client"
echo ""
