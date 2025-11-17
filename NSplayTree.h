/*
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

#ifndef NSPLAYTREE_H
#define NSPLAYTREE_H

#include <vector>
#include <memory>
#include <mutex>
#include <atomic>
#include <thread>
#include <functional>
#include <queue>
#include <condition_variable>
#include <cstdint>
#include <string>
#include <type_traits>

// Rolling checksum for rsync (Adler-32 variant)
struct RollingChecksum {
    uint32_t a;
    uint32_t b;
    uint32_t value;
    
    RollingChecksum() : a(1), b(0), value(0) {}
    RollingChecksum(uint32_t a, uint32_t b) : a(a), b(b), value((b << 16) | a) {}
    
    bool operator<(const RollingChecksum& other) const { return value < other.value; }
    bool operator>(const RollingChecksum& other) const { return value > other.value; }
    bool operator==(const RollingChecksum& other) const { return value == other.value; }
    bool operator!=(const RollingChecksum& other) const { return value != other.value; }
    bool operator<=(const RollingChecksum& other) const { return value <= other.value; }
    bool operator>=(const RollingChecksum& other) const { return value >= other.value; }
};

// Block metadata for rsync
struct BlockMetadata {
    RollingChecksum checksum;
    uint32_t strongHash;  // MD5 or similar strong hash
    size_t blockIndex;
    size_t blockSize;
    std::string data;  // Optional: actual data or reference
    
    BlockMetadata() : strongHash(0), blockIndex(0), blockSize(0) {}
    BlockMetadata(const RollingChecksum& cs, uint32_t sh, size_t idx, size_t sz)
        : checksum(cs), strongHash(sh), blockIndex(idx), blockSize(sz) {}
};

template<typename Key, typename Value>
class NSplayTree {
public:
    struct Node {
        Key key;
        Value value;
        std::vector<std::shared_ptr<Node>> children;
        std::shared_ptr<Node> parent;
        std::atomic<int> accessCount;
        std::atomic<int> subtreeSize;
        int maxChildren;  // Dynamic branching factor
        std::mutex nodeMutex;
        
        Node(const Key& k, const Value& v, int maxChildren = 2)
            : key(k), value(v), accessCount(0), subtreeSize(1), maxChildren(maxChildren) {
            children.reserve(maxChildren);
        }
    };
    
    NSplayTree(int initialBranching = 2, int maxBranching = 16);
    ~NSplayTree();
    
    // Core operations
    bool insert(const Key& key, const Value& value);
    bool remove(const Key& key);
    Value* search(const Key& key);
    std::vector<std::pair<Key, Value>> inOrderTraversal();
    
    // Splay operation - brings node to root
    void splay(std::shared_ptr<Node> node);
    
    // Dynamic branching adjustment
    void adjustBranching(std::shared_ptr<Node> node);
    void setMaxBranching(int maxBranch);
    int getMaxBranching() const { return maxBranching_; }
    
    // Rsync-specific operations (specialized for RollingChecksum, BlockMetadata)
    template<typename K = Key, typename V = Value>
    typename std::enable_if<std::is_same<K, RollingChecksum>::value && 
                           std::is_same<V, BlockMetadata>::value, 
                           BlockMetadata*>::type
    findBlock(const RollingChecksum& checksum) {
        auto node = findNode(checksum);
        if (node && node->key == checksum) {
            node->accessCount++;
            splay(node);
            return &node->value;
        }
        return nullptr;
    }
    
    template<typename K = Key, typename V = Value>
    typename std::enable_if<std::is_same<K, RollingChecksum>::value && 
                           std::is_same<V, BlockMetadata>::value, 
                           void>::type
    insertBlock(const BlockMetadata& block) {
        insert(block.checksum, block);
    }
    
    template<typename K = Key, typename V = Value>
    typename std::enable_if<std::is_same<K, RollingChecksum>::value && 
                           std::is_same<V, BlockMetadata>::value, 
                           std::vector<BlockMetadata>>::type
    findMatchingBlocks(const RollingChecksum& checksum, uint32_t strongHash) {
        std::vector<BlockMetadata> results;
        auto node = findNode(checksum);
        
        if (node && node->key == checksum) {
            if (node->value.strongHash == strongHash) {
                results.push_back(node->value);
            }
        }
        return results;
    }
    
    // Real-time async operations
    void insertAsync(const Key& key, const Value& value,
                     std::function<void(bool)> callback = nullptr);
    void deleteAsync(const Key& key,
                    std::function<void(bool)> callback = nullptr);
    void searchAsync(const Key& key,
                    std::function<void(Value*)> callback = nullptr);
    
    // Thread management
    void startWorkerThreads(int numThreads = 4);
    void stopWorkerThreads();
    
    // Statistics
    size_t size() const;
    int height() const;
    double averageDepth() const;
    
    // For visualization
    struct TreeSnapshot {
        struct NodeInfo {
            Key key;
            Value value;
            std::vector<size_t> childIndices;
            int accessCount;
            int subtreeSize;
            int maxChildren;
        };
        std::vector<NodeInfo> nodes;
        std::vector<std::pair<size_t, size_t>> edges;
    };
    
    TreeSnapshot getSnapshot() const;
    
private:
    int initialBranching_;
    int maxBranching_;
    std::shared_ptr<Node> root_;
    mutable std::mutex treeMutex_;
    
    // Thread pool
    std::vector<std::thread> workerThreads_;
    std::queue<std::function<void()>> taskQueue_;
    std::mutex queueMutex_;
    std::condition_variable queueCondition_;
    std::atomic<bool> running_;
    
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
    
    // Tree restructuring
    void splitNode(std::shared_ptr<Node> node);
    void mergeNode(std::shared_ptr<Node> node);
    void redistributeChildren(std::shared_ptr<Node> node);
    
    // Traversal
    void inOrderHelper(std::shared_ptr<Node> node, 
                     std::vector<std::pair<Key, Value>>& result) const;
    
    // Statistics
    int calculateHeight(std::shared_ptr<Node> node) const;
    size_t calculateSize(std::shared_ptr<Node> node) const;
    double calculateAverageDepth(std::shared_ptr<Node> node, int depth) const;
    
    // Thread worker
    void workerThread();
    void enqueueTask(std::function<void()> task);
};

#include "NSplayTree.tpp"

#endif // NSPLAYTREE_H
