#!/bin/bash

# Script to set up GitHub remote and push

echo "🌳 Tree Data Structures - GitHub Setup"
echo "======================================"
echo ""

# Check if remote already exists
if git remote -v | grep -q origin; then
    echo "✓ Remote 'origin' already exists"
    git remote -v
    echo ""
    read -p "Do you want to push to existing remote? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing to GitHub..."
        git push -u origin main
        exit 0
    fi
fi

# Get repository URL
echo "To push to GitHub, you need to:"
echo "1. Create a repository on GitHub (https://github.com/new)"
echo "2. Copy the repository URL"
echo ""
read -p "Enter your GitHub repository URL (or press Enter to skip): " repo_url

if [ -z "$repo_url" ]; then
    echo "Skipping remote setup. You can add it later with:"
    echo "  git remote add origin <your-repo-url>"
    echo "  git push -u origin main"
    exit 0
fi

# Add remote
echo ""
echo "Adding remote 'origin'..."
git remote add origin "$repo_url"

# Verify
echo ""
echo "Remote added:"
git remote -v

# Push
echo ""
read -p "Push to GitHub now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Successfully pushed to GitHub!"
        echo ""
        echo "Next steps:"
        echo "1. Go to your repository on GitHub"
        echo "2. Settings → Pages"
        echo "3. Select branch 'main' and folder '/' (root)"
        echo "4. Save"
        echo ""
        echo "Your site will be available at:"
        echo "https://$(echo $repo_url | sed 's/.*github.com[:/]\([^/]*\)\/\([^/]*\).*/\1.github.io\/\2/')"
    else
        echo "✗ Push failed. Please check your repository URL and permissions."
    fi
else
    echo "You can push later with: git push -u origin main"
fi
