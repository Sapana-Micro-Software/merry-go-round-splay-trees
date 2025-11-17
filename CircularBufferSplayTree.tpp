#ifndef CIRCULAR_BUFFER_SPLAY_TREE_TPP
#define CIRCULAR_BUFFER_SPLAY_TREE_TPP

#include "CircularBufferSplayTree.h"
#include <algorithm>
#include <cmath>
#include <sstream>
#include <iomanip>

template<typename Key, typename Value>
CircularBufferSplayTree<Key, Value>::CircularBufferSplayTree(
    size_t bufferSize, SortMode mode)
    : bufferSize_(bufferSize), currentSize_(0), nextIndex_(0),
      root_(nullptr), defaultSortMode_(mode) {
    circularBuffer_.resize(bufferSize_);
    
    // Default comparators
    lexicographicCmp_ = [](const Key& a, const Key& b) {
        if constexpr (std::is_convertible_v<Key, std::string>) {
            return std::string(a) < std::string(b);
        } else {
            std::ostringstream ossA, ossB;
            ossA << a;
            ossB << b;
            return ossA.str() < ossB.str();
        }
    };
    
    numericCmp_ = [](const Key& a, const Key& b) {
        return a < b;
    };
    
    semanticCmp_ = numericCmp_;  // Default to numeric
}

template<typename Key, typename Value>
CircularBufferSplayTree<Key, Value>::~CircularBufferSplayTree() {
    std::lock_guard<std::mutex> lock(treeMutex_);
    root_ = nullptr;
    circularBuffer_.clear();
}

template<typename Key, typename Value>
std::shared_ptr<typename CircularBufferSplayTree<Key, Value>::Node>
CircularBufferSplayTree<Key, Value>::allocateNode(const Key& key, const Value& value) {
    // Use circular buffer - overwrite oldest if full
    if (currentSize_ >= bufferSize_) {
        // Find and remove oldest node (LRU)
        // For simplicity, we'll use the next index
        if (circularBuffer_[nextIndex_] != nullptr) {
            deallocateNode(circularBuffer_[nextIndex_]);
        }
    } else {
        currentSize_++;
    }
    
    auto node = std::make_shared<Node>(key, value, nextIndex_);
    circularBuffer_[nextIndex_] = node;
    nextIndex_ = (nextIndex_ + 1) % bufferSize_;
    
    return node;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::deallocateNode(std::shared_ptr<Node> node) {
    if (node == nullptr) return;
    
    // Remove from tree structure
    if (node->parent != nullptr) {
        if (node->parent->left == node) {
            node->parent->left = nullptr;
        } else if (node->parent->right == node) {
            node->parent->right = nullptr;
        }
    }
    
    if (node == root_) {
        root_ = nullptr;
    }
    
    // Clear buffer slot
    if (node->bufferIndex < circularBuffer_.size()) {
        circularBuffer_[node->bufferIndex] = nullptr;
    }
    
    currentSize_--;
}

template<typename Key, typename Value>
bool CircularBufferSplayTree<Key, Value>::compareLess(const Key& a, const Key& b, SortMode mode) const {
    switch (mode) {
        case SortMode::LEXICOGRAPHIC:
            return lexicographicCmp_(a, b);
        case SortMode::NUMERIC:
            return numericCmp_(a, b);
        case SortMode::SEMANTIC:
            return semanticCmp_(a, b);
        default:
            return numericCmp_(a, b);
    }
}

template<typename Key, typename Value>
bool CircularBufferSplayTree<Key, Value>::compareEqual(const Key& a, const Key& b, SortMode mode) const {
    return !compareLess(a, b, mode) && !compareLess(b, a, mode);
}

template<typename Key, typename Value>
bool CircularBufferSplayTree<Key, Value>::insert(const Key& key, const Value& value) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    if (root_ == nullptr) {
        root_ = allocateNode(key, value);
        return true;
    }
    
    auto node = findNode(key);
    if (node && compareEqual(node->key, key, defaultSortMode_)) {
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
void CircularBufferSplayTree<Key, Value>::insertNode(
    std::shared_ptr<Node> node, const Key& key, const Value& value) {
    if (compareLess(key, node->key, defaultSortMode_)) {
        if (node->left == nullptr) {
            auto newNode = allocateNode(key, value);
            newNode->parent = node;
            node->left = newNode;
            updateSubtreeSize(node);
        } else {
            insertNode(node->left, key, value);
        }
    } else {
        if (node->right == nullptr) {
            auto newNode = allocateNode(key, value);
            newNode->parent = node;
            node->right = newNode;
            updateSubtreeSize(node);
        } else {
            insertNode(node->right, key, value);
        }
    }
}

template<typename Key, typename Value>
Value* CircularBufferSplayTree<Key, Value>::search(const Key& key) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    auto node = findNode(key);
    if (node && compareEqual(node->key, key, defaultSortMode_)) {
        node->accessCount++;
        splay(node);
        return &node->value;
    }
    
    return nullptr;
}

template<typename Key, typename Value>
std::shared_ptr<typename CircularBufferSplayTree<Key, Value>::Node>
CircularBufferSplayTree<Key, Value>::findNode(const Key& key) {
    return findNodeRecursive(root_, key);
}

template<typename Key, typename Value>
std::shared_ptr<typename CircularBufferSplayTree<Key, Value>::Node>
CircularBufferSplayTree<Key, Value>::findNodeRecursive(
    std::shared_ptr<Node> node, const Key& key) {
    if (node == nullptr) return nullptr;
    
    if (compareEqual(node->key, key, defaultSortMode_)) {
        return node;
    }
    
    if (compareLess(key, node->key, defaultSortMode_)) {
        return findNodeRecursive(node->left, key);
    } else {
        return findNodeRecursive(node->right, key);
    }
}

template<typename Key, typename Value>
bool CircularBufferSplayTree<Key, Value>::remove(const Key& key) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    
    auto node = findNode(key);
    if (node == nullptr || !compareEqual(node->key, key, defaultSortMode_)) {
        return false;
    }
    
    splay(node);
    removeNode(node);
    return true;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::removeNode(std::shared_ptr<Node> node) {
    if (node->left == nullptr && node->right == nullptr) {
        // Leaf node
        if (node->parent != nullptr) {
            if (node->parent->left == node) {
                node->parent->left = nullptr;
            } else {
                node->parent->right = nullptr;
            }
            updateSubtreeSize(node->parent);
        } else {
            root_ = nullptr;
        }
        deallocateNode(node);
    } else if (node->left == nullptr) {
        // Only right child
        if (node->parent != nullptr) {
            if (node->parent->left == node) {
                node->parent->left = node->right;
            } else {
                node->parent->right = node->right;
            }
            node->right->parent = node->parent;
            updateSubtreeSize(node->parent);
        } else {
            root_ = node->right;
            root_->parent = nullptr;
        }
        deallocateNode(node);
    } else if (node->right == nullptr) {
        // Only left child
        if (node->parent != nullptr) {
            if (node->parent->left == node) {
                node->parent->left = node->left;
            } else {
                node->parent->right = node->left;
            }
            node->left->parent = node->parent;
            updateSubtreeSize(node->parent);
        } else {
            root_ = node->left;
            root_->parent = nullptr;
        }
        deallocateNode(node);
    } else {
        // Two children - find successor
        auto successor = node->right;
        while (successor->left != nullptr) {
            successor = successor->left;
        }
        
        // Replace node with successor
        node->key = successor->key;
        node->value = successor->value;
        removeNode(successor);
    }
}

template<typename Key, typename Value>
std::vector<std::pair<Key, Value>>
CircularBufferSplayTree<Key, Value>::sort(SortOrder order, SortMode mode) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    std::vector<std::pair<Key, Value>> result;
    inOrderHelper(root_, result, order, mode);
    return result;
}

template<typename Key, typename Value>
std::vector<std::pair<Key, Value>>
CircularBufferSplayTree<Key, Value>::sortAscending(SortMode mode) {
    return sort(SortOrder::ASCENDING, mode);
}

template<typename Key, typename Value>
std::vector<std::pair<Key, Value>>
CircularBufferSplayTree<Key, Value>::sortDescending(SortMode mode) {
    return sort(SortOrder::DESCENDING, mode);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::inOrderHelper(
    std::shared_ptr<Node> node,
    std::vector<std::pair<Key, Value>>& result,
    SortOrder order,
    SortMode mode) const {
    if (node == nullptr) return;
    
    if (order == SortOrder::ASCENDING) {
        inOrderHelper(node->left, result, order, mode);
        result.push_back({node->key, node->value});
        inOrderHelper(node->right, result, order, mode);
    } else {
        inOrderHelper(node->right, result, order, mode);
        result.push_back({node->key, node->value});
        inOrderHelper(node->left, result, order, mode);
    }
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::splay(std::shared_ptr<Node> node) {
    if (node == nullptr || node == root_) return;
    
    while (node->parent != nullptr) {
        auto parent = node->parent;
        auto grandparent = parent->parent;
        
        if (grandparent == nullptr) {
            // Zig or Zag
            if (parent->left == node) {
                zig(node);
            } else {
                zag(node);
            }
        } else {
            if (parent->left == node && grandparent->left == parent) {
                zigZig(node);
            } else if (parent->right == node && grandparent->right == parent) {
                zagZag(node);
            } else if (parent->left == node && grandparent->right == parent) {
                zigZag(node);
            } else {
                zagZig(node);
            }
        }
    }
    
    root_ = node;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::zig(std::shared_ptr<Node> node) {
    auto parent = node->parent;
    if (parent == nullptr) return;
    
    parent->left = node->right;
    if (node->right != nullptr) {
        node->right->parent = parent;
    }
    
    node->parent = parent->parent;
    if (parent->parent != nullptr) {
        if (parent->parent->left == parent) {
            parent->parent->left = node;
        } else {
            parent->parent->right = node;
        }
    }
    
    node->right = parent;
    parent->parent = node;
    
    updateSubtreeSize(parent);
    updateSubtreeSize(node);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::zag(std::shared_ptr<Node> node) {
    auto parent = node->parent;
    if (parent == nullptr) return;
    
    parent->right = node->left;
    if (node->left != nullptr) {
        node->left->parent = parent;
    }
    
    node->parent = parent->parent;
    if (parent->parent != nullptr) {
        if (parent->parent->left == parent) {
            parent->parent->left = node;
        } else {
            parent->parent->right = node;
        }
    }
    
    node->left = parent;
    parent->parent = node;
    
    updateSubtreeSize(parent);
    updateSubtreeSize(node);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::zigZig(std::shared_ptr<Node> node) {
    zig(node->parent);
    zig(node);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::zagZag(std::shared_ptr<Node> node) {
    zag(node->parent);
    zag(node);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::zigZag(std::shared_ptr<Node> node) {
    zig(node);
    zag(node);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::zagZig(std::shared_ptr<Node> node) {
    zag(node);
    zig(node);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::updateSubtreeSize(std::shared_ptr<Node> node) {
    if (node == nullptr) return;
    
    int size = 1;
    if (node->left != nullptr) {
        size += node->left->subtreeSize.load();
    }
    if (node->right != nullptr) {
        size += node->right->subtreeSize.load();
    }
    node->subtreeSize = size;
    
    if (node->parent != nullptr) {
        updateSubtreeSize(node->parent);
    }
}

template<typename Key, typename Value>
int CircularBufferSplayTree<Key, Value>::height() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    return calculateHeight(root_);
}

template<typename Key, typename Value>
int CircularBufferSplayTree<Key, Value>::calculateHeight(std::shared_ptr<Node> node) const {
    if (node == nullptr) return 0;
    return 1 + std::max(calculateHeight(node->left), calculateHeight(node->right));
}

template<typename Key, typename Value>
double CircularBufferSplayTree<Key, Value>::averageDepth() const {
    std::lock_guard<std::mutex> lock(treeMutex_);
    double sum = 0;
    int count = 0;
    calculateAverageDepth(root_, 0, sum, count);
    return count > 0 ? sum / count : 0;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::calculateAverageDepth(
    std::shared_ptr<Node> node, int depth, double& sum, int& count) const {
    if (node == nullptr) return;
    
    sum += depth;
    count++;
    calculateAverageDepth(node->left, depth + 1, sum, count);
    calculateAverageDepth(node->right, depth + 1, sum, count);
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::setLexicographicComparator(
    std::function<bool(const Key&, const Key&)> cmp) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    lexicographicCmp_ = cmp;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::setNumericComparator(
    std::function<bool(const Key&, const Key&)> cmp) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    numericCmp_ = cmp;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::setSemanticComparator(
    std::function<bool(const Key&, const Key&)> cmp) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    semanticCmp_ = cmp;
}

template<typename Key, typename Value>
void CircularBufferSplayTree<Key, Value>::setBufferSize(size_t size) {
    std::lock_guard<std::mutex> lock(treeMutex_);
    if (size < currentSize_) {
        // Need to remove excess nodes
        // For simplicity, we'll just update the size
        // In practice, you'd want to remove LRU nodes
    }
    bufferSize_ = size;
    circularBuffer_.resize(bufferSize_);
}

#endif // CIRCULAR_BUFFER_SPLAY_TREE_TPP
