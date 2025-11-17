/**
 * Tree Visualizer - Interactive Canvas Visualization
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

interface TreeNode {
    key: number;
    value: string;
    children: TreeNode[];
    x: number;
    y: number;
    accessCount?: number;
    isLeaf?: boolean;
}

class TreeVisualizer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private treeType: 'btree' | 'splay' = 'btree';
    private nodes: TreeNode[] = [];
    private operations: number = 0;
    private animationId: number | null = null;

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
        this.operations = 0;
        this.generateSampleTree();
        this.updateStats();
        this.animate();
    }

    private generateSampleTree(): void {
        // Generate a sample tree structure
        const root: TreeNode = {
            key: 50,
            value: 'Root',
            children: [],
            x: this.canvas.width / 2,
            y: 50
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

        const numChildren = Math.floor(Math.random() * 3) + 2; // 2-4 children
        for (let i = 0; i < numChildren; i++) {
            const child: TreeNode = {
                key: node.key + (i - numChildren / 2) * 20 + Math.floor(Math.random() * 10),
                value: `Node ${i}`,
                children: [],
                x: 0,
                y: 0
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

        const numChildren = Math.floor(Math.random() * 3) + 1; // 1-3 children
        for (let i = 0; i < numChildren; i++) {
            const child: TreeNode = {
                key: node.key + (i - numChildren / 2) * 30 + Math.floor(Math.random() * 15),
                value: `Node ${i}`,
                children: [],
                x: 0,
                y: 0,
                accessCount: Math.floor(Math.random() * 10)
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
        // Simple level-order layout
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
        const nodeWidth = 100;
        const horizontalSpacing = 150;
        const verticalSpacing = 120;

        levels.forEach((levelNodes, level) => {
            const levelWidth = levelNodes.length * horizontalSpacing;
            const startX = (this.canvas.width - levelWidth) / 2 + horizontalSpacing / 2;
            const y = 50 + level * verticalSpacing;

            levelNodes.forEach((node, index) => {
                node.x = startX + index * horizontalSpacing;
                node.y = y;
            });
        });
    }

    private draw(): void {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw edges
        this.drawEdges();

        // Draw nodes
        this.nodes.forEach(node => this.drawNode(node));
    }

    private drawEdges(): void {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 2;

        this.nodes.forEach(node => {
            node.children.forEach(child => {
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, node.y + 25);
                this.ctx.lineTo(child.x, child.y - 25);
                this.ctx.stroke();
            });
        });
    }

    private drawNode(node: TreeNode): void {
        const radius = 30;
        const accessCount = node.accessCount || 0;

        // Color based on access count (for splay tree) or type
        let color = '#667eea';
        if (this.treeType === 'splay' && accessCount > 0) {
            const intensity = Math.min(1, 0.3 + accessCount / 20);
            color = `rgba(102, 126, 234, ${intensity})`;
        }
        if (node.isLeaf) {
            color = '#f093fb';
        }

        // Draw node circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw key
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.key.toString(), node.x, node.y);

        // Draw access count (for splay tree)
        if (this.treeType === 'splay' && accessCount > 0) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText(`#${accessCount}`, node.x, node.y + 35);
        }
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
        document.getElementById('stat-nodes')!.textContent = this.nodes.length.toString();
        document.getElementById('stat-height')!.textContent = Math.ceil(height).toString();
        document.getElementById('stat-ops')!.textContent = this.operations.toString();
    }

    public simulateOperation(): void {
        this.operations++;
        // Simulate splay operation by moving a random node
        if (this.treeType === 'splay' && this.nodes.length > 1) {
            const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            if (randomNode !== this.nodes[0]) {
                // Animate node moving to root position
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
        const duration = 1000; // 1 second
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            node.x = startX + (endX - startX) * ease;
            node.y = startY + (endY - startY) * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Swap with root
                const root = this.nodes[0];
                [root.x, root.y] = [node.x, node.y];
                [node.x, node.y] = [endX, endY];
            }
        };

        animate();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const visualizer = new TreeVisualizer('tree-canvas');
        
        // Simulate operations periodically
        setInterval(() => {
            visualizer.simulateOperation();
        }, 3000);
    } catch (error) {
        console.error('Failed to initialize tree visualizer:', error);
    }
});

export default TreeVisualizer;
