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
//# sourceMappingURL=enhanced-visualizer.d.ts.map