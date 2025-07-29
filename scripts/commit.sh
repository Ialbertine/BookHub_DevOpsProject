#!/bin/bash

# Conventional Commit Helper Script
# This script helps create properly formatted conventional commits

echo "🔧 Conventional Commit Helper"
echo "=============================="

# Get commit type
echo "Select commit type:"
echo "1) feat     - A new feature"
echo "2) fix      - A bug fix"
echo "3) docs     - Documentation only changes"
echo "4) style    - Changes that do not affect the meaning of the code"
echo "5) refactor - A code change that neither fixes a bug nor adds a feature"
echo "6) perf     - A code change that improves performance"
echo "7) test     - Adding missing tests or correcting existing tests"
echo "8) chore    - Changes to the build process or auxiliary tools"
echo "9) security - Security-related changes"
echo "10) ci      - Changes to CI configuration files and scripts"
echo "11) build   - Changes that affect the build system or external dependencies"

read -p "Enter your choice (1-11): " choice

case $choice in
    1) commit_type="feat" ;;
    2) commit_type="fix" ;;
    3) commit_type="docs" ;;
    4) commit_type="style" ;;
    5) commit_type="refactor" ;;
    6) commit_type="perf" ;;
    7) commit_type="test" ;;
    8) commit_type="chore" ;;
    9) commit_type="security" ;;
    10) commit_type="ci" ;;
    11) commit_type="build" ;;
    *) echo "Invalid choice. Using 'chore' as default."; commit_type="chore" ;;
esac

# Get scope (optional)
read -p "Enter scope (optional, e.g., backend, frontend, pipeline): " scope

# Get commit message
read -p "Enter commit message: " message

# Build commit message
if [ -n "$scope" ]; then
    commit_message="$commit_type($scope): $message"
else
    commit_message="$commit_type: $message"
fi

echo ""
echo "📝 Your commit message will be:"
echo "$commit_message"
echo ""

read -p "Proceed with commit? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    # Stage all changes
    git add .
    
    # Create commit
    git commit -m "$commit_message"
    
    echo "✅ Commit created successfully!"
    echo "💡 Tip: Use 'git push' to push your changes"
else
    echo "❌ Commit cancelled"
fi 