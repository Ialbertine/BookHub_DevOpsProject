@echo off
REM Conventional Commit Helper Script for Windows
REM This script helps create properly formatted conventional commits

echo 🔧 Conventional Commit Helper
echo ==============================

echo.
echo Select commit type:
echo 1) feat     - A new feature
echo 2) fix      - A bug fix
echo 3) docs     - Documentation only changes
echo 4) style    - Changes that do not affect the meaning of the code
echo 5) refactor - A code change that neither fixes a bug nor adds a feature
echo 6) perf     - A code change that improves performance
echo 7) test     - Adding missing tests or correcting existing tests
echo 8) chore    - Changes to the build process or auxiliary tools
echo 9) security - Security-related changes
echo 10) ci      - Changes to CI configuration files and scripts
echo 11) build   - Changes that affect the build system or external dependencies

set /p choice="Enter your choice (1-11): "

if "%choice%"=="1" set commit_type=feat
if "%choice%"=="2" set commit_type=fix
if "%choice%"=="3" set commit_type=docs
if "%choice%"=="4" set commit_type=style
if "%choice%"=="5" set commit_type=refactor
if "%choice%"=="6" set commit_type=perf
if "%choice%"=="7" set commit_type=test
if "%choice%"=="8" set commit_type=chore
if "%choice%"=="9" set commit_type=security
if "%choice%"=="10" set commit_type=ci
if "%choice%"=="11" set commit_type=build

if not defined commit_type (
    echo Invalid choice. Using 'chore' as default.
    set commit_type=chore
)

REM Get scope (optional)
set /p scope="Enter scope (optional, e.g., backend, frontend, pipeline): "

REM Get commit message
set /p message="Enter commit message: "

REM Build commit message
if not "%scope%"=="" (
    set commit_message=%commit_type%(%scope%): %message%
) else (
    set commit_message=%commit_type%: %message%
)

echo.
echo 📝 Your commit message will be:
echo %commit_message%
echo.

set /p confirm="Proceed with commit? (y/n): "

if /i "%confirm%"=="y" (
    REM Stage all changes
    git add .
    
    REM Create commit
    git commit -m "%commit_message%"
    
    echo ✅ Commit created successfully!
    echo 💡 Tip: Use 'git push' to push your changes
) else (
    echo ❌ Commit cancelled
) 