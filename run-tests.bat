@echo off
if "%1"=="" (
    echo Usage: run-tests.bat [all^|unit^|watch^|coverage^|analytics^|auth^|clean]
    exit /b 0
)

if "%1"=="all" npx jest
if "%1"=="unit" npx jest --testPathPattern="__tests__/(utils^|components^|auth^|analytics)"
if "%1"=="watch" npx jest --watch
if "%1"=="coverage" npx jest --coverage
if "%1"=="analytics" npx jest --testPathPattern="__tests__/analytics"
if "%1"=="auth" npx jest --testPathPattern="__tests__/auth"
if "%1"=="clean" (
    if exist coverage rmdir /s /q coverage
    npx jest --clearCache
)