/**
 * Tree Visualizer - Interactive Canvas Visualization
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

(function() {
    'use strict';

    var TreeNode = /** @class */ (function () {
        function TreeNode(key, value, children) {
            if (children === void 0) { children = []; }
            this.key = key;
            this.value = value;
            this.children = children;
            this.x = 0;
            this.y = 0;
            this.accessCount = 0;
            this.isLeaf = false;
        }
        return TreeNode;
    }());

    var TreeVisualizer = /** @class */ (function () {
        function TreeVisualizer(canvasId) {
            var canvas = document.getElementById(canvasId);
            if (!canvas) {
                throw new Error("Canvas element with id " + canvasId + " not found");
            }
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.treeType = 'btree';
            this.nodes = [];
            this.operations = 0;
            this.animationId = null;
            this.setupEventListeners();
            this.init();
        }
        TreeVisualizer.prototype.setupEventListeners = function () {
            var _this = this;
            var btreeBtn = document.getElementById('btn-btree');
            var splayBtn = document.getElementById('btn-splay');
            var resetBtn = document.getElementById('btn-reset');
            if (btreeBtn) {
                btreeBtn.addEventListener('click', function () {
                    _this.treeType = 'btree';
                    _this.updateButtons('btree');
                    _this.init();
                });
            }
            if (splayBtn) {
                splayBtn.addEventListener('click', function () {
                    _this.treeType = 'splay';
                    _this.updateButtons('splay');
                    _this.init();
                });
            }
            if (resetBtn) {
                resetBtn.addEventListener('click', function () {
                    _this.init();
                });
            }
        };
        TreeVisualizer.prototype.updateButtons = function (active) {
            var buttons = document.querySelectorAll('.viz-btn');
            buttons.forEach(function (btn) { return btn.classList.remove('active'); });
            var activeBtn = document.getElementById("btn-" + active);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        };
        TreeVisualizer.prototype.init = function () {
            this.nodes = [];
            this.operations = 0;
            this.generateSampleTree();
            this.updateStats();
            this.animate();
        };
        TreeVisualizer.prototype.generateSampleTree = function () {
            var root = new TreeNode(50, 'Root', []);
            if (this.treeType === 'btree') {
                this.generateBTree(root, 3);
            }
            else {
                this.generateSplayTree(root, 2);
            }
            this.nodes = this.flattenTree(root);
            this.layoutTree();
        };
        TreeVisualizer.prototype.generateBTree = function (node, depth) {
            if (depth === 0) {
                node.isLeaf = true;
                return;
            }
            var numChildren = Math.floor(Math.random() * 3) + 2;
            for (var i = 0; i < numChildren; i++) {
                var child = new TreeNode(node.key + (i - numChildren / 2) * 20 + Math.floor(Math.random() * 10), "Node " + i, []);
                this.generateBTree(child, depth - 1);
                node.children.push(child);
            }
        };
        TreeVisualizer.prototype.generateSplayTree = function (node, depth) {
            if (depth === 0) {
                node.isLeaf = true;
                node.accessCount = Math.floor(Math.random() * 10);
                return;
            }
            var numChildren = Math.floor(Math.random() * 3) + 1;
            for (var i = 0; i < numChildren; i++) {
                var child = new TreeNode(node.key + (i - numChildren / 2) * 30 + Math.floor(Math.random() * 15), "Node " + i, []);
                child.accessCount = Math.floor(Math.random() * 10);
                this.generateSplayTree(child, depth - 1);
                node.children.push(child);
            }
            node.accessCount = Math.floor(Math.random() * 10);
        };
        TreeVisualizer.prototype.flattenTree = function (node) {
            var result = [node];
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                result.push.apply(result, this.flattenTree(child));
            }
            return result;
        };
        TreeVisualizer.prototype.layoutTree = function () {
            var levels = [];
            var queue = [{ node: this.nodes[0], level: 0 }];
            while (queue.length > 0) {
                var item = queue.shift();
                if (!item)
                    continue;
                var node = item.node;
                var level = item.level;
                if (!levels[level])
                    levels[level] = [];
                levels[level].push(node);
                for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    queue.push({ node: child, level: level + 1 });
                }
            }
            var nodeHeight = 80;
            var nodeWidth = 100;
            var horizontalSpacing = 150;
            var verticalSpacing = 120;
            levels.forEach(function (levelNodes, level) {
                var levelWidth = levelNodes.length * horizontalSpacing;
                var startX = (1200 - levelWidth) / 2 + horizontalSpacing / 2;
                var y = 50 + level * verticalSpacing;
                levelNodes.forEach(function (node, index) {
                    node.x = startX + index * horizontalSpacing;
                    node.y = y;
                });
            });
        };
        TreeVisualizer.prototype.draw = function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawEdges();
            var _this = this;
            this.nodes.forEach(function (node) { return _this.drawNode(node); });
        };
        TreeVisualizer.prototype.drawEdges = function () {
            var _this = this;
            this.ctx.strokeStyle = '#ddd';
            this.ctx.lineWidth = 2;
            this.nodes.forEach(function (node) {
                node.children.forEach(function (child) {
                    _this.ctx.beginPath();
                    _this.ctx.moveTo(node.x, node.y + 25);
                    _this.ctx.lineTo(child.x, child.y - 25);
                    _this.ctx.stroke();
                });
            });
        };
        TreeVisualizer.prototype.drawNode = function (node) {
            var radius = 30;
            var accessCount = node.accessCount || 0;
            var color = '#667eea';
            if (this.treeType === 'splay' && accessCount > 0) {
                var intensity = Math.min(1, 0.3 + accessCount / 20);
                color = "rgba(102, 126, 234, " + intensity + ")";
            }
            if (node.isLeaf) {
                color = '#f093fb';
            }
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.key.toString(), node.x, node.y);
            if (this.treeType === 'splay' && accessCount > 0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '10px sans-serif';
                this.ctx.fillText("#" + accessCount, node.x, node.y + 35);
            }
        };
        TreeVisualizer.prototype.animate = function () {
            var _this = this;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            var animate = function () {
                _this.draw();
                _this.animationId = requestAnimationFrame(animate);
            };
            animate();
        };
        TreeVisualizer.prototype.updateStats = function () {
            var height = Math.max.apply(Math, this.nodes.map(function (n) { return n.y; })) / 120;
            var nodesEl = document.getElementById('stat-nodes');
            var heightEl = document.getElementById('stat-height');
            var opsEl = document.getElementById('stat-ops');
            if (nodesEl)
                nodesEl.textContent = this.nodes.length.toString();
            if (heightEl)
                heightEl.textContent = Math.ceil(height).toString();
            if (opsEl)
                opsEl.textContent = this.operations.toString();
        };
        TreeVisualizer.prototype.simulateOperation = function () {
            this.operations++;
            if (this.treeType === 'splay' && this.nodes.length > 1) {
                var randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                if (randomNode !== this.nodes[0]) {
                    this.animateSplay(randomNode);
                }
            }
            this.updateStats();
        };
        TreeVisualizer.prototype.animateSplay = function (node) {
            var _this = this;
            var startX = node.x;
            var startY = node.y;
            var endX = this.canvas.width / 2;
            var endY = 50;
            var duration = 1000;
            var startTime = Date.now();
            var animate = function () {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var ease = 1 - Math.pow(1 - progress, 3);
                node.x = startX + (endX - startX) * ease;
                node.y = startY + (endY - startY) * ease;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    var root = _this.nodes[0];
                    var tempX = root.x;
                    var tempY = root.y;
                    root.x = node.x;
                    root.y = node.y;
                    node.x = tempX;
                    node.y = tempY;
                }
            };
            animate();
        };
        return TreeVisualizer;
    }());

    document.addEventListener('DOMContentLoaded', function () {
        try {
            var visualizer = new TreeVisualizer('tree-canvas');
            setInterval(function () {
                visualizer.simulateOperation();
            }, 3000);
        }
        catch (error) {
            console.error('Failed to initialize tree visualizer:', error);
        }
    });
})();
