# Dynamic N-Way Splay Tree for Rsync Applications

A high-performance dynamic N-way splay tree implementation optimized for rsync-style file synchronization, with real-time GUI visualization.

## Features

### Core Splay Tree
- **Dynamic N-Way Branching**: Branching factor adjusts automatically based on subtree size
- **Splay Operations**: Zig, Zag, Zig-Zig, Zag-Zag, Zig-Zag, Zag-Zig rotations
- **Self-Adjusting**: Frequently accessed nodes automatically move to root
- **Thread-Safe**: Multithreaded operations with worker thread pool

### Rsync Optimization
- **Rolling Checksums**: Adler-32 variant for efficient block matching
- **Block Metadata**: Stores checksums, strong hashes, and block indices
- **Fast Lookups**: Splay optimization keeps frequently matched blocks near root
- **Delta Compression Support**: Efficient data structure for rsync algorithms

### Dynamic Branching
- **Adaptive**: Branching factor = min(maxBranching, max(initialBranching, √subtreeSize))
- **Configurable**: Initial and maximum branching factors can be set
- **Automatic Adjustment**: Tree restructures as it grows

## Building

```bash
make splay
```

Or build both B-Tree and Splay Tree:
```bash
make all
```

## Running

```bash
./NSplayTreeVisualizer
```

## Usage

### GUI Controls

1. **Insert**: Add a key-value pair (automatically splays to root)
2. **Search**: Find a key (automatically splays to root)
3. **Delete**: Remove a key from the tree
4. **Initial Branching**: Set the starting branching factor (default: 2)
5. **Max Branching**: Set maximum branching factor (default: 16)
6. **Show Access Counts**: Display how many times nodes were accessed
7. **Show Subtree Sizes**: Display subtree size for each node
8. **Rsync Mode**: Enable rsync-specific block matching operations

### Rsync Operations

The tree supports rsync-specific operations:

```c
// Insert a block with rolling checksum
BlockMetadataC block;
block.checksum.a = ...;
block.checksum.b = ...;
block.strongHash = ...;
block.blockIndex = ...;
nsplaytree_insert_block(handle, &block);

// Find matching blocks
RollingChecksumC checksum = {...};
uint32_t strongHash = ...;
BlockMetadataC* results;
int count;
nsplaytree_find_matching_blocks(handle, &checksum, strongHash, &results, &count);
```

## How Splay Trees Work

### Splay Operation
When a node is accessed (search, insert, or update), it's "splayed" to the root through a series of rotations:

1. **Zig**: Node is left child of root → rotate right
2. **Zag**: Node is right child of root → rotate left
3. **Zig-Zig**: Node and parent are both left children → double right rotation
4. **Zag-Zag**: Node and parent are both right children → double left rotation
5. **Zig-Zag**: Node is right child, parent is left child → right-left rotation
6. **Zag-Zig**: Node is left child, parent is right child → left-right rotation

### N-Way Extension
Traditional splay trees are binary. This implementation extends to N-way:
- Nodes can have multiple children (up to maxBranching)
- Branching factor adjusts dynamically
- Splay operations work with multi-child nodes
- Better cache locality for large datasets

## Performance Characteristics

- **Amortized O(log n)**: Most operations are O(log n) amortized
- **Cache-Friendly**: Hot nodes stay near root
- **Adaptive**: Tree structure adapts to access patterns
- **Space**: O(n) where n is number of nodes

## Rsync Application

For rsync-style file synchronization:

1. **Sender Side**:
   - Build tree of file blocks with rolling checksums
   - Frequently accessed blocks (matching patterns) splay to root
   - Fast lookup for block matching

2. **Receiver Side**:
   - Receive block signatures
   - Match against local tree
   - Splay optimization keeps common blocks accessible

3. **Benefits**:
   - Faster block matching (hot blocks near root)
   - Reduced tree height over time
   - Better cache performance
   - Adaptive to file patterns

## Architecture

```
NSplayTree (C++ Template)
    ↓
NSplayTreeBridge (C Interface)
    ↓
NSplayTreeView (Objective-C GUI)
    ↓
NSplayTreeViewController (UI Logic)
```

## Thread Safety

- Tree-level mutex for structural operations
- Node-level mutexes for fine-grained locking
- Atomic counters for statistics
- Worker thread pool for async operations

## Example: Rsync Block Matching

```cpp
// Create tree
NSplayTree<RollingChecksum, BlockMetadata> tree(2, 16);

// Insert blocks from source file
for (size_t i = 0; i < blocks.size(); i++) {
    RollingChecksum cs = computeRollingChecksum(blocks[i]);
    BlockMetadata bm(cs, computeStrongHash(blocks[i]), i, blocks[i].size());
    tree.insertBlock(bm);
}

// Match blocks from target file
for (auto& targetBlock : targetBlocks) {
    RollingChecksum cs = computeRollingChecksum(targetBlock);
    auto matches = tree.findMatchingBlocks(cs, computeStrongHash(targetBlock));
    // Matching blocks are now near root due to splay
}
```

## License

This project is provided as-is for educational and research purposes.
