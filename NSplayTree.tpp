#ifndef NSPLAYTREE_TPP
#define NSPLAYTREE_TPP

#include "NSplayTree.h"
#include <algorithm>
#include <iostream>
#include <map>
#include <cmath>

template<typename Key, typename Value>
NSplayTree<Key, Value>::NSplayTree(int initialBranching, int maxBranching)
    : initialBranching_(initialBranching), maxBranching_(maxBranching),
      root_(nullptr), running_(false) {
}

template<typename Key, typename Value>
NSplayTree<Key, Value>::~NSplayTree() {
    stopWorkerThreads();
}

template<typename Key, typename Value>
bool NSplayTree<Key, Value>::insert(const Key& key, const Value& value) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    if (root_ == nullptr) {
        root_ = std::make_shared<Node>(key, value, initialBranching_);
        return true;
    }
    
    // Search for the key
    auto node = findNode(key);
    if (node && node->key == key) {
        // Key exists, update value
        node->value = value;
        splay(node);
        return false;
    }
    
    // Insert new node
    if (node == nullptr) {
        node = root_;
    }
    
    insertNode(node, key, value);
    auto newNode = findNode(key);
    if (newNode) {
        splay(newNode);
    }
    
    return true;
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::insertNode(std::shared_ptr<Node> node, 
                                        const Key& key, const Value& value) {
    // Find appropriate position
    if (node->children.empty()) {
        // Leaf node - add as child
        auto newNode = std::make_shared<Node>(key, value, initialBranching_);
        newNode->parent = node;
        
        // Insert in sorted order
        auto it = node->children.begin();
        while (it != node->children.end() && (*it)->key < key) {
            ++it;
        }
        node->children.insert(it, newNode);
        
        // Check if we need to split
        if (node->children.size() > node->maxChildren) {
            splitNode(node);
        }
        
        updateSubtreeSize(node);
    } else {
        // Find child to insert into
        size_t childIndex = 0;
        for (size_t i = 0; i < node->children.size(); i++) {
            if (i < node->children.size() - 1 && node->children[i + 1]->key > key) {
                childIndex = i;
                break;
            }
            if (i == node->children.size() - 1) {
                childIndex = i;
                break;
            }
        }
        
        if (childIndex < node->children.size()) {
            insertNode(node->children[childIndex], key, value);
        } else {
            // Insert as new child
            auto newNode = std::make_shared<Node>(key, value, initialBranching_);
            newNode->parent = node;
            node->children.push_back(newNode);
            
            if (node->children.size() > node->maxChildren) {
                splitNode(node);
            }
        }
        
        updateSubtreeSize(node);
    }
}

template<typename Key, typename Value>
Value* NSplayTree<Key, Value>::search(const Key& key) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    auto node = findNode(key);
    if (node && node->key == key) {
        node->accessCount++;
        splay(node);
        return &node->value;
    }
    
    return nullptr;
}

template<typename Key, typename Value>
std::shared_ptr<typename NSplayTree<Key, Value>::Node> 
NSplayTree<Key, Value>::findNode(const Key& key) {
    return findNodeRecursive(root_, key);
}

template<typename Key, typename Value>
std::shared_ptr<typename NSplayTree<Key, Value>::Node>
NSplayTree<Key, Value>::findNodeRecursive(std::shared_ptr<Node> node, const Key& key) {
    if (node == nullptr) return nullptr;
    
    if (node->key == key) {
        return node;
    }
    
    // Binary search in children
    if (node->children.empty()) {
        return node;  // Return leaf node for insertion
    }
    
    for (size_t i = 0; i < node->children.size(); i++) {
        if (i < node->children.size() - 1) {
            if (key >= node->children[i]->key && key < node->children[i + 1]->key) {
                return findNodeRecursive(node->children[i], key);
            }
        } else {
            if (key >= node->children[i]->key) {
                return findNodeRecursive(node->children[i], key);
            }
        }
    }
    
    // If key is less than all children, return first child's subtree
    if (!node->children.empty() && key < node->children[0]->key) {
        return findNodeRecursive(node->children[0], key);
    }
    
    return node;
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::splay(std::shared_ptr<Node> node) {
    if (node == nullptr || node == root_) return;
    
    while (node->parent != nullptr) {
        auto parent = node->parent;
        auto grandparent = parent->parent;
        
        if (grandparent == nullptr) {
            // Zig or Zag
            if (parent->children.size() > 0 && parent->children[0] == node) {
                zig(node);
            } else {
                zag(node);
            }
        } else {
            // Determine rotation type
            bool nodeIsLeft = false, parentIsLeft = false;
            
            for (size_t i = 0; i < parent->children.size(); i++) {
                if (parent->children[i] == node) {
                    nodeIsLeft = (i == 0);
                    break;
                }
            }
            
            for (size_t i = 0; i < grandparent->children.size(); i++) {
                if (grandparent->children[i] == parent) {
                    parentIsLeft = (i == 0);
                    break;
                }
            }
            
            if (nodeIsLeft && parentIsLeft) {
                zigZig(node);
            } else if (!nodeIsLeft && !parentIsLeft) {
                zagZag(node);
            } else if (nodeIsLeft && !parentIsLeft) {
                zigZag(node);
            } else {
                zagZig(node);
            }
        }
        
        adjustBranching(node);
    }
    
    root_ = node;
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::zig(std::shared_ptr<Node> node) {
    auto parent = node->parent;
    if (parent == nullptr) return;
    
    // Remove node from parent's children
    parent->children.erase(
        std::remove_if(parent->children.begin(), parent->children.end(),
            [&node](const std::shared_ptr<Node>& n) { return n == node; }),
        parent->children.end()
    );
    
    // Make parent a child of node
    node->parent = parent->parent;
    if (parent->parent != nullptr) {
        // Replace parent in grandparent's children
        for (auto& child : parent->parent->children) {
            if (child == parent) {
                child = node;
                break;
            }
        }
    }
    
    // Move parent's other children to node
    for (auto& child : parent->children) {
        if (child != node) {
            child->parent = node;
            node->children.push_back(child);
        }
    }
    
    parent->parent = node;
    node->children.push_back(parent);
    
    // Sort children by key
    std::sort(node->children.begin(), node->children.end(),
        [](const std::shared_ptr<Node>& a, const std::shared_ptr<Node>& b) {
            return a->key < b->key;
        });
    
    updateSubtreeSize(node);
    updateSubtreeSize(parent);
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::zag(std::shared_ptr<Node> node) {
    auto parent = node->parent;
    if (parent == nullptr) return;
    
    // Similar to zig but node is rightmost child
    zig(node);  // For simplicity, we'll use zig logic
    // In a full implementation, zag would be the mirror
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::zigZig(std::shared_ptr<Node> node) {
    zig(node->parent);
    zig(node);
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::zagZag(std::shared_ptr<Node> node) {
    zag(node->parent);
    zag(node);
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::zigZag(std::shared_ptr<Node> node) {
    zig(node);
    zag(node);
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::zagZig(std::shared_ptr<Node> node) {
    zag(node);
    zig(node);
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::adjustBranching(std::shared_ptr<Node> node) {
    if (node == nullptr) return;
    
    int currentSize = node->subtreeSize.load();
    int optimalBranching = std::min(maxBranching_, 
                                   std::max(initialBranching_, 
                                           static_cast<int>(std::sqrt(currentSize))));
    
    if (node->maxChildren != optimalBranching && node->children.size() <= optimalBranching) {
        node->maxChildren = optimalBranching;
    }
    
    // If node has too many children, split
    if (node->children.size() > node->maxChildren) {
        splitNode(node);
    }
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::splitNode(std::shared_ptr<Node> node) {
    if (node->children.size() <= node->maxChildren) return;
    
    int mid = node->children.size() / 2;
    auto newNode = std::make_shared<Node>(node->children[mid]->key, 
                                         node->children[mid]->value,
                                         node->maxChildren);
    newNode->parent = node->parent;
    
    // Move half children to new node
    for (size_t i = mid + 1; i < node->children.size(); i++) {
        node->children[i]->parent = newNode;
        newNode->children.push_back(node->children[i]);
    }
    
    node->children.resize(mid + 1);
    
    // Insert new node into parent
    if (node->parent != nullptr) {
        auto it = node->parent->children.begin();
        while (it != node->parent->children.end() && (*it)->key < newNode->key) {
            ++it;
        }
        node->parent->children.insert(it, newNode);
        
        if (node->parent->children.size() > node->parent->maxChildren) {
            splitNode(node->parent);
        }
    } else {
        // Create new root
        auto newRoot = std::make_shared<Node>(node->key, node->value, node->maxChildren);
        newRoot->children.push_back(node);
        newRoot->children.push_back(newNode);
        node->parent = newRoot;
        newNode->parent = newRoot;
        root_ = newRoot;
    }
    
    updateSubtreeSize(node);
    updateSubtreeSize(newNode);
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::updateSubtreeSize(std::shared_ptr<Node> node) {
    if (node == nullptr) return;
    
    int size = 1;
    for (auto& child : node->children) {
        size += child->subtreeSize.load();
    }
    node->subtreeSize = size;
    
    if (node->parent != nullptr) {
        updateSubtreeSize(node->parent);
    }
}

template<typename Key, typename Value>
bool NSplayTree<Key, Value>::remove(const Key& key) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    auto node = findNode(key);
    if (node == nullptr || node->key != key) {
        return false;
    }
    
    splay(node);
    removeNode(node);
    return true;
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::removeNode(std::shared_ptr<Node> node) {
    if (node->children.empty()) {
        // Leaf node - just remove from parent
        if (node->parent != nullptr) {
            node->parent->children.erase(
                std::remove_if(node->parent->children.begin(), 
                              node->parent->children.end(),
                    [&node](const std::shared_ptr<Node>& n) { return n == node; }),
                node->parent->children.end()
            );
            updateSubtreeSize(node->parent);
        } else {
            root_ = nullptr;
        }
    } else {
        // Find successor and replace
        auto successor = node->children[0];
        while (!successor->children.empty()) {
            successor = successor->children[0];
        }
        
        node->key = successor->key;
        node->value = successor->value;
        removeNode(successor);
    }
}

template<typename Key, typename Value>
std::vector<std::pair<Key, Value>> NSplayTree<Key, Value>::inOrderTraversal() {
    std::lock_guard<std::mutex> lock(treeMutex_);
    std::vector<std::pair<Key, Value>> result;
    inOrderHelper(root_, result);
    return result;
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::inOrderHelper(std::shared_ptr<Node> node,
                                          std::vector<std::pair<Key, Value>>& result) const {
    if (node == nullptr) return;
    
    for (size_t i = 0; i < node->children.size(); i++) {
        inOrderHelper(node->children[i], result);
        if (i < node->children.size() - 1) {
            result.push_back({node->key, node->value});
        }
    }
    
    if (node->children.empty()) {
        result.push_back({node->key, node->value});
    }
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::startWorkerThreads(int numThreads) {
    if (running_) return;
    
    running_ = true;
    for (int i = 0; i < numThreads; i++) {
        workerThreads_.emplace_back(&NSplayTree::workerThread, this);
    }
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::stopWorkerThreads() {
    if (!running_) return;
    
    running_ = false;
    queueCondition_.notify_all();
    
    for (auto& thread : workerThreads_) {
        if (thread.joinable()) {
            thread.join();
        }
    }
    workerThreads_.clear();
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::workerThread() {
    while (running_) {
        std::unique_lock<std::mutex> lock(queueMutex_);
        queueCondition_.wait(lock, [this] { 
            return !taskQueue_.empty() || !running_; 
        });
        
        if (!running_ && taskQueue_.empty()) break;
        
        if (!taskQueue_.empty()) {
            auto task = taskQueue_.front();
            taskQueue_.pop();
            lock.unlock();
            task();
        }
    }
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::enqueueTask(std::function<void()> task) {
    std::lock_guard<std::mutex> lock(queueMutex_);
    taskQueue_.push(task);
    queueCondition_.notify_one();
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::insertAsync(const Key& key, const Value& value,
                                         std::function<void(bool)> callback) {
    enqueueTask([this, key, value, callback]() {
        bool result = insert(key, value);
        if (callback) callback(result);
    });
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::deleteAsync(const Key& key,
                                        std::function<void(bool)> callback) {
    enqueueTask([this, key, callback]() {
        bool result = remove(key);
        if (callback) callback(result);
    });
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::searchAsync(const Key& key,
                                        std::function<void(Value*)> callback) {
    enqueueTask([this, key, callback]() {
        Value* result = search(key);
        if (callback) callback(result);
    });
}

template<typename Key, typename Value>
size_t NSplayTree<Key, Value>::size() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    return calculateSize(root_);
}

template<typename Key, typename Value>
size_t NSplayTree<Key, Value>::calculateSize(std::shared_ptr<Node> node) const {
    if (node == nullptr) return 0;
    return node->subtreeSize.load();
}

template<typename Key, typename Value>
int NSplayTree<Key, Value>::height() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    return calculateHeight(root_);
}

template<typename Key, typename Value>
int NSplayTree<Key, Value>::calculateHeight(std::shared_ptr<Node> node) const {
    if (node == nullptr) return 0;
    if (node->children.empty()) return 1;
    
    int maxChildHeight = 0;
    for (auto& child : node->children) {
        maxChildHeight = std::max(maxChildHeight, calculateHeight(child));
    }
    return 1 + maxChildHeight;
}

template<typename Key, typename Value>
double NSplayTree<Key, Value>::averageDepth() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    size_t treeSize = size();
    if (treeSize == 0) return 0.0;
    return calculateAverageDepth(root_, 0) / treeSize;
}

template<typename Key, typename Value>
double NSplayTree<Key, Value>::calculateAverageDepth(std::shared_ptr<Node> node, 
                                                     int depth) const {
    if (node == nullptr) return 0.0;
    
    double total = depth;
    for (auto& child : node->children) {
        total += calculateAverageDepth(child, depth + 1);
    }
    
    return total;
}

template<typename Key, typename Value>
void NSplayTree<Key, Value>::setMaxBranching(int maxBranch) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    maxBranching_ = maxBranch;
}

template<typename Key, typename Value>
typename NSplayTree<Key, Value>::TreeSnapshot NSplayTree<Key, Value>::getSnapshot() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    TreeSnapshot snapshot;
    
    std::map<std::shared_ptr<Node>, size_t> nodeToIndex;
    
    std::function<void(std::shared_ptr<Node>)> assignIndices = 
        [&](std::shared_ptr<Node> node) {
            if (node == nullptr) return;
            nodeToIndex[node] = snapshot.nodes.size();
            typename TreeSnapshot::NodeInfo info;
            info.key = node->key;
            info.value = node->value;
            info.accessCount = node->accessCount.load();
            info.subtreeSize = node->subtreeSize.load();
            info.maxChildren = node->maxChildren;
            snapshot.nodes.push_back(info);
            
            for (auto& child : node->children) {
                assignIndices(child);
            }
        };
    
    assignIndices(root_);
    
    std::function<void(std::shared_ptr<Node>, size_t)> buildEdges = 
        [&](std::shared_ptr<Node> node, size_t parentIndex) {
            if (node == nullptr) return;
            
            size_t nodeIndex = nodeToIndex[node];
            
            if (parentIndex != SIZE_MAX) {
                snapshot.edges.push_back({parentIndex, nodeIndex});
            }
            
            for (auto& child : node->children) {
                snapshot.nodes[nodeIndex].childIndices.push_back(nodeToIndex[child]);
                buildEdges(child, nodeIndex);
            }
        };
    
    buildEdges(root_, SIZE_MAX);
    return snapshot;
}

// Explicit template instantiations
template class NSplayTree<int, int>;
template class NSplayTree<int, std::string>;
template class NSplayTree<RollingChecksum, BlockMetadata>;

#endif // NSPLAYTREE_TPP
