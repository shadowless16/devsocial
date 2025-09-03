@echo off
REM === Load environment variables from .env.local ===
for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    set %%a=%%b
)

REM === Run Claude CLI ===
claude
