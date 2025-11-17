/**
 * Advanced Animated Canvas Background with Wave Effects and Interactive Particles
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export declare class CanvasBackground {
    private canvas;
    private ctx;
    private particles;
    private waves;
    private animationId;
    private mouseX;
    private mouseY;
    private time;
    private gradient;
    constructor(canvasId: string);
    private resize;
    private initGradient;
    private initParticles;
    private initWaves;
    private setupMouseTracking;
    private createMouseParticle;
    private updateParticles;
    private drawWaves;
    private drawParticles;
    private draw;
    private animate;
    destroy(): void;
}
//# sourceMappingURL=canvas-background.d.ts.map