/**
 * Enhanced Tree Visualizer with Advanced Canvas Animations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

export interface TreeNode {
    key: number;
    value: string;
    children: TreeNode[];
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    accessCount: number;
    isLeaf: boolean;
    color: string;
    pulsePhase: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

class EnhancedTreeVisualizer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private treeType: 'btree' | 'splay' = 'btree';
    private nodes: TreeNode[] = [];
    private particles: Particle[] = [];
    private operations: number = 0;
    private animationId: number | null = null;
    private hoveredNode: TreeNode | null = null;
    private selectedNode: TreeNode | null = null;
    private time: number = 0;
    private zoom: number = 1;
    private panX: number = 0;
    private panY: number = 0;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private dragStartPanX: number = 0;
    private dragStartPanY: number = 0;
    private animationSpeed: number = 1;
    private trail: Array<{ x: number; y: number; life: number }> = [];

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas element with id ${canvasId} not found`);
        }
        this.ctx = this.canvas.getContext('2d', { alpha: true })!;
        this.setupEventListeners();
        this.setupControls();
        this.init();
    }

    private setupEventListeners(): void {
        const btreeBtn = document.getElementById('btn-btree');
        const splayBtn = document.getElementById('btn-splay');
        const resetBtn = document.getElementById('btn-reset');

        btreeBtn?.addEventListener('click', () => {
            this.treeType = 'btree';
            this.updateButtons('btree');
            this.init();
        });

        splayBtn?.addEventListener('click', () => {
            this.treeType = 'splay';
            this.updateButtons('splay');
            this.init();
        });

        resetBtn?.addEventListener('click', () => {
            this.zoom = 1;
            this.panX = 0;
            this.panY = 0;
            this.init();
        });

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredNode = null;
            this.isDragging = false;
        });

        // Drag to pan
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !this.hoveredNode) {
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.dragStartPanX = this.panX;
                this.dragStartPanY = this.panY;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.panX = this.dragStartPanX + (e.clientX - this.dragStartX) / this.zoom;
                this.panY = this.dragStartPanY + (e.clientY - this.dragStartY) / this.zoom;
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Zoom with wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.5, Math.min(3, this.zoom * zoomFactor));
            
            const zoomChange = newZoom / this.zoom;
            this.panX = mouseX - (mouseX - this.panX) * zoomChange;
            this.panY = mouseY - (mouseY - this.panY) * zoomChange;
            this.zoom = newZoom;
        });
    }

    private setupControls(): void {
        // Create control panel
        const controls = document.createElement('div');
        controls.id = 'tree-controls';
        controls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-family: sans-serif;
        `;
        
        controls.innerHTML = `
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Animation Speed:</label>
                <input type="range" id="speed-control" min="0.1" max="3" step="0.1" value="1" 
                    style="width: 150px;">
                <span id="speed-value" style="margin-left: 10px; font-size: 12px; color: #667eea;">1.0x</span>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Zoom:</label>
                <input type="range" id="zoom-control" min="0.5" max="3" step="0.1" value="1" 
                    style="width: 150px;">
                <span id="zoom-value" style="margin-left: 10px; font-size: 12px; color: #667eea;">100%</span>
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 10px;">
                <div>🖱️ Drag to pan</div>
                <div>🔍 Scroll to zoom</div>
            </div>
        `;
        
        const vizContainer = this.canvas.parentElement;
        if (vizContainer) {
            vizContainer.style.position = 'relative';
            vizContainer.appendChild(controls);
        }

        const speedControl = document.getElementById('speed-control') as HTMLInputElement;
        const zoomControl = document.getElementById('zoom-control') as HTMLInputElement;
        
        speedControl?.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat((e.target as HTMLInputElement).value);
            const speedValue = document.getElementById('speed-value');
            if (speedValue) speedValue.textContent = `${this.animationSpeed.toFixed(1)}x`;
        });

        zoomControl?.addEventListener('input', (e) => {
            this.zoom = parseFloat((e.target as HTMLInputElement).value);
            const zoomValue = document.getElementById('zoom-value');
            if (zoomValue) zoomValue.textContent = `${Math.round(this.zoom * 100)}%`;
        });
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        this.hoveredNode = this.findNodeAt(x, y);
        
        // Add to trail
        if (this.hoveredNode) {
            this.trail.push({ x: this.hoveredNode.x, y: this.hoveredNode.y, life: 1.0 });
            if (this.trail.length > 20) this.trail.shift();
        }
    }

    private handleClick(e: MouseEvent): void {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        const node = this.findNodeAt(x, y);
        if (node) {
            this.selectedNode = node;
            this.createParticles(node.x, node.y, node.color);
            if (this.treeType === 'splay') {
                this.animateSplay(node);
            }
            // Add visual feedback
            this.trail = [];
            for (let i = 0; i < 30; i++) {
                this.trail.push({ 
                    x: node.x + (Math.random() - 0.5) * 50, 
                    y: node.y + (Math.random() - 0.5) * 50, 
                    life: 1.0 
                });
            }
        }
    }

    private findNodeAt(x: number, y: number): TreeNode | null {
        for (const node of this.nodes) {
            const dx = x - node.x;
            const dy = y - node.y;
            if (Math.sqrt(dx * dx + dy * dy) <= 35) {
                return node;
            }
        }
        return null;
    }

    private updateButtons(active: string): void {
        document.querySelectorAll('.viz-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(`btn-${active}`);
        activeBtn?.classList.add('active');
    }

    private init(): void {
        this.nodes = [];
        this.particles = [];
        this.operations = 0;
        this.selectedNode = null;
        this.generateSampleTree();
        this.updateStats();
        this.animate();
    }

    private generateSampleTree(): void {
        const root: TreeNode = {
            key: 50,
            value: 'Root',
            children: [],
            x: this.canvas.width / 2,
            y: 50,
            targetX: this.canvas.width / 2,
            targetY: 50,
            accessCount: 0,
            isLeaf: false,
            color: '#667eea',
            pulsePhase: Math.random() * Math.PI * 2
        };

        if (this.treeType === 'btree') {
            this.generateBTree(root, 3);
        } else {
            this.generateSplayTree(root, 2);
        }

        this.nodes = this.flattenTree(root);
        this.layoutTree();
    }

    private generateBTree(node: TreeNode, depth: number): void {
        if (depth === 0) {
            node.isLeaf = true;
            return;
        }
        const numChildren = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numChildren; i++) {
            const child: TreeNode = {
                key: node.key + (i - numChildren / 2) * 20 + Math.floor(Math.random() * 10),
                value: `Node ${i}`,
                children: [],
                x: 0, y: 0, targetX: 0, targetY: 0,
                accessCount: 0, isLeaf: false,
                color: '#667eea',
                pulsePhase: Math.random() * Math.PI * 2
            };
            this.generateBTree(child, depth - 1);
            node.children.push(child);
        }
    }

    private generateSplayTree(node: TreeNode, depth: number): void {
        if (depth === 0) {
            node.isLeaf = true;
            node.accessCount = Math.floor(Math.random() * 10);
            return;
        }
        const numChildren = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numChildren; i++) {
            const child: TreeNode = {
                key: node.key + (i - numChildren / 2) * 30 + Math.floor(Math.random() * 15),
                value: `Node ${i}`,
                children: [],
                x: 0, y: 0, targetX: 0, targetY: 0,
                accessCount: Math.floor(Math.random() * 10),
                isLeaf: false,
                color: '#667eea',
                pulsePhase: Math.random() * Math.PI * 2
            };
            this.generateSplayTree(child, depth - 1);
            node.children.push(child);
        }
        node.accessCount = Math.floor(Math.random() * 10);
    }

    private flattenTree(node: TreeNode): TreeNode[] {
        const result: TreeNode[] = [node];
        for (const child of node.children) {
            result.push(...this.flattenTree(child));
        }
        return result;
    }

    private layoutTree(): void {
        const levels: TreeNode[][] = [];
        const queue: { node: TreeNode; level: number }[] = [{ node: this.nodes[0], level: 0 }];

        while (queue.length > 0) {
            const { node, level } = queue.shift()!;
            if (!levels[level]) levels[level] = [];
            levels[level].push(node);
            for (const child of node.children) {
                queue.push({ node: child, level: level + 1 });
            }
        }

        const horizontalSpacing = 150;
        const verticalSpacing = 120;

        levels.forEach((levelNodes, level) => {
            const levelWidth = levelNodes.length * horizontalSpacing;
            const startX = (this.canvas.width - levelWidth) / 2 + horizontalSpacing / 2;
            const y = 50 + level * verticalSpacing;

            levelNodes.forEach((node, index) => {
                node.targetX = startX + index * horizontalSpacing;
                node.targetY = y;
                node.x = node.targetX;
                node.y = node.targetY;
            });
        });
    }

    private draw(): void {
        this.time += 0.02 * this.animationSpeed;
        
        // Clear with fade
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for transformations
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);
        
        this.drawBackground();
        this.updateParticles();
        this.drawTrail();
        this.drawEdges();
        this.nodes.forEach(node => {
            this.updateNodePosition(node);
            this.drawNode(node);
        });
        this.drawParticles();
        
        // Restore context
        this.ctx.restore();
        
        if (this.hoveredNode) {
            this.drawTooltip(this.hoveredNode);
        }
    }

    private drawBackground(): void {
        // Animated gradient background
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) * 0.8;
        
        const gradient = this.ctx.createRadialGradient(
            centerX + Math.sin(this.time) * 100,
            centerY + Math.cos(this.time) * 100,
            0,
            centerX,
            centerY,
            radius
        );
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.08)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.05)');
        gradient.addColorStop(1, 'rgba(240, 147, 251, 0.02)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grid pattern
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.05)';
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    private drawTrail(): void {
        this.trail = this.trail.filter(point => {
            point.life -= 0.05;
            return point.life > 0;
        });
        
        this.trail.forEach((point, i) => {
            const alpha = point.life * 0.5;
            const size = 3 * point.life;
            const gradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, size
            );
            gradient.addColorStop(0, `rgba(102, 126, 234, ${alpha})`);
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    private updateNodePosition(node: TreeNode): void {
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        node.x += dx * 0.1;
        node.y += dy * 0.1;
        node.pulsePhase += 0.05;
    }

    private drawEdges(): void {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(102, 126, 234, 0.3)';
        this.nodes.forEach(node => {
            node.children.forEach(child => {
                const gradient = this.ctx.createLinearGradient(node.x, node.y, child.x, child.y);
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)');
                gradient.addColorStop(1, 'rgba(118, 75, 162, 0.6)');
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, node.y + 25);
                this.ctx.lineTo(child.x, child.y - 25);
                this.ctx.stroke();
            });
        });
        this.ctx.shadowBlur = 0;
    }

    private drawNode(node: TreeNode): void {
        const radius = 30;
        const isHovered = this.hoveredNode === node;
        const isSelected = this.selectedNode === node;
        const scale = isHovered ? 1.3 : (isSelected ? 1.2 : 1.0);
        const pulse = Math.sin(node.pulsePhase + this.time * 2) * 4;
        const finalRadius = radius * scale + pulse;

        // Dynamic color based on state
        if (this.treeType === 'splay' && node.accessCount > 0) {
            const intensity = Math.min(1, 0.4 + node.accessCount / 20);
            node.color = `rgba(102, 126, 234, ${intensity})`;
        } else if (node.isLeaf) {
            node.color = '#f093fb';
        } else {
            node.color = '#667eea';
        }

        // Enhanced glow effect
        if (isHovered || isSelected) {
            const glowRadius = finalRadius + 20;
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0, node.x, node.y, glowRadius
            );
            glowGradient.addColorStop(0, node.color.replace('rgb', 'rgba').replace(')', ', 0.6)'));
            glowGradient.addColorStop(0.5, node.color.replace('rgb', 'rgba').replace(')', ', 0.3)'));
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Outer ring animation
        if (isSelected) {
            const ringRadius = finalRadius + 15 + Math.sin(this.time * 3) * 5;
            this.ctx.strokeStyle = node.color.replace('rgb', 'rgba').replace(')', ', 0.4)');
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Main node gradient
        const nodeGradient = this.ctx.createRadialGradient(
            node.x - 15, node.y - 15, 0, node.x, node.y, finalRadius
        );
        nodeGradient.addColorStop(0, '#ffffff');
        nodeGradient.addColorStop(0.3, this.lightenColor(node.color, 0.4));
        nodeGradient.addColorStop(0.7, node.color);
        nodeGradient.addColorStop(1, this.darkenColor(node.color, 0.2));
        
        this.ctx.fillStyle = nodeGradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, finalRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Enhanced border
        const borderGradient = this.ctx.createLinearGradient(
            node.x - finalRadius, node.y - finalRadius,
            node.x + finalRadius, node.y + finalRadius
        );
        borderGradient.addColorStop(0, isHovered ? '#fff' : '#333');
        borderGradient.addColorStop(1, isHovered ? '#667eea' : '#666');
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = isHovered ? 4 : 2.5;
        this.ctx.stroke();

        // Text with shadow
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${Math.floor(14 * scale)}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillText(node.key.toString(), node.x, node.y);
        this.ctx.shadowBlur = 0;

        // Access count badge
        if (this.treeType === 'splay' && node.accessCount > 0) {
            const badgeRadius = 12;
            this.ctx.fillStyle = 'rgba(118, 75, 162, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(node.x + finalRadius - 8, node.y - finalRadius + 8, badgeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 9px sans-serif';
            this.ctx.fillText(node.accessCount.toString(), node.x + finalRadius - 8, node.y - finalRadius + 8);
        }
    }

    private darkenColor(color: string, amount: number): string {
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
                const r = Math.max(0, parseInt(match[1]) - amount * 255);
                const g = Math.max(0, parseInt(match[2]) - amount * 255);
                const b = Math.max(0, parseInt(match[3]) - amount * 255);
                const a = match[4] || '1';
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
        return color;
    }

    private lightenColor(color: string, amount: number): string {
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
                const r = Math.min(255, parseInt(match[1]) + amount * 255);
                const g = Math.min(255, parseInt(match[2]) + amount * 255);
                const b = Math.min(255, parseInt(match[3]) + amount * 255);
                const a = match[4] || '1';
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
        return color;
    }

    private createParticles(x: number, y: number, color: string): void {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color: color
            });
        }
    }

    private updateParticles(): void {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1;
            return particle.life > 0;
        });
    }

    private drawParticles(): void {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }

    private drawTooltip(node: TreeNode): void {
        // Convert canvas coordinates to screen coordinates
        const screenX = node.x * this.zoom + this.panX;
        const screenY = node.y * this.zoom + this.panY;
        
        const text = `Key: ${node.key}\nAccess: ${node.accessCount}\nType: ${node.isLeaf ? 'Leaf' : 'Internal'}`;
        const lines = text.split('\n');
        const padding = 12;
        const lineHeight = 20;
        const width = 180;
        const height = lines.length * lineHeight + padding * 2;
        let x = screenX + 60;
        let y = screenY - height / 2;
        
        // Keep tooltip on screen
        if (x + width > this.canvas.width) x = screenX - width - 10;
        if (y + height > this.canvas.height) y = this.canvas.height - height - 10;
        if (y < 0) y = 10;

        // Glassmorphism background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(x, y, width, height);
        
        // Border with gradient
        const borderGradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        borderGradient.addColorStop(0, '#667eea');
        borderGradient.addColorStop(1, '#764ba2');
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Shadow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 5;
        
        // Text
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 13px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        lines.forEach((line, i) => {
            const parts = line.split(':');
            if (parts.length === 2) {
                this.ctx.fillStyle = '#667eea';
                this.ctx.fillText(parts[0] + ':', x + padding, y + padding + i * lineHeight);
                this.ctx.fillStyle = '#333';
                this.ctx.fillText(parts[1], x + padding + 80, y + padding + i * lineHeight);
            } else {
                this.ctx.fillText(line, x + padding, y + padding + i * lineHeight);
            }
        });
        this.ctx.shadowBlur = 0;
    }

    private animate(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        const animate = () => {
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    private updateStats(): void {
        const height = Math.max(...this.nodes.map(n => n.y)) / 120;
        const nodesEl = document.getElementById('stat-nodes');
        const heightEl = document.getElementById('stat-height');
        const opsEl = document.getElementById('stat-ops');
        if (nodesEl) nodesEl.textContent = this.nodes.length.toString();
        if (heightEl) heightEl.textContent = Math.ceil(height).toString();
        if (opsEl) opsEl.textContent = this.operations.toString();
    }

    public simulateOperation(): void {
        this.operations++;
        if (this.treeType === 'splay' && this.nodes.length > 1) {
            const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            if (randomNode !== this.nodes[0]) {
                this.animateSplay(randomNode);
            }
        }
        this.updateStats();
    }

    private animateSplay(node: TreeNode): void {
        const startX = node.x;
        const startY = node.y;
        const endX = this.canvas.width / 2;
        const endY = 50;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            node.x = startX + (endX - startX) * ease;
            node.y = startY + (endY - startY) * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                const root = this.nodes[0];
                [root.x, root.y, root.targetX, root.targetY] = 
                    [node.x, node.y, node.targetX, node.targetY];
                [node.x, node.y, node.targetX, node.targetY] = 
                    [endX, endY, endX, endY];
                this.createParticles(node.x, node.y, node.color);
            }
        };
        animate();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const visualizer = new EnhancedTreeVisualizer('tree-canvas');
        setInterval(() => {
            visualizer.simulateOperation();
        }, 3000);
    } catch (error) {
        console.error('Failed to initialize enhanced tree visualizer:', error);
    }
});
