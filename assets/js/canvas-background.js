/**
 * Advanced Animated Canvas Background with Wave Effects and Interactive Particles
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export class CanvasBackground {
    constructor(canvasId) {
        this.particles = [];
        this.waves = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        this.gradient = null;
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas)
            return;
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        this.initParticles();
        this.initWaves();
        this.setupMouseTracking();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initGradient();
    }
    initGradient() {
        this.gradient = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height));
        this.gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        this.gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.05)');
        this.gradient.addColorStop(1, 'rgba(240, 147, 251, 0.02)');
    }
    initParticles() {
        const count = Math.floor((this.canvas.width * this.canvas.height) / 12000);
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 1.5,
                opacity: Math.random() * 0.6 + 0.3,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulsePhase: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05
            });
        }
    }
    initWaves() {
        this.waves = [
            { amplitude: 30, frequency: 0.01, speed: 0.02, phase: 0, color: 'rgba(102, 126, 234, 0.15)' },
            { amplitude: 50, frequency: 0.008, speed: 0.015, phase: Math.PI / 2, color: 'rgba(118, 75, 162, 0.12)' },
            { amplitude: 40, frequency: 0.012, speed: 0.025, phase: Math.PI, color: 'rgba(240, 147, 251, 0.1)' }
        ];
    }
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            // Create interactive particles near mouse
            if (Math.random() > 0.95) {
                this.createMouseParticle(e.clientX, e.clientY);
            }
        });
    }
    createMouseParticle(x, y) {
        const colors = ['#667eea', '#764ba2', '#f093fb'];
        this.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 2 + 1,
            opacity: 0.8,
            color: colors[Math.floor(Math.random() * colors.length)],
            pulsePhase: 0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse attraction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const attraction = distance < 200 ? (200 - distance) / 200 * 0.01 : 0;
            particle.vx += (dx / distance) * attraction;
            particle.vy += (dy / distance) * attraction;
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            // Boundary bounce with damping
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -0.8;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -0.8;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            // Update rotation and pulse
            particle.rotation += particle.rotationSpeed;
            particle.pulsePhase += 0.05;
        });
    }
    drawWaves() {
        this.waves.forEach((wave, index) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = wave.color;
            this.ctx.lineWidth = 2;
            wave.phase += wave.speed;
            for (let x = 0; x < this.canvas.width; x += 2) {
                const y = this.canvas.height / 2 +
                    Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
                    Math.sin(x * wave.frequency * 0.5 + wave.phase * 1.5) * wave.amplitude * 0.5;
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                }
                else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        });
    }
    drawParticles() {
        // Draw connections first
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(other => {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.3;
                    const gradient = this.ctx.createLinearGradient(particle.x, particle.y, other.x, other.y);
                    gradient.addColorStop(0, particle.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`));
                    gradient.addColorStop(1, other.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`));
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }
            });
        });
        // Draw particles
        this.particles.forEach(particle => {
            const pulse = Math.sin(particle.pulsePhase) * 0.3 + 1;
            const size = particle.size * pulse;
            // Glow effect
            const glowGradient = this.ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size * 2);
            glowGradient.addColorStop(0, particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.opacity})`));
            glowGradient.addColorStop(1, particle.color.replace('rgb', 'rgba').replace(')', ', 0)'));
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            // Main particle
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            const particleGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            particleGradient.addColorStop(0, '#ffffff');
            particleGradient.addColorStop(0.5, particle.color);
            particleGradient.addColorStop(1, particle.color.replace('rgb', 'rgba').replace(')', ', 0.5)'));
            this.ctx.fillStyle = particleGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    draw() {
        this.time += 0.01;
        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw gradient overlay
        if (this.gradient) {
            this.ctx.fillStyle = this.gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        // Draw waves
        this.drawWaves();
        // Draw particles and connections
        this.drawParticles();
        // Draw mouse interaction effect
        if (this.mouseX > 0 && this.mouseY > 0) {
            const mouseGradient = this.ctx.createRadialGradient(this.mouseX, this.mouseY, 0, this.mouseX, this.mouseY, 150);
            mouseGradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
            mouseGradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
            this.ctx.fillStyle = mouseGradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 150, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    animate() {
        this.updateParticles();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
//# sourceMappingURL=canvas-background.js.map