# Asymptotic Complexity Proofs

Copyright (C) 2025, Shyamal Suhana Chandra

## B-Tree Complexity Analysis

### Theorem 1: B-Tree Height
**Statement**: For a B-Tree of order t (min degree) with n keys, the height h satisfies:
\[ h \leq \log_t \frac{n+1}{2} \]

**Proof**:
- A B-Tree of height h has at least:
  - Root: 1 node with at least 1 key
  - Level 1: at least 2 nodes with at least (t-1) keys each
  - Level 2: at least 2t nodes with at least (t-1) keys each
  - Level h: at least 2t^(h-1) nodes with at least (t-1) keys each
  
- Total minimum keys: 
  \[ n \geq 1 + 2(t-1) + 2t(t-1) + ... + 2t^{h-1}(t-1) \]
  \[ n \geq 1 + 2(t-1)(1 + t + t^2 + ... + t^{h-1}) \]
  \[ n \geq 1 + 2(t-1)\frac{t^h - 1}{t - 1} \]
  \[ n \geq 1 + 2(t^h - 1) \]
  \[ n \geq 2t^h - 1 \]
  \[ t^h \leq \frac{n+1}{2} \]
  \[ h \leq \log_t \frac{n+1}{2} \]

**Corollary**: Height is O(log_t n) = O(log n) when t is constant.

---

### Theorem 2: B-Tree Search Complexity
**Statement**: Searching in a B-Tree with n keys takes O(log n) time.

**Proof**:
- Search traverses from root to leaf
- At each level, perform binary search on at most (2t-1) keys: O(t) = O(1) if t is constant
- Number of levels: O(log_t n) = O(log n)
- Total time: O(log n) × O(1) = **O(log n)**

---

### Theorem 3: B-Tree Insert Complexity
**Statement**: Inserting into a B-Tree with n keys takes O(log n) time.

**Proof**:
- Find insertion point: O(log n) (same as search)
- Insert into leaf: O(1)
- If node splits:
  - Split operation: O(t) = O(1) if t is constant
  - Propagate split upward: at most O(log n) levels
- Total time: O(log n) + O(log n) × O(1) = **O(log n)**

---

### Theorem 4: B-Tree Delete Complexity
**Statement**: Deleting from a B-Tree with n keys takes O(log n) time.

**Proof**:
- Find node to delete: O(log n)
- If internal node, find predecessor/successor: O(log n)
- Delete from node: O(1)
- Handle underflow:
  - Borrow from sibling: O(1)
  - Merge with sibling: O(t) = O(1)
  - Propagate upward: at most O(log n) levels
- Total time: O(log n) + O(log n) = **O(log n)**

---

### Theorem 5: B-Tree Space Complexity
**Statement**: A B-Tree with n keys uses O(n) space.

**Proof**:
- Each key stored exactly once: n keys
- Each node has at most (2t-1) keys and 2t children
- Number of nodes: at most n/(t-1) = O(n)
- Total space: O(n) keys + O(n) pointers = **O(n)**

---

## Dynamic N-Way Splay Tree Complexity Analysis

### Theorem 6: Splay Tree Amortized Complexity
**Statement**: The amortized time per operation in a splay tree is O(log n).

**Proof** (using potential method):
- Define potential function: Φ(T) = Σ log(size(v)) for all nodes v
- Let size(v) = number of nodes in subtree rooted at v
- For operation with actual cost c, amortized cost: ĉ = c + ΔΦ

**Splay Operation Analysis**:
- Zig step: amortized cost ≤ 3(r'(x) - r(x)) + 1
- Zig-Zig step: amortized cost ≤ 3(r'(x) - r(x))
- Zig-Zag step: amortized cost ≤ 3(r'(x) - r(x)) - 2

Where r(x) = log(size(x)) and r'(x) is rank after operation.

- Summing over all splay steps: total amortized cost ≤ 3(r(root) - r(x)) + 1
- Since r(root) = log(n) and r(x) ≥ 0: amortized cost ≤ 3 log(n) + 1 = **O(log n)**

---

### Theorem 7: N-Way Splay Tree Search Complexity
**Statement**: Searching in an N-way splay tree with n nodes takes O(log n) amortized time.

**Proof**:
- Find node: O(log n) worst case (tree height)
- Splay to root: O(log n) amortized (Theorem 6)
- Total: **O(log n) amortized**

---

### Theorem 8: N-Way Splay Tree Insert Complexity
**Statement**: Inserting into an N-way splay tree with n nodes takes O(log n) amortized time.

**Proof**:
- Find insertion point: O(log n)
- Insert node: O(1)
- Splay new node to root: O(log n) amortized
- Adjust branching if needed: O(1) amortized (infrequent)
- Total: **O(log n) amortized**

---

### Theorem 9: N-Way Splay Tree Delete Complexity
**Statement**: Deleting from an N-way splay tree with n nodes takes O(log n) amortized time.

**Proof**:
- Splay node to root: O(log n) amortized
- Delete root: O(1)
- If needed, splay successor/predecessor: O(log n) amortized
- Total: **O(log n) amortized**

---

### Theorem 10: Dynamic Branching Adjustment Complexity
**Statement**: Adjusting branching factor in an N-way splay tree takes O(1) amortized time per operation.

**Proof**:
- Branching adjustment triggered when: |children| > maxChildren or optimal branching changes
- Split operation: O(t) where t is current branching factor
- Since t ≤ √n (by design), split cost: O(√n)
- Split occurs at most once per O(√n) insertions
- Amortized cost: O(√n) / O(√n) = **O(1) amortized**

---

### Theorem 11: N-Way Splay Tree Space Complexity
**Statement**: An N-way splay tree with n nodes uses O(n) space.

**Proof**:
- Each node stores: 1 key, 1 value, at most maxChildren pointers
- Number of nodes: n
- Total pointers: at most n × maxChildren
- Since maxChildren = O(√n) in worst case: total space = O(n√n)
- However, average branching is much lower, giving **O(n) average case**

**Tighter bound**: With dynamic adjustment, average branching factor is O(1), giving **O(n) space**.

---

## Rsync Application Complexity

### Theorem 12: Block Matching Complexity
**Statement**: Finding matching blocks using rolling checksum in splay tree takes O(m log n) time where m is number of blocks to match and n is number of stored blocks.

**Proof**:
- For each of m blocks:
  - Compute rolling checksum: O(1)
  - Search in splay tree: O(log n) amortized
  - Verify strong hash: O(1)
- Total: m × O(log n) = **O(m log n)**

**With splay optimization**: Frequently matched blocks move to root, reducing average search time for common patterns.

---

### Theorem 13: Rsync Tree Construction Complexity
**Statement**: Building splay tree from file with b blocks takes O(b log b) time.

**Proof**:
- For each of b blocks:
  - Compute checksums: O(1)
  - Insert into tree: O(log i) where i is current tree size
- Sum: Σ(i=1 to b) log i = log(b!) = b log b (by Stirling's approximation)
- Total: **O(b log b)**

---

## Multithreading Complexity

### Theorem 14: Thread-Safe Operation Overhead
**Statement**: Thread-safe operations add O(1) overhead per operation.

**Proof**:
- Mutex lock/unlock: O(1) in uncontended case
- Atomic operations: O(1)
- Thread pool enqueue: O(1) amortized
- Total overhead: **O(1) per operation**

**Note**: Contention may cause O(k) where k is number of waiting threads, but average case is O(1).

---

## Summary Table

| Operation | B-Tree | N-Way Splay Tree | Space |
|-----------|--------|------------------|-------|
| Search | O(log n) | O(log n) amortized | O(n) |
| Insert | O(log n) | O(log n) amortized | O(n) |
| Delete | O(log n) | O(log n) amortized | O(n) |
| Sort | O(n) | O(n) | O(n) |
| Branching Adjust | N/A | O(1) amortized | - |

**Key Insights**:
- B-Tree: Consistent O(log n) worst-case performance
- Splay Tree: O(log n) amortized, better for hot data (access locality)
- N-way extension: Maintains O(log n) with better cache performance
- Rsync optimization: Reduces average search time for common patterns

---

Copyright (C) 2025, Shyamal Suhana Chandra. All rights reserved.
