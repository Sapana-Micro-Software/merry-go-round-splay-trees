# Enable GitHub Pages - Manual Steps

The GitHub Actions workflow needs Pages to be enabled in repository settings first.

## Steps to Enable GitHub Pages

1. **Go to Repository Settings**
   - Navigate to: https://github.com/Sapana-Micro-Software/merry-go-round-splay-trees/settings
   - Click on **Pages** in the left sidebar

2. **Configure Pages Source**
   - Under **Source**, select:
     - **Deploy from a branch**: Select this option
     - **Branch**: `gh-pages` (or create it)
     - **Folder**: `/ (root)`
   
   **OR** (Recommended for GitHub Actions):
   - Under **Source**, select:
     - **GitHub Actions**: Select this option
     - This allows the workflow to deploy automatically

3. **Save Settings**
   - Click **Save**
   - Wait a few moments for Pages to initialize

4. **Verify**
   - Go to the **Actions** tab
   - The workflow should now be able to deploy
   - Your site will be available at:
     ```
     https://sapana-micro-software.github.io/merry-go-round-splay-trees/
     ```

## Alternative: Enable via GitHub CLI

If you have GitHub CLI installed:

```bash
gh api repos/Sapana-Micro-Software/merry-go-round-splay-trees/pages \
  -X POST \
  -f source[branch]=main \
  -f source[path]=/
```

## Troubleshooting

If Pages still doesn't work:
1. Make sure the repository is **public** (it is)
2. Check that the workflow has `pages: write` permission (it does)
3. Verify the `github-pages` environment exists
4. Wait a few minutes after enabling Pages for it to initialize

## Current Workflow Configuration

The workflow is configured to:
- Build Jekyll site in `_site` directory
- Upload as Pages artifact
- Deploy automatically when workflow completes

Once Pages is enabled in settings, the workflow will deploy successfully!
