#ifndef BTREE_H
#define BTREE_H

#include <vector>
#include <memory>
#include <mutex>
#include <atomic>
#include <thread>
#include <functional>
#include <queue>
#include <condition_variable>

template<typename Key, typename Value>
class BTree {
public:
    struct Node {
        std::vector<Key> keys;
        std::vector<Value> values;
        std::vector<std::shared_ptr<Node>> children;
        std::shared_ptr<Node> parent;
        bool isLeaf;
        std::atomic<int> accessCount;
        std::mutex nodeMutex;
        
        Node(int maxKeys, bool leaf = true) 
            : isLeaf(leaf), accessCount(0) {
            keys.reserve(maxKeys);
            values.reserve(maxKeys);
            if (!leaf) {
                children.reserve(maxKeys + 1);
            }
        }
    };
    
    BTree(int minDegree = 2);
    ~BTree();
    
    // Core operations
    bool insert(const Key& key, const Value& value);
    bool remove(const Key& key);
    Value* search(const Key& key);
    std::vector<std::pair<Key, Value>> sort();
    
    // Real-time operations with callbacks
    void insertAsync(const Key& key, const Value& value, 
                     std::function<void(bool)> callback = nullptr);
    void deleteAsync(const Key& key, 
                    std::function<void(bool)> callback = nullptr);
    void searchAsync(const Key& key, 
                    std::function<void(Value*)> callback = nullptr);
    void sortAsync(std::function<void(std::vector<std::pair<Key, Value>>)> callback = nullptr);
    
    // Thread management
    void startWorkerThreads(int numThreads = 4);
    void stopWorkerThreads();
    
    // Tree statistics
    size_t size() const;
    int height() const;
    int getMinDegree() const { return minDegree_; }
    void setMinDegree(int degree);
    
    // For visualization
    struct TreeSnapshot {
        struct NodeInfo {
            std::vector<Key> keys;
            std::vector<Value> values;
            std::vector<size_t> childIndices;
            bool isLeaf;
            int accessCount;
        };
        std::vector<NodeInfo> nodes;
        std::vector<std::pair<size_t, size_t>> edges;
    };
    
    TreeSnapshot getSnapshot() const;
    
private:
    int minDegree_;
    int maxKeys_;
    std::shared_ptr<Node> root_;
    mutable std::mutex treeMutex_;
    
    // Thread pool for async operations
    std::vector<std::thread> workerThreads_;
    std::queue<std::function<void()>> taskQueue_;
    std::mutex queueMutex_;
    std::condition_variable queueCondition_;
    std::atomic<bool> running_;
    
    // Splay optimization
    void splayNode(std::shared_ptr<Node> node);
    void promoteNode(std::shared_ptr<Node> node);
    
    // B-Tree operations
    void splitChild(std::shared_ptr<Node> parent, int index);
    void insertNonFull(std::shared_ptr<Node> node, const Key& key, const Value& value);
    void mergeChildren(std::shared_ptr<Node> parent, int index);
    void borrowFromSibling(std::shared_ptr<Node> node, int index);
    bool removeFromNode(std::shared_ptr<Node> node, const Key& key);
    Key getPredecessor(std::shared_ptr<Node> node, int index);
    Key getSuccessor(std::shared_ptr<Node> node, int index);
    
    // Helper functions
    int findKeyIndex(const std::vector<Key>& keys, const Key& key) const;
    void inOrderTraversal(std::shared_ptr<Node> node, 
                         std::vector<std::pair<Key, Value>>& result) const;
    int calculateHeight(std::shared_ptr<Node> node) const;
    size_t calculateSize(std::shared_ptr<Node> node) const;
    
    // Thread worker
    void workerThread();
    void enqueueTask(std::function<void()> task);
};

// Template implementation
#include "BTree.tpp"

#endif // BTREE_H
