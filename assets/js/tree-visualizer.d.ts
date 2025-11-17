/**
 * Tree Visualizer - Interactive Canvas Visualization
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
declare class TreeVisualizer {
    private canvas;
    private ctx;
    private treeType;
    private nodes;
    private operations;
    private animationId;
    constructor(canvasId: string);
    private setupEventListeners;
    private updateButtons;
    private init;
    private generateSampleTree;
    private generateBTree;
    private generateSplayTree;
    private flattenTree;
    private layoutTree;
    private draw;
    private drawEdges;
    private drawNode;
    private animate;
    private updateStats;
    simulateOperation(): void;
    private animateSplay;
}
export default TreeVisualizer;
//# sourceMappingURL=tree-visualizer.d.ts.map