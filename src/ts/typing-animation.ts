/**
 * Advanced Typing Animation Effects
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

export class TypingAnimation {
    private elements: HTMLElement[] = [];

    constructor() {
        this.init();
    }

    private init(): void {
        const elements = document.querySelectorAll('.hero-title, .section-title, h1, h2');
        elements.forEach(el => {
            if (el instanceof HTMLElement) {
                this.elements.push(el);
            }
        });
        
        this.observeElements();
    }

    private observeElements(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target instanceof HTMLElement) {
                    this.animateText(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.elements.forEach(el => observer.observe(el));
    }

    private animateText(element: HTMLElement): void {
        const originalText = element.textContent || '';
        const words = originalText.split(' ');
        element.textContent = '';
        
        words.forEach((word, wordIndex) => {
            setTimeout(() => {
                word.split('').forEach((char, charIndex) => {
                    setTimeout(() => {
                        element.textContent += char;
                        this.addGlowEffect(element);
                    }, charIndex * 50);
                });
                
                if (wordIndex < words.length - 1) {
                    setTimeout(() => {
                        element.textContent += ' ';
                    }, word.length * 50);
                }
            }, wordIndex * 200);
        });
    }

    private addGlowEffect(element: HTMLElement): void {
        element.style.textShadow = `
            0 0 10px rgba(102, 126, 234, 0.8),
            0 0 20px rgba(102, 126, 234, 0.6),
            0 0 30px rgba(102, 126, 234, 0.4)
        `;
        
        setTimeout(() => {
            element.style.textShadow = '';
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TypingAnimation();
});
