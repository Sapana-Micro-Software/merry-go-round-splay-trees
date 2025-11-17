/**
 * Page Animations and Interactive Effects
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export class PageAnimations {
    constructor() {
        this.animatedElements = new Set();
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, { threshold: 0.1 });
    }
    init() {
        document.querySelectorAll('.project-card, .accordion-item, .feature-item').forEach(el => {
            this.observer.observe(el);
        });
        this.setupScrollAnimations();
        this.setupParallax();
        this.setupCursorEffects();
    }
    animateElement(element) {
        element.classList.add('animate-in');
    }
    setupScrollAnimations() {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const hero = document.querySelector('.hero-section');
            if (hero) {
                const opacity = Math.max(0.3, 1 - currentScroll / 500);
                hero.style.opacity = opacity.toString();
            }
            lastScroll = currentScroll;
        });
    }
    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.project-card');
            parallaxElements.forEach((el, index) => {
                const speed = 0.1 + (index % 3) * 0.05;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    setupCursorEffects() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
        document.querySelectorAll('a, button, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }
}
//# sourceMappingURL=page-animations.js.map