/**
 * Particle System for Visual Effects
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
}
export declare class ParticleSystem {
    private particles;
    private ctx;
    constructor(ctx: CanvasRenderingContext2D);
    emit(x: number, y: number, color: string, count?: number): void;
    update(): void;
    draw(): void;
    clear(): void;
}
//# sourceMappingURL=particle-system.d.ts.map