/**
 * Animated Canvas Background
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export declare class CanvasBackground {
    private canvas;
    private ctx;
    private particles;
    private animationId;
    constructor(canvasId: string);
    private resize;
    private initParticles;
    private updateParticles;
    private drawParticles;
    private animate;
    destroy(): void;
}
//# sourceMappingURL=canvas-background.d.ts.map