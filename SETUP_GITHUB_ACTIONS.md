# GitHub Actions Setup for Jazzy GitHub Pages

Copyright (C) 2025, Shyamal Suhana Chandra

## Quick Start

This repository is already configured with GitHub Actions! Just push to `main` and your site will deploy automatically.

## What's Already Configured

### 1. GitHub Actions Workflows

#### Pages Deployment (`.github/workflows/pages.yml`)
- ✅ Automatically builds on push to `main`
- ✅ Sets up Ruby 3.1 for Jekyll
- ✅ Sets up Node.js 20 for TypeScript
- ✅ Installs npm and bundle dependencies
- ✅ Compiles TypeScript to JavaScript
- ✅ Builds Jekyll static site
- ✅ Deploys to GitHub Pages

#### PDF Generation (`.github/workflows/build-pdfs.yml`)
- ✅ Compiles LaTeX files to PDFs
- ✅ Commits PDFs back to repository
- ✅ Runs when `.tex` files change

### 2. Required Files

All necessary files are present:
- ✅ `package.json` - Node.js dependencies
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `_config.yml` - Jekyll configuration
- ✅ `Gemfile` - Ruby dependencies (if needed)

## Manual Setup (If Starting Fresh)

### Step 1: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Under **Source**, select **GitHub Actions**
4. Save settings

### Step 2: Create Workflow File

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy Jekyll site to Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: bundle install
      - run: npm run build
      - run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production
          BASEURL: "/merry-go-round-splay-trees"
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./_site

  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

### Step 3: Configure Package.json

Ensure `package.json` has build scripts:

```json
{
  "scripts": {
    "build": "tsc && npm run build:css",
    "build:css": "postcss assets/css/main.css -o assets/css/main.css --map",
    "watch": "tsc --watch"
  }
}
```

### Step 4: Configure TypeScript

Ensure `tsconfig.json` compiles to correct output:

```json
{
  "compilerOptions": {
    "outDir": "./assets/js",
    "rootDir": "./src/ts"
  }
}
```

## Verification

### Check Workflow Status

1. Go to **Actions** tab in GitHub
2. View latest workflow run
3. Check for green checkmarks ✅

### Test Locally

```bash
# Install dependencies
npm install
bundle install

# Build
npm run build
bundle exec jekyll build

# Check _site directory
ls _site/
```

## Troubleshooting

### Workflow Fails

**Error**: "TypeScript compilation failed"
- Check `tsconfig.json` syntax
- Verify all imports are correct
- Check for TypeScript errors locally

**Error**: "Jekyll build failed"
- Check `_config.yml` syntax
- Verify baseurl matches repository name
- Check for YAML syntax errors

**Error**: "npm install failed"
- Verify `package.json` is valid JSON
- Check `package-lock.json` exists
- Ensure all dependencies are available

### Site Not Updating

1. Check Actions tab - workflow may be running
2. Wait 2-5 minutes for deployment
3. Clear browser cache
4. Check GitHub Pages settings

### TypeScript Not Compiling

1. Run `npm run build` locally
2. Check for TypeScript errors
3. Verify `tsconfig.json` paths
4. Ensure all source files are in `src/ts/`

## Advanced Configuration

### Custom Build Steps

Add to workflow:
```yaml
- name: Custom build step
  run: |
    # Your custom commands
    echo "Building..."
```

### Environment Variables

Add to workflow:
```yaml
env:
  NODE_ENV: production
  CUSTOM_VAR: value
```

### Multiple Node Versions

Test with different versions:
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```

## Best Practices

1. **Cache Dependencies**: Use `cache: 'npm'` for faster builds
2. **Parallel Jobs**: Run TypeScript and CSS builds in parallel if possible
3. **Error Handling**: Add `continue-on-error: true` for optional steps
4. **Notifications**: Set up workflow notifications in repository settings

## Current Status

✅ **Fully Configured and Working**

The repository is ready to use! Just:
1. Make changes
2. Commit and push
3. GitHub Actions handles the rest!

## Support

For issues or questions:
- Check GitHub Actions logs
- Review workflow files
- Test builds locally first

---

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.
