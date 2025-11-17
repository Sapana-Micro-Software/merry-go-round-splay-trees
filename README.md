# B-Tree and Dynamic N-Way Splay Tree

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.

High-performance tree data structures with multithreaded operations and real-time GUI visualization for macOS.

## 🌐 Live Website

Visit the interactive website: **[https://sapana-micro-software.github.io/merry-go-round-splay-trees/](https://sapana-micro-software.github.io/merry-go-round-splay-trees/)**

The website features:
- ✨ Interactive Canvas visualizations
- 📊 Real-time tree operations
- 📈 Complexity analysis and proofs
- 🎨 Modern, responsive design

## Projects

### 1. B-Tree with Splay Optimization
A B-Tree implementation with splay-like optimizations for general-purpose data storage.

**Features:**
- Configurable N-way branching (min degree ≥ 2)
- Splay-like node promotion for hot data
- Thread-safe operations with mutexes
- Real-time async operations with callbacks
- Interactive macOS GUI visualization

**Complexity:**
- Search: O(log n)
- Insert: O(log n)
- Delete: O(log n)
- Space: O(n)

### 2. Dynamic N-Way Splay Tree
Optimized for rsync-style file synchronization with dynamic branching and self-adjusting structure.

**Features:**
- Dynamic N-way branching (2 to N, adaptive)
- Full splay operations (Zig, Zag, Zig-Zig, etc.)
- Rsync rolling checksums (Adler-32 variant)
- Block metadata and matching
- Real-time visualization with access counts

**Complexity:**
- Search: O(log n) amortized
- Insert: O(log n) amortized
- Delete: O(log n) amortized
- Space: O(n)

## Building

### B-Tree Visualizer
```bash
make
./BTreeVisualizer
```

### Splay Tree Visualizer
```bash
make splay
./NSplayTreeVisualizer
```

### Build Both
```bash
make all
```

## Complexity Proofs

Comprehensive asymptotic complexity proofs are available in [COMPLEXITY_PROOFS.md](COMPLEXITY_PROOFS.md).

The proofs cover:
- B-Tree height and operation complexity
- Splay tree amortized analysis
- N-way extension complexity
- Rsync application optimization
- Multithreading overhead

## Technology Stack

- **C++**: Core tree implementations
- **Objective-C**: macOS GUI components
- **TypeScript**: Interactive visualizations
- **JavaScript**: Canvas API animations
- **Jekyll**: Static site generation
- **GitHub Pages**: Hosting and deployment
- **GitHub Actions**: CI/CD automation

## Repository Structure

```
├── BTree.h/tpp/cpp          # B-Tree implementation
├── NSplayTree.h/tpp/cpp     # Splay tree implementation
├── *Bridge.h/cpp            # C interfaces
├── *View.h/m                # GUI components
├── src/ts/                  # TypeScript source
├── assets/css/              # Stylesheets
├── _config.yml              # Jekyll configuration
├── index.html               # Website homepage
└── COMPLEXITY_PROOFS.md     # Mathematical proofs
```

## GitHub Pages

The website is automatically deployed via GitHub Actions on every push to `main`. The Jekyll site includes:

- Interactive Canvas visualizations
- Responsive design
- Complexity analysis
- Live demonstrations

## License

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.

## Contributing

This is a research and educational project. Contributions and feedback are welcome!

## Links

- 🌐 [Live Website](https://sapana-micro-software.github.io/merry-go-round-splay-trees/)
- 📚 [Complexity Proofs](COMPLEXITY_PROOFS.md)
- 🔬 [Architecture Documentation](ARCHITECTURE.md)
- 🌳 [Splay Tree Details](SPLAY_TREE_README.md)
