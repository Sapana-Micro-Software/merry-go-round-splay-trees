/**
 * Enhanced Tree Visualizer with Advanced Canvas Animations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export interface TreeNode {
    key: number;
    value: string;
    children: TreeNode[];
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    accessCount: number;
    isLeaf: boolean;
    color: string;
    pulsePhase: number;
}
export declare class EnhancedTreeVisualizer {
    private canvas;
    private ctx;
    private treeType;
    private nodes;
    private particles;
    private operations;
    private animationId;
    private hoveredNode;
    private selectedNode;
    private time;
    constructor(canvasId: string);
    private setupEventListeners;
    private handleMouseMove;
    private handleClick;
    private findNodeAt;
    private updateButtons;
    private init;
    private generateSampleTree;
    private generateBTree;
    private generateSplayTree;
    private flattenTree;
    private layoutTree;
    private draw;
    private drawBackground;
    private updateNodePosition;
    private drawEdges;
    private drawNode;
    private lightenColor;
    private createParticles;
    private updateParticles;
    private drawParticles;
    private drawTooltip;
    private animate;
    private updateStats;
    simulateOperation(): void;
    private animateSplay;
}
//# sourceMappingURL=enhanced-visualizer.d.ts.map