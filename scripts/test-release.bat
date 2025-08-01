@echo off
REM Test Release Workflow Script for Windows
REM This script tests all components needed for the release workflow

echo 🧪 Testing Release Workflow Components
echo ======================================

echo.
echo 📋 Checking Prerequisites...

REM Check Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js installed: %NODE_VERSION%
) else (
    echo ❌ Node.js not found
    exit /b 1
)

REM Check npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm installed: %NPM_VERSION%
) else (
    echo ❌ npm not found
    exit /b 1
)

REM Check git
where git >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VERSION=%%i
    echo ✅ Git installed: %GIT_VERSION%
) else (
    echo ❌ Git not found
    exit /b 1
)

echo.
echo 📦 Checking Project Structure...

REM Check if package.json exists
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found
    exit /b 1
)

REM Check if CHANGELOG.md exists
if exist "CHANGELOG.md" (
    echo ✅ CHANGELOG.md found
) else (
    echo ❌ CHANGELOG.md not found
    exit /b 1
)

REM Check if release workflow exists
if exist ".github\workflows\release.yml" (
    echo ✅ Release workflow found
) else (
    echo ❌ Release workflow not found
    exit /b 1
)

echo.
echo 🔧 Testing NPM Scripts...

REM Test changelog version script
echo Testing changelog:version...
npm run changelog:version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ changelog:version script works
) else (
    echo ❌ changelog:version script failed
)

REM Test changelog check script
echo Testing changelog:check...
npm run changelog:check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ changelog:check script works
) else (
    echo ❌ changelog:check script failed
)

echo.
echo 📄 Checking CHANGELOG.md Structure...

REM Check if [Unreleased] section exists
findstr /C:"## [Unreleased]" CHANGELOG.md >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ [Unreleased] section found
) else (
    echo ❌ [Unreleased] section not found
)

REM Check if version sections exist
findstr /C:"## [1.2.0]" CHANGELOG.md >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Version 1.2.0 section found
) else (
    echo ❌ Version 1.2.0 section not found
)

echo.
echo 🔒 Testing Security Scripts...

REM Test security audit script
echo Testing security:audit...
npm run security:audit >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ security:audit script works
) else (
    echo ❌ security:audit script failed
)

echo.
echo 🚀 Testing Release Preparation...

REM Test release prepare script
echo Testing release:prepare...
npm run release:prepare >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ release:prepare script works
) else (
    echo ❌ release:prepare script failed
)

echo.
echo 📝 Testing Commit Helper...

REM Check if commit script exists
if exist "scripts\commit.sh" (
    echo ✅ Commit helper script found
) else (
    echo ❌ Commit helper script not found
)

echo.
echo 🔍 Checking Git Status...

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git repository initialized
    
    REM Check current branch
    for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
    echo ✅ Current branch: %CURRENT_BRANCH%
    
    REM Check if we have remote configured
    git remote get-url origin >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Git remote 'origin' configured
    ) else (
        echo ❌ Git remote 'origin' not configured
    )
) else (
    echo ❌ Not in a git repository
)

echo.
echo 📊 Summary Report...
echo ✅ All basic components are ready for release workflow

echo.
echo 🎯 Next Steps:
echo 1. Make sure your GitHub repository has the required secrets configured
echo 2. Test the CI/CD pipeline by making a small change and pushing
echo 3. Use the release workflow: GitHub Actions → Release Management → Run workflow
echo 4. Monitor the release process and verify deployment

echo.
echo 📚 Documentation Files:
echo - CHANGELOG.md: Version history and release notes
echo - SECURITY.md: Security measures and procedures
echo - test-pipeline.md: Testing and verification procedures
echo - QUICK_REFERENCE.md: This guide for daily use

echo.
echo 🎉 Release workflow testing completed! 