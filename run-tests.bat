@echo off
echo 🧪 DevSocial Moderation System Test Suite
echo ==========================================

echo.
echo 📦 Installing required dependencies...
npm install bcryptjs mongoose

echo.
echo 🏗️  Setting up test data...
node test-moderation.js setup

echo.
echo 🧪 Running API tests...
node test-moderation.js test

echo.
echo ✅ Test setup complete!
echo.
echo 🚀 Next steps:
echo 1. Start your development server: npm run dev
echo 2. Login as 'testadmin' with password 'password123'
echo 3. Visit /moderation to see the reports
echo 4. Test the moderation actions
echo.
pause