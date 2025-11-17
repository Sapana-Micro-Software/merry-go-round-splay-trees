/**
 * Main entry point for enhanced visualizations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

import { PageAnimations } from './page-animations';
import { CanvasBackground } from './canvas-background';

// Enhanced visualizer initializes itself
import './enhanced-visualizer';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize page animations
    new PageAnimations().init();

    // Initialize background canvas
    const bgCanvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    if (bgCanvas) {
        new CanvasBackground('background-canvas');
    }
});
