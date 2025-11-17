/**
 * 3D Transform Effects and Perspective
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */
export class ThreeDEffects {
    constructor() {
        this.cards = [];
        this.init();
    }
    init() {
        this.cards = Array.from(document.querySelectorAll('.project-card'));
        this.setup3DEffects();
        this.setupTiltEffect();
    }
    setup3DEffects() {
        this.cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.perspective = '1000px';
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateZ(20px)
                `;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }
    setupTiltEffect() {
        const elements = document.querySelectorAll('.btn, .nav-list a');
        elements.forEach(el => {
            if (el instanceof HTMLElement) {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 20;
                    const rotateY = (centerX - x) / 20;
                    el.style.transform = `
                        perspective(500px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        scale(1.05)
                    `;
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = '';
                });
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ThreeDEffects();
});
//# sourceMappingURL=3d-effects.js.map