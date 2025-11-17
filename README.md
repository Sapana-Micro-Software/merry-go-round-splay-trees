# B-Tree and Dynamic N-Way Splay Tree

High-performance tree data structures with multithreaded operations and real-time GUI visualization for macOS.

## Projects

### 1. B-Tree with Splay Optimization
A B-Tree implementation with splay-like optimizations for general-purpose data storage.

### 2. Dynamic N-Way Splay Tree for Rsync
A splay tree with dynamic N-way branching optimized for rsync-style file synchronization.

See [SPLAY_TREE_README.md](SPLAY_TREE_README.md) for details on the splay tree implementation.

## Features

- **N-way B-Tree**: Configurable branching factor (N can be set to any value ≥ 2)
- **Splay-like Optimization**: Frequently accessed nodes are promoted for better performance
- **Multithreaded Operations**: Thread-safe operations with worker thread pool
- **Real-time Operations**: Asynchronous insertion, deletion, search, and sorting
- **GUI Visualization**: Interactive macOS application with real-time tree visualization

## Building

### Using Make

```bash
make
```

### Using CMake

```bash
mkdir build
cd build
cmake ..
make
```

## Running

```bash
./BTreeVisualizer
```

## Usage

The GUI application provides:

- **Insert**: Add a key-value pair to the tree
- **Delete**: Remove a key from the tree
- **Search**: Find a key and display its value
- **Sort**: Perform in-order traversal (sorted output)
- **Min Degree**: Configure the B-Tree branching factor

## Architecture

### Core Components

1. **BTree.h/cpp**: Template-based B-Tree implementation with:
   - Configurable min degree (N-way branching)
   - Thread-safe operations using mutexes
   - Splay-like node promotion for frequently accessed nodes
   - Real-time async operations with callbacks

2. **BTreeBridge.h/cpp**: C interface bridge for Objective-C integration

3. **BTreeView.h/m**: NSView subclass for tree visualization with:
   - Real-time rendering
   - Auto-refresh capability
   - Level-order layout algorithm

4. **BTreeViewController.h/m**: View controller managing UI interactions

5. **main.m**: Application entry point and window setup

## Technical Details

### B-Tree Properties

- **Min Degree (t)**: Minimum number of children per node (except root)
- **Max Keys**: 2t - 1 keys per node
- **Height**: O(log_t n) where n is the number of keys

### Thread Safety

- Tree-level mutex for structural operations
- Node-level mutexes for fine-grained locking
- Worker thread pool for async operations

### Splay Optimization

When a node is accessed frequently (access count > threshold), it triggers a promotion attempt. This helps keep frequently accessed data closer to the root, improving cache locality.

## License

This project is provided as-is for educational and research purposes.
