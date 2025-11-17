/**
 * Advanced Visual Effects and Animations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export class AdvancedEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        this.init();
    }
    init() {
        this.createFloatingCanvas();
        this.setupMouseTracking();
        this.setupScrollEffects();
        this.addGlitchEffect();
        this.addParallaxScrolling();
        this.animate();
    }
    createFloatingCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'floating-effects-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            // Create particles at mouse position
            if (Math.random() > 0.7) {
                this.createMouseParticle(e.clientX, e.clientY);
            }
        });
    }
    createMouseParticle(x, y) {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
        this.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    setupScrollEffects() {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const scrollDelta = currentScroll - lastScroll;
            // Create scroll particles
            if (Math.abs(scrollDelta) > 5) {
                for (let i = 0; i < 3; i++) {
                    this.createScrollParticle();
                }
            }
            lastScroll = currentScroll;
        });
    }
    createScrollParticle() {
        const colors = ['#667eea', '#764ba2'];
        this.particles.push({
            x: Math.random() * window.innerWidth,
            y: window.pageYOffset + Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.abs(Math.random() * 3),
            size: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05
        });
    }
    addGlitchEffect() {
        const titles = document.querySelectorAll('h1, h2, .hero-title');
        titles.forEach(title => {
            if (title instanceof HTMLElement) {
                title.addEventListener('mouseenter', () => {
                    this.triggerGlitch(title);
                });
            }
        });
    }
    triggerGlitch(element) {
        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let iterations = 0;
        const glitchInterval = setInterval(() => {
            if (iterations > 10) {
                element.textContent = originalText;
                clearInterval(glitchInterval);
                return;
            }
            const glitched = originalText?.split('').map((char, i) => {
                if (Math.random() > 0.7 && char !== ' ') {
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }
                return char;
            }).join('');
            element.textContent = glitched || originalText || '';
            iterations++;
        }, 50);
    }
    addParallaxScrolling() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.project-card, .section-title');
            parallaxElements.forEach((el, index) => {
                if (el instanceof HTMLElement) {
                    const speed = 0.05 + (index % 3) * 0.02;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });
        });
    }
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            // Mouse attraction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const attraction = distance < 150 ? (150 - distance) / 150 * 0.02 : 0;
            particle.vx += (dx / distance) * attraction;
            particle.vy += (dy / distance) * attraction;
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            // Damping
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            // Update rotation
            particle.rotation += particle.rotationSpeed;
            // Fade out
            particle.life -= 0.015;
            return particle.life > 0 &&
                particle.x > -50 && particle.x < window.innerWidth + 50 &&
                particle.y > -50 && particle.y < window.innerHeight + 50;
        });
    }
    drawParticles() {
        if (!this.ctx || !this.canvas)
            return;
        // Clear with fade
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            // Glow effect
            const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 3);
            glowGradient.addColorStop(0, particle.color);
            glowGradient.addColorStop(0.5, particle.color + '80');
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            // Main particle
            const particleGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            particleGradient.addColorStop(0, '#ffffff');
            particleGradient.addColorStop(1, particle.color);
            this.ctx.fillStyle = particleGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        // Draw connections
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(other => {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    const opacity = (1 - distance / 100) * 0.3 * particle.life * other.life;
                    const gradient = this.ctx.createLinearGradient(particle.x, particle.y, other.x, other.y);
                    gradient.addColorStop(0, particle.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`));
                    gradient.addColorStop(1, other.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`));
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            });
        });
    }
    animate() {
        this.time += 0.01;
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}
// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedEffects();
});
//# sourceMappingURL=advanced-effects.js.map