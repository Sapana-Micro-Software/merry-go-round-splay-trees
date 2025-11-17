/*
 * Circular Buffer Splay Tree
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

#ifndef CIRCULAR_BUFFER_SPLAY_TREE_H
#define CIRCULAR_BUFFER_SPLAY_TREE_H

#include <vector>
#include <memory>
#include <mutex>
#include <atomic>
#include <functional>
#include <algorithm>
#include <string>
#include <type_traits>

enum class SortMode {
    LEXICOGRAPHIC,  // String comparison
    NUMERIC,        // Numeric comparison
    SEMANTIC        // Custom semantic comparison
};

enum class SortOrder {
    ASCENDING,
    DESCENDING
};

template<typename Key, typename Value>
class CircularBufferSplayTree {
public:
    struct Node {
        Key key;
        Value value;
        std::shared_ptr<Node> left;
        std::shared_ptr<Node> right;
        std::shared_ptr<Node> parent;
        std::atomic<int> accessCount;
        std::atomic<int> subtreeSize;
        size_t bufferIndex;  // Index in circular buffer
        
        Node(const Key& k, const Value& v, size_t idx)
            : key(k), value(v), left(nullptr), right(nullptr), parent(nullptr),
              accessCount(0), subtreeSize(1), bufferIndex(idx) {}
    };
    
    CircularBufferSplayTree(size_t bufferSize = 1024, 
                           SortMode mode = SortMode::NUMERIC);
    ~CircularBufferSplayTree();
    
    // Core operations
    bool insert(const Key& key, const Value& value);
    bool remove(const Key& key);
    Value* search(const Key& key);
    
    // Sorting operations
    std::vector<std::pair<Key, Value>> sort(SortOrder order = SortOrder::ASCENDING,
                                           SortMode mode = SortMode::NUMERIC);
    std::vector<std::pair<Key, Value>> sortAscending(SortMode mode = SortMode::NUMERIC);
    std::vector<std::pair<Key, Value>> sortDescending(SortMode mode = SortMode::NUMERIC);
    
    // Splay operation
    void splay(std::shared_ptr<Node> node);
    
    // Buffer management
    void setBufferSize(size_t size);
    size_t getBufferSize() const { return bufferSize_; }
    size_t getCurrentSize() const { return currentSize_; }
    
    // Statistics
    size_t size() const { return currentSize_; }
    int height() const;
    double averageDepth() const;
    
    // Custom comparison functions
    void setLexicographicComparator(std::function<bool(const Key&, const Key&)> cmp);
    void setNumericComparator(std::function<bool(const Key&, const Key&)> cmp);
    void setSemanticComparator(std::function<bool(const Key&, const Key&)> cmp);
    
private:
    size_t bufferSize_;
    size_t currentSize_;
    size_t nextIndex_;
    std::vector<std::shared_ptr<Node>> circularBuffer_;
    std::shared_ptr<Node> root_;
    mutable std::mutex treeMutex_;
    SortMode defaultSortMode_;
    
    // Custom comparators
    std::function<bool(const Key&, const Key&)> lexicographicCmp_;
    std::function<bool(const Key&, const Key&)> numericCmp_;
    std::function<bool(const Key&, const Key&)> semanticCmp_;
    
    // Comparison function
    bool compare(const Key& a, const Key& b, SortMode mode) const;
    bool compareLess(const Key& a, const Key& b, SortMode mode) const;
    bool compareEqual(const Key& a, const Key& b, SortMode mode) const;
    
    // Splay operations
    void zig(std::shared_ptr<Node> node);
    void zag(std::shared_ptr<Node> node);
    void zigZig(std::shared_ptr<Node> node);
    void zagZag(std::shared_ptr<Node> node);
    void zigZag(std::shared_ptr<Node> node);
    void zagZig(std::shared_ptr<Node> node);
    
    // Helper functions
    std::shared_ptr<Node> findNode(const Key& key);
    std::shared_ptr<Node> findNodeRecursive(std::shared_ptr<Node> node, const Key& key);
    void insertNode(std::shared_ptr<Node> node, const Key& key, const Value& value);
    void removeNode(std::shared_ptr<Node> node);
    void updateSubtreeSize(std::shared_ptr<Node> node);
    
    // Buffer management
    std::shared_ptr<Node> allocateNode(const Key& key, const Value& value);
    void deallocateNode(std::shared_ptr<Node> node);
    
    // Traversal
    void inOrderHelper(std::shared_ptr<Node> node,
                      std::vector<std::pair<Key, Value>>& result,
                      SortOrder order,
                      SortMode mode) const;
    
    // Statistics
    int calculateHeight(std::shared_ptr<Node> node) const;
    void calculateAverageDepth(std::shared_ptr<Node> node, int depth, double& sum, int& count) const;
};

#include "CircularBufferSplayTree.tpp"

#endif // CIRCULAR_BUFFER_SPLAY_TREE_H
