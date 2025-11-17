/**
 * Interactive Effects and Enhancements
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export class InteractiveEffects {
    static init() {
        this.addRippleEffects();
        this.addTypingEffect();
        this.addScrollReveal();
        this.addConfettiOnClick();
    }
    static addRippleEffects() {
        document.querySelectorAll('.btn, .project-card, .accordion-header').forEach(element => {
            element.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
    static addTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent || '';
            heroTitle.textContent = '';
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                }
                else {
                    clearInterval(typeInterval);
                }
            }, 50);
        }
    }
    static addScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.section, .project-card').forEach(el => {
            observer.observe(el);
        });
    }
    static addConfettiOnClick() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.createConfetti(btn);
            });
        });
    }
    static createConfetti(element) {
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
                }
                else {
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
//# sourceMappingURL=interactive-effects.js.map