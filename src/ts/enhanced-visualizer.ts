/**
 * Enhanced Tree Visualizer with Advanced Canvas Animations
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

interface TreeNode {
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
    private gradientCache: Map<string, CanvasGradient> = new Map();

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas element with id ${canvasId} not found`);
        }
        this.ctx = this.canvas.getContext('2d')!;
        this.setupEventListeners();
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
            this.init();
        });

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredNode = null;
        });
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredNode = this.findNodeAt(x, y);
    }

    private handleClick(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const node = this.findNodeAt(x, y);
        if (node) {
            this.selectedNode = node;
            this.createParticles(node.x, node.y, node.color);
            if (this.treeType === 'splay') {
                this.animateSplay(node);
            }
        }
    }

    private findNodeAt(x: number, y: number): TreeNode | null {
        for (const node of this.nodes) {
            const dx = x - node.x;
            const dy = y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 35) {
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
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                accessCount: 0,
                isLeaf: false,
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
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
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

        const nodeHeight = 80;
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
        this.time += 0.02;
        
        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        this.drawBackground();
        
        // Update particles
        this.updateParticles();
        
        // Draw edges with glow
        this.drawEdges();
        
        // Draw nodes
        this.nodes.forEach(node => {
            this.updateNodePosition(node);
            this.drawNode(node);
        });
        
        // Draw particles
        this.drawParticles();
        
        // Draw tooltip
        if (this.hoveredNode) {
            this.drawTooltip(this.hoveredNode);
        }
    }

    private drawBackground(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.05)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.05)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
                const gradient = this.ctx.createLinearGradient(
                    node.x, node.y, child.x, child.y
                );
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
        const scale = isHovered ? 1.2 : (isSelected ? 1.15 : 1.0);
        const pulse = Math.sin(node.pulsePhase) * 3;
        const finalRadius = radius * scale + pulse;

        // Update color based on access count
        if (this.treeType === 'splay' && node.accessCount > 0) {
            const intensity = Math.min(1, 0.4 + node.accessCount / 20);
            node.color = `rgba(102, 126, 234, ${intensity})`;
        } else if (node.isLeaf) {
            node.color = '#f093fb';
        } else {
            node.color = '#667eea';
        }

        // Draw glow effect
        if (isHovered || isSelected) {
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, finalRadius + 10
            );
            glowGradient.addColorStop(0, node.color);
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, finalRadius + 10, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw node circle with gradient
        const nodeGradient = this.ctx.createRadialGradient(
            node.x - 10, node.y - 10, 0,
            node.x, node.y, finalRadius
        );
        nodeGradient.addColorStop(0, this.lightenColor(node.color, 0.3));
        nodeGradient.addColorStop(1, node.color);
        
        this.ctx.fillStyle = nodeGradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, finalRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw border
        this.ctx.strokeStyle = isHovered ? '#fff' : '#333';
        this.ctx.lineWidth = isHovered ? 3 : 2;
        this.ctx.stroke();

        // Draw key
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${14 * scale}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillText(node.key.toString(), node.x, node.y);
        this.ctx.shadowBlur = 0;

        // Draw access count
        if (this.treeType === 'splay' && node.accessCount > 0) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText(`#${node.accessCount}`, node.x, node.y + 35);
        }
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
                x,
                y,
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
            particle.vy += 0.1; // gravity
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
        const text = `Key: ${node.key}\nAccess: ${node.accessCount}\nType: ${node.isLeaf ? 'Leaf' : 'Internal'}`;
        const lines = text.split('\n');
        const padding = 10;
        const lineHeight = 18;
        const width = 150;
        const height = lines.length * lineHeight + padding * 2;

        const x = node.x + 50;
        const y = node.y - height / 2;

        // Draw tooltip background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, width, height);

        // Draw border
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Draw text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        lines.forEach((line, i) => {
            this.ctx.fillText(line, x + padding, y + padding + (i + 1) * lineHeight);
        });
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
        
        // Simulate operations periodically
        setInterval(() => {
            visualizer.simulateOperation();
        }, 3000);
    } catch (error) {
        console.error('Failed to initialize enhanced tree visualizer:', error);
        // Fallback to basic visualizer
        try {
            const basicVisualizer = new (window as any).TreeVisualizer('tree-canvas');
        } catch (e) {
            console.error('Failed to initialize basic visualizer:', e);
        }
    }
});

export default EnhancedTreeVisualizer;
