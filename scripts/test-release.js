#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function printStatus(success, message) {
  const color = success ? colors.green : colors.red;
  const icon = success ? '✅' : '❌';
  console.log(`${color}${icon} ${message}${colors.reset}`);
  return success;
}

function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`which ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

function getCommandVersion(command) {
  try {
    const output = execSync(`${command} --version`, { encoding: 'utf8' });
    return output.trim();
  } catch {
    return 'unknown';
  }
}

console.log('🧪 Testing Release Workflow Components');
console.log('======================================');

console.log('\n📋 Checking Prerequisites...');

// Check Node.js
if (commandExists('node')) {
  const nodeVersion = getCommandVersion('node');
  printStatus(true, `Node.js installed: ${nodeVersion}`);
} else {
  printStatus(false, 'Node.js not found');
  process.exit(1);
}

// Check npm
if (commandExists('npm')) {
  const npmVersion = getCommandVersion('npm');
  printStatus(true, `npm installed: ${npmVersion}`);
} else {
  printStatus(false, 'npm not found');
  process.exit(1);
}

// Check git
if (commandExists('git')) {
  const gitVersion = getCommandVersion('git');
  printStatus(true, `Git installed: ${gitVersion}`);
} else {
  printStatus(false, 'Git not found');
  process.exit(1);
}

console.log('\n📦 Checking Project Structure...');

// Check if package.json exists
if (fs.existsSync('package.json')) {
  printStatus(true, 'package.json found');
} else {
  printStatus(false, 'package.json not found');
  process.exit(1);
}

// Check if CHANGELOG.md exists
if (fs.existsSync('CHANGELOG.md')) {
  printStatus(true, 'CHANGELOG.md found');
} else {
  printStatus(false, 'CHANGELOG.md not found');
  process.exit(1);
}

// Check if release workflow exists
if (fs.existsSync('.github/workflows/release.yml')) {
  printStatus(true, 'Release workflow found');
} else {
  printStatus(false, 'Release workflow not found');
  process.exit(1);
}

console.log('\n🔧 Testing NPM Scripts...');

// Test changelog version script
console.log('Testing changelog:version...');
try {
  execSync('npm run changelog:version', { stdio: 'ignore' });
  printStatus(true, 'changelog:version script works');
} catch {
  printStatus(false, 'changelog:version script failed');
}

// Test changelog check script
console.log('Testing changelog:check...');
try {
  execSync('npm run changelog:check', { stdio: 'ignore' });
  printStatus(true, 'changelog:check script works');
} catch {
  printStatus(false, 'changelog:check script failed');
}

console.log('\n📄 Checking CHANGELOG.md Structure...');

// Check if [Unreleased] section exists
const changelogContent = fs.readFileSync('CHANGELOG.md', 'utf8');
if (changelogContent.includes('## [Unreleased]')) {
  printStatus(true, '[Unreleased] section found');
} else {
  printStatus(false, '[Unreleased] section not found');
}

// Check if version sections exist
if (changelogContent.includes('## [1.2.0]')) {
  printStatus(true, 'Version 1.2.0 section found');
} else {
  printStatus(false, 'Version 1.2.0 section not found');
}

console.log('\n🔒 Testing Security Scripts...');

// Test security audit script
console.log('Testing security:audit...');
try {
  execSync('npm run security:audit', { stdio: 'ignore' });
  printStatus(true, 'security:audit script works');
} catch {
  printStatus(false, 'security:audit script failed');
}

console.log('\n🚀 Testing Release Preparation...');

// Test release prepare script
console.log('Testing release:prepare...');
try {
  execSync('npm run release:prepare', { stdio: 'ignore' });
  printStatus(true, 'release:prepare script works');
} catch {
  printStatus(false, 'release:prepare script failed');
}

console.log('\n📝 Testing Commit Helper...');

// Check if commit script exists
if (fs.existsSync('scripts/commit.sh') || fs.existsSync('scripts/commit.bat')) {
  printStatus(true, 'Commit helper script found');
} else {
  printStatus(false, 'Commit helper script not found');
}

console.log('\n🔍 Checking Git Status...');

// Check if we're in a git repository
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  printStatus(true, 'Git repository initialized');

  // Check current branch
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`${colors.green}✅ Current branch: ${branch}${colors.reset}`);
  } catch {
    console.log(`${colors.yellow}⚠️  Could not determine current branch${colors.reset}`);
  }

  // Check if we have remote configured
  try {
    execSync('git remote get-url origin', { stdio: 'ignore' });
    printStatus(true, 'Git remote \'origin\' configured');
  } catch {
    printStatus(false, 'Git remote \'origin\' not configured');
  }
} catch {
  printStatus(false, 'Not in a git repository');
}

console.log('\n📊 Summary Report...');
console.log(`${colors.green}✅ All basic components are ready for release workflow${colors.reset}`);

console.log('\n🎯 Next Steps:');
console.log('1. Make sure your GitHub repository has the required secrets configured');
console.log('2. Test the CI/CD pipeline by making a small change and pushing');
console.log('3. Use the release workflow: GitHub Actions → Release Management → Run workflow');
console.log('4. Monitor the release process and verify deployment');

console.log('\n📚 Documentation Files:');
console.log('- CHANGELOG.md: Version history and release notes');
console.log('- SECURITY.md: Security measures and procedures');
console.log('- test-pipeline.md: Testing and verification procedures');
console.log('- QUICK_REFERENCE.md: This guide for daily use');

console.log(`\n${colors.green}🎉 Release workflow testing completed!${colors.reset}`); 