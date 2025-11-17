# Jazzy & Snazzy Features Guide

Copyright (C) 2025, Shyamal Suhana Chandra

## 🎨 Visual Effects Showcase

This GitHub Pages site features cutting-edge web technologies and stunning visual effects.

## Canvas API Features

### 1. Background Particle System
- **Location**: `src/ts/canvas-background.ts`
- **Features**:
  - Interactive particles with mouse attraction
  - Wave animations across the canvas
  - Multi-color particle system
  - Dynamic gradient overlays
  - Particle connections with distance-based opacity

### 2. Floating Effects Canvas
- **Location**: `src/ts/advanced-effects.ts`
- **Features**:
  - Mouse-following particles
  - Scroll-triggered particle generation
  - Particle connections and trails
  - Glow effects on particles

### 3. Tree Visualization Canvas
- **Location**: `src/ts/enhanced-visualizer.ts`
- **Features**:
  - Interactive tree rendering
  - Zoom and pan controls
  - Node hover effects
  - Particle explosions on click
  - Animated splay operations

## TypeScript Modules

### Core Modules
1. **`index.ts`** - Main entry point, initializes all effects
2. **`canvas-background.ts`** - Background particle system
3. **`enhanced-visualizer.ts`** - Tree visualization with controls
4. **`interactive-effects.ts`** - Cursor trails, magnetic buttons, confetti
5. **`advanced-effects.ts`** - Floating particles and scroll effects
6. **`typing-animation.ts`** - Dynamic text reveal animations
7. **`3d-effects.ts`** - 3D transforms and perspective effects
8. **`page-animations.ts`** - Scroll animations and parallax

## CSS3 Advanced Features

### Animations
- **Gradient Shifts**: Animated gradient backgrounds
- **Neon Pulse**: Pulsing glow effects
- **Float Animations**: Floating elements
- **Shimmer Effects**: Shimmering button backgrounds
- **Liquid Morph**: Morphing background shapes
- **Glitch Effect**: Text glitch on hover
- **Badge Glow**: Pulsing badge animations

### Transforms
- **3D Rotations**: Card tilting with perspective
- **Scale Effects**: Hover scale transformations
- **Translate**: Smooth position changes
- **Skew**: Subtle skew effects

### Filters
- **Backdrop Blur**: Glassmorphism effects
- **Drop Shadow**: Text and element shadows
- **Brightness/Saturation**: Dynamic color adjustments

### Gradients
- **Multi-layer Gradients**: Complex gradient combinations
- **Animated Gradients**: Shifting gradient positions
- **Radial Gradients**: Circular gradient effects
- **Linear Gradients**: Directional color transitions

## Interactive Features

### Mouse Interactions
- **Magnetic Buttons**: Buttons that follow mouse
- **Cursor Trails**: Canvas-based cursor following
- **Particle Attraction**: Particles attracted to mouse
- **Hover Effects**: 3D transforms on hover

### Scroll Interactions
- **Parallax Scrolling**: Different scroll speeds
- **Scroll Reveal**: Elements animate on scroll
- **Scroll Particles**: Particles generated on scroll

### Click Interactions
- **Confetti**: Particle explosions on click
- **Ripple Effects**: Expanding ripple animations
- **Node Selection**: Interactive tree node selection

## Performance Optimizations

### Canvas Optimization
- Efficient particle management
- RequestAnimationFrame for smooth animations
- Particle culling (removing off-screen particles)
- Connection distance limiting

### CSS Optimization
- Hardware-accelerated transforms
- Will-change hints for animations
- Efficient selectors
- Minimal repaints/reflows

### TypeScript Benefits
- Type safety prevents runtime errors
- Better IDE support
- Easier refactoring
- Compile-time optimizations

## Browser Compatibility

### Modern Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Features Used
- Canvas API
- CSS Grid & Flexbox
- CSS Custom Properties (Variables)
- Backdrop Filter
- CSS Animations & Transitions
- ES6+ JavaScript
- Intersection Observer API
- RequestAnimationFrame

## Customization Guide

### Adding New Canvas Effects

1. Create new TypeScript file in `src/ts/`
2. Export a class with initialization
3. Import in `index.ts`
4. Initialize in `DOMContentLoaded` handler

### Adding New CSS Animations

1. Define `@keyframes` in `assets/css/main.css`
2. Apply to elements using `animation` property
3. Use CSS variables for easy color changes

### Adding New Interactive Features

1. Create TypeScript module
2. Use event listeners for interactions
3. Update DOM or Canvas based on events
4. Ensure smooth performance with requestAnimationFrame

## Build Process

### Development
```bash
npm run watch    # Watch TypeScript files
npm run serve    # Serve with Jekyll
```

### Production
```bash
npm run build    # Build TypeScript and CSS
npm run build:all # Build everything including Jekyll
```

### GitHub Actions
Automatically runs on push to `main`:
1. Install dependencies
2. Build TypeScript
3. Build CSS
4. Build Jekyll site
5. Deploy to GitHub Pages

## File Structure

```
src/ts/
├── index.ts                 # Main entry
├── canvas-background.ts     # Background particles
├── enhanced-visualizer.ts   # Tree visualization
├── interactive-effects.ts   # Interactive features
├── advanced-effects.ts      # Advanced particles
├── typing-animation.ts      # Text animations
├── 3d-effects.ts            # 3D transforms
└── page-animations.ts       # Page animations

assets/
├── css/
│   └── main.css            # All styles
└── js/                     # Compiled JavaScript
    ├── *.js
    ├── *.js.map
    └── *.d.ts
```

## Tips for Maximum Jazzy-ness

1. **Performance**: Monitor FPS, optimize particle counts
2. **Colors**: Use vibrant gradients and neon effects
3. **Motion**: Add smooth transitions everywhere
4. **Interactivity**: Respond to all user actions
5. **Depth**: Use shadows, glows, and 3D transforms
6. **Animation**: Keep things moving subtly

## License

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.
