# GitHub Setup Instructions

## Repository Setup

The repository has been initialized and committed locally. To push to GitHub:

### Option 1: Create New Repository on GitHub

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `merry-go-round-splay-tree` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/yourusername/merry-go-round-splay-tree.git`)

### Option 2: Use Existing Repository

If you already have a GitHub repository, use its URL.

## Push to GitHub

Once you have the repository URL, run:

```bash
# Add remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/merry-go-round-splay-tree.git

# Push to GitHub
git push -u origin main
```

## Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
4. Click **Save**

## GitHub Actions

The GitHub Actions workflow (`.github/workflows/pages.yml`) will automatically:
- Deploy to GitHub Pages on every push to `main` branch
- Build and publish the site automatically

## Verify Deployment

After pushing:
1. Wait a few minutes for GitHub Actions to complete
2. Check the **Actions** tab in your repository
3. Once complete, your site will be available at:
   `https://yourusername.github.io/merry-go-round-splay-tree/`

## Manual Push Commands

If you need to push manually:

```bash
# Check status
git status

# Add any new changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```
