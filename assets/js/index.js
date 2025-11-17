/**
 * Main entry point for enhanced visualizations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
import { PageAnimations } from './page-animations';
import { CanvasBackground } from './canvas-background';
import { AdvancedEffects } from './advanced-effects';
import { TypingAnimation } from './typing-animation';
import { ThreeDEffects } from './3d-effects';
import './interactive-effects';
// Enhanced visualizer initializes itself
import './enhanced-visualizer';
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page animations
    new PageAnimations().init();
    // Initialize background canvas
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        new CanvasBackground('background-canvas');
    }
    // Initialize advanced effects
    new AdvancedEffects();
    new TypingAnimation();
    new ThreeDEffects();
});
//# sourceMappingURL=index.js.map