/**
 * Main entry point for enhanced visualizations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
import { EnhancedTreeVisualizer } from './enhanced-visualizer';
import { PageAnimations } from './page-animations';
import { CanvasBackground } from './canvas-background';
document.addEventListener('DOMContentLoaded', () => {
    // Initialize enhanced tree visualizer
    try {
        const visualizer = new EnhancedTreeVisualizer('tree-canvas');
        // Simulate operations periodically
        setInterval(() => {
            visualizer.simulateOperation();
        }, 3000);
    }
    catch (error) {
        console.error('Failed to initialize enhanced tree visualizer:', error);
    }
    // Initialize page animations
    new PageAnimations().init();
    // Initialize background canvas if exists
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        new CanvasBackground('background-canvas');
    }
});
//# sourceMappingURL=index.js.map