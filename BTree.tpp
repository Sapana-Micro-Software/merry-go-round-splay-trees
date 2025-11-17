#ifndef BTREE_TPP
#define BTREE_TPP

#include "BTree.h"
#include <algorithm>
#include <iostream>
#include <map>

template<typename Key, typename Value>
BTree<Key, Value>::BTree(int minDegree) 
    : minDegree_(minDegree), maxKeys_(2 * minDegree_ - 1), 
      root_(std::make_shared<Node>(maxKeys_, true)), running_(false) {
}

template<typename Key, typename Value>
BTree<Key, Value>::~BTree() {
    stopWorkerThreads();
}

template<typename Key, typename Value>
bool BTree<Key, Value>::insert(const Key& key, const Value& value) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    // Check if key already exists
    if (search(key) != nullptr) {
        return false;
    }
    
    // If root is full, split it
    if (root_->keys.size() == maxKeys_) {
        auto newRoot = std::make_shared<Node>(maxKeys_, false);
        newRoot->children.push_back(root_);
        root_->parent = newRoot;
        root_ = newRoot;
        splitChild(root_, 0);
    }
    
    insertNonFull(root_, key, value);
    return true;
}

template<typename Key, typename Value>
void BTree<Key, Value>::insertNonFull(std::shared_ptr<Node> node, 
                                      const Key& key, const Value& value) {
    int i = node->keys.size() - 1;
    
    if (node->isLeaf) {
        // Insert into leaf
        node->keys.push_back(Key());
        node->values.push_back(Value());
        
        while (i >= 0 && node->keys[i] > key) {
            node->keys[i + 1] = node->keys[i];
            node->values[i + 1] = node->values[i];
            i--;
        }
        
        node->keys[i + 1] = key;
        node->values[i + 1] = value;
    } else {
        // Find child to insert into
        while (i >= 0 && node->keys[i] > key) {
            i--;
        }
        i++;
        
        // If child is full, split it
        if (node->children[i]->keys.size() == maxKeys_) {
            splitChild(node, i);
            if (node->keys[i] < key) {
                i++;
            }
        }
        
        insertNonFull(node->children[i], key, value);
    }
}

template<typename Key, typename Value>
void BTree<Key, Value>::splitChild(std::shared_ptr<Node> parent, int index) {
    auto child = parent->children[index];
    auto newChild = std::make_shared<Node>(maxKeys_, child->isLeaf);
    
    // Move half of child's keys to new child
    int mid = minDegree_ - 1;
    newChild->keys.assign(child->keys.begin() + mid + 1, child->keys.end());
    newChild->values.assign(child->values.begin() + mid + 1, child->values.end());
    child->keys.resize(mid);
    child->values.resize(mid);
    
    if (!child->isLeaf) {
        newChild->children.assign(child->children.begin() + mid + 1, 
                                  child->children.end());
        child->children.resize(mid + 1);
        for (auto& c : newChild->children) {
            c->parent = newChild;
        }
    }
    
    // Move middle key to parent
    parent->keys.insert(parent->keys.begin() + index, child->keys[mid]);
    parent->values.insert(parent->values.begin() + index, child->values[mid]);
    child->keys.erase(child->keys.begin() + mid);
    child->values.erase(child->values.begin() + mid);
    
    parent->children.insert(parent->children.begin() + index + 1, newChild);
    newChild->parent = parent;
}

template<typename Key, typename Value>
Value* BTree<Key, Value>::search(const Key& key) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    auto node = root_;
    
    while (node != nullptr) {
        node->accessCount++;
        splayNode(node);
        
        int i = findKeyIndex(node->keys, key);
        
        if (i < node->keys.size() && node->keys[i] == key) {
            return &node->values[i];
        }
        
        if (node->isLeaf) {
            return nullptr;
        }
        
        if (i < node->keys.size() && node->keys[i] > key) {
            node = node->children[i];
        } else {
            node = node->children[i];
        }
    }
    
    return nullptr;
}

template<typename Key, typename Value>
int BTree<Key, Value>::findKeyIndex(const std::vector<Key>& keys, const Key& key) const {
    int i = 0;
    while (i < keys.size() && keys[i] < key) {
        i++;
    }
    return i;
}

template<typename Key, typename Value>
bool BTree<Key, Value>::remove(const Key& key) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    if (root_->keys.empty()) {
        return false;
    }
    
    bool result = removeFromNode(root_, key);
    
    // If root becomes empty and has a child, make child the new root
    if (root_->keys.empty() && !root_->isLeaf) {
        root_ = root_->children[0];
        root_->parent = nullptr;
    }
    
    return result;
}

template<typename Key, typename Value>
bool BTree<Key, Value>::removeFromNode(std::shared_ptr<Node> node, const Key& key) {
    int idx = findKeyIndex(node->keys, key);
    
    // Key found in this node
    if (idx < node->keys.size() && node->keys[idx] == key) {
        if (node->isLeaf) {
            // Simple removal from leaf
            node->keys.erase(node->keys.begin() + idx);
            node->values.erase(node->values.begin() + idx);
            return true;
        } else {
            // Key is in internal node
            if (node->children[idx]->keys.size() >= minDegree_) {
                // Replace with predecessor
                Key predKey = getPredecessor(node, idx);
                node->keys[idx] = predKey;
                return removeFromNode(node->children[idx], predKey);
            } else if (node->children[idx + 1]->keys.size() >= minDegree_) {
                // Replace with successor
                Key succKey = getSuccessor(node, idx);
                node->keys[idx] = succKey;
                return removeFromNode(node->children[idx + 1], succKey);
            } else {
                // Merge children
                mergeChildren(node, idx);
                return removeFromNode(node->children[idx], key);
            }
        }
    } else {
        // Key not in this node
        if (node->isLeaf) {
            return false;
        }
        
        bool flag = (idx == node->keys.size());
        
        if (node->children[idx]->keys.size() < minDegree_) {
            borrowFromSibling(node, idx);
        }
        
        if (flag && idx > node->keys.size()) {
            return removeFromNode(node->children[idx - 1], key);
        } else {
            return removeFromNode(node->children[idx], key);
        }
    }
}

template<typename Key, typename Value>
Key BTree<Key, Value>::getPredecessor(std::shared_ptr<Node> node, int index) {
    auto curr = node->children[index];
    while (!curr->isLeaf) {
        curr = curr->children[curr->children.size() - 1];
    }
    return curr->keys[curr->keys.size() - 1];
}

template<typename Key, typename Value>
Key BTree<Key, Value>::getSuccessor(std::shared_ptr<Node> node, int index) {
    auto curr = node->children[index + 1];
    while (!curr->isLeaf) {
        curr = curr->children[0];
    }
    return curr->keys[0];
}

template<typename Key, typename Value>
void BTree<Key, Value>::mergeChildren(std::shared_ptr<Node> parent, int index) {
    auto child = parent->children[index];
    auto sibling = parent->children[index + 1];
    
    // Move key from parent to child
    child->keys.push_back(parent->keys[index]);
    child->values.push_back(parent->values[index]);
    
    // Copy keys and values from sibling
    child->keys.insert(child->keys.end(), sibling->keys.begin(), sibling->keys.end());
    child->values.insert(child->values.end(), sibling->values.begin(), sibling->values.end());
    
    // Copy children if not leaf
    if (!child->isLeaf) {
        child->children.insert(child->children.end(), 
                              sibling->children.begin(), sibling->children.end());
        for (auto& c : sibling->children) {
            c->parent = child;
        }
    }
    
    // Remove key and sibling from parent
    parent->keys.erase(parent->keys.begin() + index);
    parent->values.erase(parent->values.begin() + index);
    parent->children.erase(parent->children.begin() + index + 1);
}

template<typename Key, typename Value>
void BTree<Key, Value>::borrowFromSibling(std::shared_ptr<Node> parent, int index) {
    auto node = parent->children[index];
    
    // Try to borrow from left sibling
    if (index != 0 && parent->children[index - 1]->keys.size() >= minDegree_) {
        auto sibling = parent->children[index - 1];
        
        node->keys.insert(node->keys.begin(), parent->keys[index - 1]);
        node->values.insert(node->values.begin(), parent->values[index - 1]);
        parent->keys[index - 1] = sibling->keys[sibling->keys.size() - 1];
        parent->values[index - 1] = sibling->values[sibling->values.size() - 1];
        sibling->keys.pop_back();
        sibling->values.pop_back();
        
        if (!node->isLeaf) {
            node->children.insert(node->children.begin(), 
                                 sibling->children[sibling->children.size() - 1]);
            sibling->children.pop_back();
            node->children[0]->parent = node;
        }
        return;
    }
    
    // Try to borrow from right sibling
    if (index != parent->children.size() - 1 && 
        parent->children[index + 1]->keys.size() >= minDegree_) {
        auto sibling = parent->children[index + 1];
        
        node->keys.push_back(parent->keys[index]);
        node->values.push_back(parent->values[index]);
        parent->keys[index] = sibling->keys[0];
        parent->values[index] = sibling->values[0];
        sibling->keys.erase(sibling->keys.begin());
        sibling->values.erase(sibling->values.begin());
        
        if (!node->isLeaf) {
            node->children.push_back(sibling->children[0]);
            sibling->children.erase(sibling->children.begin());
            node->children[node->children.size() - 1]->parent = node;
        }
        return;
    }
    
    // Merge with sibling
    if (index != 0) {
        mergeChildren(parent, index - 1);
    } else {
        mergeChildren(parent, index);
    }
}

template<typename Key, typename Value>
std::vector<std::pair<Key, Value>> BTree<Key, Value>::sort() {
    std::lock_guard<std::mutex> lock(treeMutex_);
    std::vector<std::pair<Key, Value>> result;
    inOrderTraversal(root_, result);
    return result;
}

template<typename Key, typename Value>
void BTree<Key, Value>::inOrderTraversal(std::shared_ptr<Node> node,
                                         std::vector<std::pair<Key, Value>>& result) const {
    if (node == nullptr) return;
    
    for (size_t i = 0; i < node->keys.size(); i++) {
        if (!node->isLeaf) {
            inOrderTraversal(node->children[i], result);
        }
        result.push_back({node->keys[i], node->values[i]});
    }
    
    if (!node->isLeaf) {
        inOrderTraversal(node->children[node->children.size() - 1], result);
    }
}

template<typename Key, typename Value>
void BTree<Key, Value>::splayNode(std::shared_ptr<Node> node) {
    // Splay-like optimization: promote frequently accessed nodes
    // In a B-Tree, we can't easily rotate, but we can promote keys
    // to parent nodes if they're accessed frequently
    if (node->accessCount > 10 && node->parent != nullptr) {
        promoteNode(node);
    }
}

template<typename Key, typename Value>
void BTree<Key, Value>::promoteNode(std::shared_ptr<Node> node) {
    // Simple promotion: if a node is accessed frequently,
    // we could potentially restructure, but for B-Tree this is complex
    // For now, we just reset the access count after promotion attempt
    node->accessCount = 0;
}

template<typename Key, typename Value>
void BTree<Key, Value>::startWorkerThreads(int numThreads) {
    if (running_) {
        return;
    }
    
    running_ = true;
    for (int i = 0; i < numThreads; i++) {
        workerThreads_.emplace_back(&BTree::workerThread, this);
    }
}

template<typename Key, typename Value>
void BTree<Key, Value>::stopWorkerThreads() {
    if (!running_) {
        return;
    }
    
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
void BTree<Key, Value>::workerThread() {
    while (running_) {
        std::unique_lock<std::mutex> lock(queueMutex_);
        queueCondition_.wait(lock, [this] { 
            return !taskQueue_.empty() || !running_; 
        });
        
        if (!running_ && taskQueue_.empty()) {
            break;
        }
        
        if (!taskQueue_.empty()) {
            auto task = taskQueue_.front();
            taskQueue_.pop();
            lock.unlock();
            
            task();
        }
    }
}

template<typename Key, typename Value>
void BTree<Key, Value>::enqueueTask(std::function<void()> task) {
    std::lock_guard<std::mutex> lock(queueMutex_);
    taskQueue_.push(task);
    queueCondition_.notify_one();
}

template<typename Key, typename Value>
void BTree<Key, Value>::insertAsync(const Key& key, const Value& value,
                                    std::function<void(bool)> callback) {
    enqueueTask([this, key, value, callback]() {
        bool result = insert(key, value);
        if (callback) {
            callback(result);
        }
    });
}

template<typename Key, typename Value>
void BTree<Key, Value>::deleteAsync(const Key& key,
                                   std::function<void(bool)> callback) {
    enqueueTask([this, key, callback]() {
        bool result = remove(key);
        if (callback) {
            callback(result);
        }
    });
}

template<typename Key, typename Value>
void BTree<Key, Value>::searchAsync(const Key& key,
                                    std::function<void(Value*)> callback) {
    enqueueTask([this, key, callback]() {
        Value* result = search(key);
        if (callback) {
            callback(result);
        }
    });
}

template<typename Key, typename Value>
void BTree<Key, Value>::sortAsync(std::function<void(std::vector<std::pair<Key, Value>>)> callback) {
    enqueueTask([this, callback]() {
        auto result = sort();
        if (callback) {
            callback(result);
        }
    });
}

template<typename Key, typename Value>
size_t BTree<Key, Value>::size() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    return calculateSize(root_);
}

template<typename Key, typename Value>
size_t BTree<Key, Value>::calculateSize(std::shared_ptr<Node> node) const {
    if (node == nullptr) return 0;
    
    size_t count = node->keys.size();
    if (!node->isLeaf) {
        for (auto& child : node->children) {
            count += calculateSize(child);
        }
    }
    return count;
}

template<typename Key, typename Value>
int BTree<Key, Value>::height() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    return calculateHeight(root_);
}

template<typename Key, typename Value>
int BTree<Key, Value>::calculateHeight(std::shared_ptr<Node> node) const {
    if (node == nullptr) return 0;
    if (node->isLeaf) return 1;
    
    int maxChildHeight = 0;
    for (auto& child : node->children) {
        maxChildHeight = std::max(maxChildHeight, calculateHeight(child));
    }
    return 1 + maxChildHeight;
}

template<typename Key, typename Value>
void BTree<Key, Value>::setMinDegree(int degree) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    if (degree < 2) degree = 2;
    minDegree_ = degree;
    maxKeys_ = 2 * degree - 1;
    // Note: This doesn't restructure existing tree
    // For full restructuring, you'd need to rebuild the tree
}

template<typename Key, typename Value>
typename BTree<Key, Value>::TreeSnapshot BTree<Key, Value>::getSnapshot() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    TreeSnapshot snapshot;
    
    // First pass: assign indices to all nodes
    std::map<std::shared_ptr<Node>, size_t> nodeToIndex;
    std::function<void(std::shared_ptr<Node>)> assignIndices = 
        [&](std::shared_ptr<Node> node) {
            if (node == nullptr) return;
            nodeToIndex[node] = snapshot.nodes.size();
            typename TreeSnapshot::NodeInfo info;
            info.keys = node->keys;
            info.values = node->values;
            info.isLeaf = node->isLeaf;
            info.accessCount = node->accessCount.load();
            snapshot.nodes.push_back(info);
            
            if (!node->isLeaf) {
                for (auto& child : node->children) {
                    assignIndices(child);
                }
            }
        };
    
    assignIndices(root_);
    
    // Second pass: build edges and child indices
    std::function<void(std::shared_ptr<Node>, size_t)> buildEdges = 
        [&](std::shared_ptr<Node> node, size_t parentIndex) {
            if (node == nullptr) return;
            
            size_t nodeIndex = nodeToIndex[node];
            
            if (parentIndex != SIZE_MAX) {
                snapshot.edges.push_back({parentIndex, nodeIndex});
            }
            
            if (!node->isLeaf) {
                for (size_t i = 0; i < node->children.size(); i++) {
                    snapshot.nodes[nodeIndex].childIndices.push_back(nodeToIndex[node->children[i]]);
                    buildEdges(node->children[i], nodeIndex);
                }
            }
        };
    
    buildEdges(root_, SIZE_MAX);
    return snapshot;
}

#endif // BTREE_TPP
