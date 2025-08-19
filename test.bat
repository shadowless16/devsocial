@echo off
setlocal enabledelayedexpansion

REM DevSocial Test Runner - Windows Batch Version
REM Usage: test.bat <command> [options]

if "%1"=="" (
    call :show_help
    exit /b 0
)

set COMMAND=%1
shift

REM Collect remaining arguments
set ARGS=
:collect_args
if "%1"=="" goto :execute_command
set ARGS=%ARGS% %1
shift
goto :collect_args

:execute_command
if /i "%COMMAND%"=="help" call :show_help
if /i "%COMMAND%"=="all" call :run_all_tests
if /i "%COMMAND%"=="unit" call :run_unit_tests
if /i "%COMMAND%"=="integration" call :run_integration_tests
if /i "%COMMAND%"=="watch" call :run_watch_mode
if /i "%COMMAND%"=="coverage" call :run_coverage
if /i "%COMMAND%"=="analytics" call :run_analytics_tests
if /i "%COMMAND%"=="auth" call :run_auth_tests
if /i "%COMMAND%"=="components" call :run_component_tests
if /i "%COMMAND%"=="utils" call :run_utils_tests
if /i "%COMMAND%"=="api" call :run_api_tests
if /i "%COMMAND%"=="referrals" call :run_referral_tests
if /i "%COMMAND%"=="lint" call :run_lint
if /i "%COMMAND%"=="clean" call :clean_artifacts
if /i "%COMMAND%"=="setup" call :setup_environment
if /i "%COMMAND%"=="ci" call :run_ci_tests
if /i "%COMMAND%"=="debug" call :run_debug_mode
if /i "%COMMAND%"=="parallel" call :run_parallel_tests
if /i "%COMMAND%"=="specific" call :run_specific_test

echo Unknown command: %COMMAND%
call :show_help
exit /b 1

:show_help
echo.
echo 🧪 DevSocial Test Runner
echo.
echo Usage: test.bat ^<command^> [options]
echo.
echo Commands:
echo   help          Show this help message
echo   all           Run all tests
echo   unit          Run unit tests only
echo   integration   Run integration tests only
echo   watch         Run tests in watch mode
echo   coverage      Run tests with coverage report
echo   analytics     Run analytics-related tests
echo   auth          Run authentication tests
echo   components    Run component tests
echo   utils         Run utility function tests
echo   api           Run API endpoint tests
echo   referrals     Run referral system tests
echo   lint          Run linting checks
echo   clean         Clean test artifacts and cache
echo   setup         Setup test environment
echo   ci            Run tests in CI mode
echo   debug         Run tests in debug mode
echo   parallel      Run tests in parallel
echo   specific      Run specific test file
echo.
echo Examples:
echo   test.bat all
echo   test.bat watch analytics
echo   test.bat coverage
echo   test.bat specific signup.test.ts
echo   test.bat ci
echo.
exit /b 0

:run_all_tests
echo 🚀 Running all tests...
call npm test %ARGS%
exit /b %errorlevel%

:run_unit_tests
echo 🔬 Running unit tests...
call npx jest --testPathPattern="__tests__/(utils|components|auth|analytics)" %ARGS%
exit /b %errorlevel%

:run_integration_tests
echo 🔗 Running integration tests...
call npx jest --testPathPattern="__tests__/integration" %ARGS%
exit /b %errorlevel%

:run_watch_mode
echo 👀 Running tests in watch mode...
call npx jest --watch %ARGS%
exit /b %errorlevel%

:run_coverage
echo 📊 Running tests with coverage...
call npx jest --coverage %ARGS%
exit /b %errorlevel%

:run_analytics_tests
echo 📈 Running analytics tests...
call npx jest --testPathPattern="__tests__/analytics" %ARGS%
exit /b %errorlevel%

:run_auth_tests
echo 🔐 Running authentication tests...
call npx jest --testPathPattern="__tests__/auth" %ARGS%
exit /b %errorlevel%

:run_component_tests
echo 🧩 Running component tests...
call npx jest --testPathPattern="__tests__/components" %ARGS%
exit /b %errorlevel%

:run_utils_tests
echo 🛠️ Running utility tests...
call npx jest --testPathPattern="__tests__/utils" %ARGS%
exit /b %errorlevel%

:run_api_tests
echo 🌐 Running API tests...
call npx jest --testPathPattern="__tests__/api" %ARGS%
exit /b %errorlevel%

:run_referral_tests
echo 🎯 Running referral system tests...
call npx jest --testPathPattern="__tests__/referrals" %ARGS%
exit /b %errorlevel%

:run_lint
echo 🔍 Running linting checks...
call npm run lint %ARGS%
exit /b %errorlevel%

:clean_artifacts
echo 🧹 Cleaning test artifacts...
if exist coverage rmdir /s /q coverage
if exist jest-cache rmdir /s /q jest-cache
if exist .nyc_output rmdir /s /q .nyc_output
if exist test-results.xml del test-results.xml
if exist junit.xml del junit.xml
call npx jest --clearCache
echo ✅ Test artifacts cleaned
exit /b 0

:setup_environment
echo ⚙️ Setting up test environment...
call node test-runner.js setup %ARGS%
exit /b %errorlevel%

:run_ci_tests
echo 🤖 Running tests in CI mode...
call npx jest --ci --coverage --watchAll=false --passWithNoTests %ARGS%
exit /b %errorlevel%

:run_debug_mode
echo 🐛 Running tests in debug mode...
call npx jest --verbose --no-cache --runInBand %ARGS%
exit /b %errorlevel%

:run_parallel_tests
echo ⚡ Running tests in parallel...
call npx jest --maxWorkers=4 --passWithNoTests %ARGS%
exit /b %errorlevel%

:run_specific_test
echo 🎯 Running specific test...
call npx jest --testNamePattern=%ARGS%
exit /b %errorlevel%