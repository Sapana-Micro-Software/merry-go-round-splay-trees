# GitHub Pages Setup with GitHub Actions

Copyright (C) 2025, Shyamal Suhana Chandra

## Overview

This repository uses **GitHub Actions** to automatically build and deploy a jazzy, snazzy GitHub Pages site using:
- **HTML5** for structure
- **Canvas API** for interactive visualizations
- **TypeScript** for type-safe JavaScript
- **Node.js** for build tooling
- **CSS3** for modern styling and animations
- **Jekyll** for static site generation

## Repository Structure

```
merry-go-round-splay-tree/
├── .github/
│   └── workflows/
│       ├── pages.yml          # GitHub Pages deployment
│       └── build-pdfs.yml     # LaTeX PDF generation
├── assets/
│   ├── css/
│   │   └── main.css           # All styles with animations
│   └── js/                    # Compiled JavaScript from TypeScript
├── src/
│   └── ts/                    # TypeScript source files
│       ├── index.ts
│       ├── canvas-background.ts
│       ├── enhanced-visualizer.ts
│       ├── interactive-effects.ts
│       ├── advanced-effects.ts
│       ├── typing-animation.ts
│       └── 3d-effects.ts
├── proofs/                    # LaTeX proofs and PDFs
├── index.html                 # Main page
├── proofs.html                # Proofs page
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
└── _config.yml                # Jekyll configuration
```

## Technologies Used

### Frontend
- **HTML5**: Semantic markup with modern features
- **Canvas API**: Interactive particle systems, tree visualizations
- **CSS3**: Advanced animations, gradients, transforms, glassmorphism
- **JavaScript/TypeScript**: Interactive effects and animations

### Build Tools
- **TypeScript**: Type-safe JavaScript compilation
- **Node.js**: Package management and build scripts
- **PostCSS**: CSS processing and optimization
- **Jekyll**: Static site generation

### Deployment
- **GitHub Actions**: Automated CI/CD pipeline
- **GitHub Pages**: Static site hosting

## GitHub Actions Workflow

### Pages Deployment (`.github/workflows/pages.yml`)

The workflow automatically:
1. **Triggers** on push to `main` branch
2. **Sets up** Ruby (for Jekyll) and Node.js (for TypeScript)
3. **Installs** dependencies (`npm ci` and `bundle install`)
4. **Builds** TypeScript to JavaScript
5. **Builds** Jekyll site
6. **Deploys** to GitHub Pages

### PDF Generation (`.github/workflows/build-pdfs.yml`)

Automatically compiles LaTeX files to PDFs when `.tex` files are updated.

## Local Development Setup

### Prerequisites
- Node.js 20+
- Ruby 3.1+ (for Jekyll)
- TypeScript 5.0+

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Ruby dependencies (if using Jekyll locally)
bundle install
```

### Build Commands

```bash
# Build TypeScript and CSS
npm run build

# Watch TypeScript files for changes
npm run watch

# Build everything (TypeScript + Jekyll)
npm run build:all

# Serve locally with Jekyll
npm run serve
```

## Features

### Canvas Effects
- Interactive particle systems
- Wave animations
- Mouse-attracted particles
- Floating particle connections

### 3D Effects
- Card tilting with perspective
- 3D transforms on hover
- Depth and dimension

### Animations
- Typing animations
- Gradient shifts
- Neon glows
- Glassmorphism
- Parallax scrolling

### Interactive Elements
- Magnetic buttons
- Cursor trails
- Confetti effects
- Ripple effects
- Scroll reveals

## GitHub Pages URL

Once deployed, your site will be available at:
```
https://sapana-micro-software.github.io/merry-go-round-splay-trees/
```

## Customization

### Colors
Edit CSS variables in `assets/css/main.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
}
```

### Animations
Modify animation keyframes in CSS or TypeScript files.

### Content
Edit `index.html` and `proofs.html` for content changes.

## Deployment Process

1. **Make changes** to HTML, CSS, or TypeScript files
2. **Build locally** (optional): `npm run build`
3. **Commit and push** to `main` branch
4. **GitHub Actions** automatically:
   - Builds TypeScript
   - Compiles CSS
   - Generates Jekyll site
   - Deploys to GitHub Pages

## Troubleshooting

### Build Fails
- Check GitHub Actions logs in repository
- Verify `package.json` and `tsconfig.json` are correct
- Ensure all dependencies are listed

### TypeScript Errors
- Run `npm run build` locally to see errors
- Check `tsconfig.json` configuration

### CSS Not Updating
- Clear browser cache
- Check PostCSS build output
- Verify CSS file paths

## License

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.
