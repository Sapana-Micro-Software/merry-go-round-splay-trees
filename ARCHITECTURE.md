# Architecture Documentation

## Overview

This project implements a B-Tree data structure with splay-like optimizations, multithreaded operations, and real-time GUI visualization for macOS.

## Component Architecture

### 1. Core B-Tree Implementation (`BTree.h`, `BTree.tpp`)

**Template-based B-Tree** with the following features:

- **N-way Branching**: Configurable `minDegree` parameter (N ≥ 2, can approach infinity)
- **Thread Safety**: 
  - Tree-level mutex for structural operations
  - Node-level mutexes for fine-grained locking
  - Atomic access counters for splay optimization
- **Splay-like Optimization**: 
  - Tracks access count per node
  - Promotes frequently accessed nodes (access count > threshold)
  - Improves cache locality for hot data
- **Operations**:
  - `insert(key, value)`: O(log_t n) where t is min degree
  - `remove(key)`: O(log_t n)
  - `search(key)`: O(log_t n) with splay optimization
  - `sort()`: O(n) in-order traversal

### 2. Thread Pool & Async Operations

**Worker Thread Pool**:
- Configurable number of worker threads (default: 4)
- Task queue with condition variables
- Async operations with optional callbacks:
  - `insertAsync(key, value, callback)`
  - `deleteAsync(key, callback)`
  - `searchAsync(key, callback)`
  - `sortAsync(callback)`

### 3. C Bridge Layer (`BTreeBridge.h`, `BTreeBridge.cpp`)

**C Interface** for Objective-C integration:
- Opaque handle-based API
- Memory-safe string handling
- Snapshot generation for visualization
- Automatic cleanup

### 4. GUI Components

#### `BTreeView` (Objective-C)
- Custom `NSView` subclass
- Real-time tree rendering
- Level-order layout algorithm
- Auto-refresh capability
- Visual features:
  - Color-coded nodes (leaf vs internal)
  - Access count indicators
  - Edge rendering
  - Key display

#### `BTreeViewController`
- Manages UI interactions
- Handles button actions
- Updates status information
- Coordinates tree operations

#### `main.m`
- Application entry point
- Window setup
- UI component initialization

## Data Flow

```
User Action (GUI)
    ↓
BTreeViewController
    ↓
BTreeBridge (C API)
    ↓
BTree (C++ Template)
    ↓
Worker Thread Pool (optional)
    ↓
Tree Structure Update
    ↓
Snapshot Generation
    ↓
BTreeView (Rendering)
```

## Threading Model

1. **Main Thread**: UI updates, user interactions
2. **Worker Threads**: Async tree operations
3. **Synchronization**: 
   - Mutexes for tree structure
   - Atomic counters for statistics
   - Condition variables for task queue

## Memory Management

- **C++**: Smart pointers (`std::shared_ptr`) for automatic memory management
- **Objective-C**: ARC (Automatic Reference Counting)
- **C Bridge**: Manual memory management with cleanup functions

## Performance Characteristics

- **Space Complexity**: O(n) where n is number of keys
- **Time Complexity**:
  - Insert: O(log_t n)
  - Delete: O(log_t n)
  - Search: O(log_t n) with splay optimization
  - Sort: O(n)
- **Thread Safety**: All operations are thread-safe with minimal contention

## Extensibility

The template-based design allows for:
- Custom key types (must support comparison operators)
- Custom value types
- Different comparison strategies
- Additional optimization strategies

## Future Enhancements

Potential improvements:
1. More sophisticated splay operations
2. Batch operations
3. Persistence layer
4. Network distribution
5. Advanced visualization options
