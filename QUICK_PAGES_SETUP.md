# Quick Setup: Enable GitHub Pages

## ⚠️ Important: Enable Pages First!

The GitHub Actions workflow is ready, but **Pages must be enabled in repository settings first**.

## Steps (2 minutes)

1. **Go to Settings**
   - Visit: https://github.com/Sapana-Micro-Software/merry-go-round-splay-trees/settings/pages

2. **Select Source**
   - Under **Build and deployment**
   - **Source**: Select **"GitHub Actions"**
   - Click **Save**

3. **Done!**
   - The next workflow run will deploy automatically
   - Your site will be live at:
     ```
     https://sapana-micro-software.github.io/merry-go-round-splay-trees/
     ```

## Why This Is Needed

GitHub Pages requires explicit enablement for security. Once enabled, the workflow will:
- ✅ Build Jekyll site automatically
- ✅ Deploy on every push to `main`
- ✅ Update the site automatically

## Verify It's Working

After enabling:
1. Go to **Actions** tab
2. Wait for workflow to complete
3. Check the **Pages** section in Settings - you'll see the deployment status
4. Visit your site URL!

That's it! 🎉
