/**
 * Main entry point for enhanced visualizations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

import { EnhancedTreeVisualizer } from './enhanced-visualizer';
import { PageAnimations } from './page-animations';
import { CanvasBackground } from './canvas-background';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const visualizer = new EnhancedTreeVisualizer('tree-canvas');
        setInterval(() => {
            visualizer.simulateOperation();
        }, 3000);
    } catch (error) {
        console.error('Failed to initialize enhanced tree visualizer:', error);
    }

    new PageAnimations().init();

    const bgCanvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    if (bgCanvas) {
        new CanvasBackground('background-canvas');
    }
});
