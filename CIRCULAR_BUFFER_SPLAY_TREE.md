# Circular Buffer Splay Tree

Copyright (C) 2025, Shyamal Suhana Chandra

## Overview

The Circular Buffer Splay Tree is a hybrid data structure that combines:
- **Splay Tree**: Self-adjusting binary search tree with amortized O(log n) operations
- **Circular Buffer**: Fixed-size memory-efficient storage with O(1) space overhead

This combination provides:
- Efficient memory usage with bounded space complexity
- Self-optimizing behavior for frequently accessed elements
- Support for multiple sorting modes (lexicographic, numeric, semantic)

## Theory

### Data Structure

A Circular Buffer Splay Tree maintains:
- A binary search tree structure (splay tree)
- A fixed-size circular buffer for node storage
- LRU (Least Recently Used) eviction policy when buffer is full

### Key Properties

1. **Memory Bounded**: Maximum size is fixed at buffer size
2. **Self-Adjusting**: Frequently accessed nodes move to root via splay operations
3. **Flexible Sorting**: Supports lexicographic, numeric, and semantic comparison modes
4. **Thread-Safe**: Operations are protected by mutex locks

### Operations

#### Search
- Finds node with given key
- Performs splay operation to bring node to root
- Returns pointer to value if found, nullptr otherwise
- **Complexity**: O(log n) amortized

#### Insert
- Inserts new key-value pair
- Uses circular buffer allocation (may evict LRU node if full)
- Performs splay operation on newly inserted node
- **Complexity**: O(log n) amortized

#### Delete
- Removes node with given key
- Handles three cases: leaf, one child, two children
- Updates subtree sizes
- **Complexity**: O(log n) amortized

#### Sort
- Performs in-order traversal
- Supports ascending and descending order
- Supports lexicographic, numeric, and semantic comparison modes
- **Complexity**: O(n) where n is number of nodes

### Sorting Modes

1. **Lexicographic**: String-based comparison (alphabetical order)
2. **Numeric**: Numeric comparison (<, >, =)
3. **Semantic**: Custom comparison function (domain-specific)

### Circular Buffer Management

- Fixed-size buffer prevents unbounded memory growth
- When buffer is full, oldest (LRU) nodes are evicted
- Buffer index wraps around using modulo arithmetic
- Provides O(1) space overhead per node

## Use Cases

- **Cache Systems**: Bounded-size cache with self-optimization
- **Streaming Data**: Processing data streams with limited memory
- **Embedded Systems**: Memory-constrained environments
- **Real-time Systems**: Predictable memory usage

## Advantages

1. **Memory Efficiency**: Bounded space complexity
2. **Performance**: Amortized O(log n) operations
3. **Self-Optimization**: Frequently accessed data moves to root
4. **Flexibility**: Multiple sorting modes
5. **Predictability**: Fixed maximum memory usage

## Disadvantages

1. **Eviction**: May lose data when buffer is full
2. **Amortized Complexity**: Worst-case single operation may be O(n)
3. **Thread Contention**: Mutex locks may cause contention

## Implementation Details

- Template-based for type flexibility
- Smart pointers for automatic memory management
- Atomic counters for thread-safe statistics
- Mutex-based synchronization for thread safety

---

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.
