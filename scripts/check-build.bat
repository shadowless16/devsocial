@echo off
echo Checking for build errors...
pnpm run build
if %errorlevel% neq 0 (
    echo Build failed! Fix errors before pushing.
    exit /b 1
) else (
    echo Build successful!
)