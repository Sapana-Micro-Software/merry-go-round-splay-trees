/**
 * Interactive Effects and Enhancements
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

export class InteractiveEffects {
    public static init(): void {
        this.addRippleEffects();
        this.addTypingEffect();
        this.addScrollReveal();
        this.addConfettiOnClick();
        this.addMagneticEffect();
        this.addCursorTrail();
    }

    private static addRippleEffects(): void {
        document.querySelectorAll('.btn, .project-card, .accordion-header').forEach(element => {
            if (element instanceof HTMLElement) {
                element.addEventListener('click', (e: Event) => {
                    const mouseEvent = e as MouseEvent;
                    const ripple = document.createElement('span');
                    const rect = element.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = mouseEvent.clientX - rect.left - size / 2;
                    const y = mouseEvent.clientY - rect.top - size / 2;

                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.classList.add('ripple');

                    element.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            }
        });
    }

    private static addTypingEffect(): void {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent || '';
            heroTitle.textContent = '';
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 50);
        }
    }

    private static addScrollReveal(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section, .project-card').forEach(el => {
            if (el instanceof HTMLElement) {
                observer.observe(el);
            }
        });
    }

    private static addConfettiOnClick(): void {
        document.querySelectorAll('.btn, .viz-btn').forEach(btn => {
            if (btn instanceof HTMLElement) {
                btn.addEventListener('click', () => {
                    this.createConfetti(btn);
                });
            }
        });
    }

    public static addMagneticEffect(): void {
        document.querySelectorAll('.btn, .nav-list a, .project-card').forEach(element => {
            if (element instanceof HTMLElement) {
                element.addEventListener('mousemove', (e: MouseEvent) => {
                    const rect = element.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    const moveX = x * 0.15;
                    const moveY = y * 0.15;
                    
                    element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                });
                
                element.addEventListener('mouseleave', () => {
                    element.style.transform = '';
                });
            }
        });
    }

    public static addCursorTrail(): void {
        const trail: Array<{ x: number; y: number; life: number }> = [];
        const maxTrailLength = 20;
        
        document.addEventListener('mousemove', (e: MouseEvent) => {
            trail.push({ x: e.clientX, y: e.clientY, life: 1.0 });
            if (trail.length > maxTrailLength) trail.shift();
        });
        
        const canvas = document.createElement('canvas');
        canvas.id = 'cursor-trail-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        const animate = () => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            trail.forEach((point, i) => {
                point.life -= 0.05;
                const size = 5 * point.life;
                const alpha = point.life * 0.5;
                
                const gradient = ctx.createRadialGradient(
                    point.x, point.y, 0,
                    point.x, point.y, size
                );
                gradient.addColorStop(0, `rgba(102, 126, 234, ${alpha})`);
                gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Remove dead trail points
            while (trail.length > 0 && trail[0].life <= 0) {
                trail.shift();
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    private static createConfetti(element: HTMLElement): void {
        const rect = element.getBoundingClientRect();
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = rect.left + rect.width / 2 + 'px';
            confetti.style.top = rect.top + 'px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 5 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            document.body.appendChild(confetti);
            
            let x = rect.left + rect.width / 2;
            let y = rect.top;
            let opacity = 1;
            
            const animate = () => {
                x += vx;
                y += vy + 2; // gravity
                opacity -= 0.02;
                
                confetti.style.left = x + 'px';
                confetti.style.top = y + 'px';
                confetti.style.opacity = opacity.toString();
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };
            
            animate();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    InteractiveEffects.init();
});
