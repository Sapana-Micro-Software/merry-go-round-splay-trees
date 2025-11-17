/**
 * Page Animations and Interactive Effects
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

export class PageAnimations {
    private observer: IntersectionObserver;
    private animatedElements: Set<Element> = new Set();

    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        this.animateElement(entry.target);
                        this.animatedElements.add(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
    }

    public init(): void {
        // Observe all animatable elements
        document.querySelectorAll('.project-card, .accordion-item, .feature-item').forEach(el => {
            this.observer.observe(el);
        });

        // Add scroll animations
        this.setupScrollAnimations();
        
        // Add parallax effects
        this.setupParallax();
        
        // Add cursor effects
        this.setupCursorEffects();
    }

    private animateElement(element: Element): void {
        element.classList.add('animate-in');
    }

    private setupScrollAnimations(): void {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const scrollDiff = currentScroll - lastScroll;
            
            // Update hero section based on scroll
            const hero = document.querySelector('.hero-section');
            if (hero) {
                const opacity = Math.max(0.3, 1 - currentScroll / 500);
                (hero as HTMLElement).style.opacity = opacity.toString();
            }
            
            lastScroll = currentScroll;
        });
    }

    private setupParallax(): void {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.project-card');
            
            parallaxElements.forEach((el, index) => {
                const speed = 0.1 + (index % 3) * 0.05;
                const yPos = -(scrolled * speed);
                (el as HTMLElement).style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    private setupCursorEffects(): void {
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

        // Add hover effects
        document.querySelectorAll('a, button, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new PageAnimations().init();
});
