/**
 * Particle System for Visual Effects
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export class ParticleSystem {
    constructor(ctx) {
        this.particles = [];
        this.ctx = ctx;
    }
    emit(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                color,
                size: 2 + Math.random() * 3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }
    update() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.vy += 0.1; // gravity
            particle.life -= 0.015;
            particle.rotation += particle.rotationSpeed;
            return particle.life > 0;
        });
    }
    draw() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    clear() {
        this.particles = [];
    }
}
//# sourceMappingURL=particle-system.js.map