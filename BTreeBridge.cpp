#include "BTreeBridge.h"
#include "BTree.h"
#include <string>
#include <map>
#include <cstring>

extern "C" {

struct BTreeWrapper {
    BTree<int, std::string>* tree;
    std::map<int, std::string> valueCache; // Cache for returned strings
    
    BTreeWrapper(int minDegree) : tree(new BTree<int, std::string>(minDegree)) {}
    ~BTreeWrapper() {
        if (tree) {
            tree->stopWorkerThreads();
            delete tree;
        }
    }
};

BTreeHandle btree_create(int minDegree) {
    return new BTreeWrapper(minDegree);
}

void btree_destroy(BTreeHandle handle) {
    if (handle) {
        delete static_cast<BTreeWrapper*>(handle);
    }
}

int btree_insert(BTreeHandle handle, int key, const char* value) {
    if (!handle) return 0;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    bool result = wrapper->tree->insert(key, std::string(value ? value : ""));
    return result ? 1 : 0;
}

int btree_remove(BTreeHandle handle, int key) {
    if (!handle) return 0;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    bool result = wrapper->tree->remove(key);
    return result ? 1 : 0;
}

const char* btree_search(BTreeHandle handle, int key) {
    if (!handle) return nullptr;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    std::string* result = wrapper->tree->search(key);
    if (result) {
        wrapper->valueCache[key] = *result;
        return wrapper->valueCache[key].c_str();
    }
    return nullptr;
}

void btree_start_threads(BTreeHandle handle, int numThreads) {
    if (!handle) return;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    wrapper->tree->startWorkerThreads(numThreads);
}

void btree_stop_threads(BTreeHandle handle) {
    if (!handle) return;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    wrapper->tree->stopWorkerThreads();
}

int btree_size(BTreeHandle handle) {
    if (!handle) return 0;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    return static_cast<int>(wrapper->tree->size());
}

int btree_height(BTreeHandle handle) {
    if (!handle) return 0;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    return wrapper->tree->height();
}

void btree_set_min_degree(BTreeHandle handle, int degree) {
    if (!handle) return;
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    wrapper->tree->setMinDegree(degree);
}

BTreeSnapshot btree_get_snapshot(BTreeHandle handle) {
    BTreeSnapshot snapshot = {0};
    if (!handle) return snapshot;
    
    BTreeWrapper* wrapper = static_cast<BTreeWrapper*>(handle);
    auto treeSnapshot = wrapper->tree->getSnapshot();
    
    snapshot.nodeCount = static_cast<int>(treeSnapshot.nodes.size());
    snapshot.edgeCount = static_cast<int>(treeSnapshot.edges.size());
    
    if (snapshot.nodeCount == 0) return snapshot;
    
    // Allocate memory for nodes
    snapshot.keys = new int*[snapshot.nodeCount];
    snapshot.values = new char**[snapshot.nodeCount];
    snapshot.childIndices = new int*[snapshot.nodeCount];
    snapshot.keyCounts = new int[snapshot.nodeCount];
    snapshot.childCounts = new int[snapshot.nodeCount];
    snapshot.isLeaf = new int[snapshot.nodeCount];
    snapshot.accessCount = new int[snapshot.nodeCount];
    
    for (int i = 0; i < snapshot.nodeCount; i++) {
        snapshot.keyCounts[i] = static_cast<int>(treeSnapshot.nodes[i].keys.size());
        snapshot.childCounts[i] = static_cast<int>(treeSnapshot.nodes[i].childIndices.size());
        
        snapshot.keys[i] = new int[snapshot.keyCounts[i]];
        snapshot.values[i] = new char*[snapshot.keyCounts[i]];
        snapshot.childIndices[i] = new int[snapshot.childCounts[i]];
        
        for (int j = 0; j < snapshot.keyCounts[i]; j++) {
            snapshot.keys[i][j] = treeSnapshot.nodes[i].keys[j];
            std::string val = treeSnapshot.nodes[i].values[j];
            snapshot.values[i][j] = new char[val.length() + 1];
            strcpy(snapshot.values[i][j], val.c_str());
        }
        
        for (int j = 0; j < snapshot.childCounts[i]; j++) {
            snapshot.childIndices[i][j] = static_cast<int>(treeSnapshot.nodes[i].childIndices[j]);
        }
        
        snapshot.isLeaf[i] = treeSnapshot.nodes[i].isLeaf ? 1 : 0;
        snapshot.accessCount[i] = treeSnapshot.nodes[i].accessCount;
    }
    
    snapshot.edges = new int[snapshot.edgeCount * 2];
    for (int i = 0; i < snapshot.edgeCount; i++) {
        snapshot.edges[i * 2] = static_cast<int>(treeSnapshot.edges[i].first);
        snapshot.edges[i * 2 + 1] = static_cast<int>(treeSnapshot.edges[i].second);
    }
    
    return snapshot;
}

void btree_free_snapshot(BTreeSnapshot snapshot) {
    if (snapshot.nodeCount == 0) return;
    
    for (int i = 0; i < snapshot.nodeCount; i++) {
        delete[] snapshot.keys[i];
        for (int j = 0; j < snapshot.keyCounts[i]; j++) {
            delete[] snapshot.values[i][j];
        }
        delete[] snapshot.values[i];
        delete[] snapshot.childIndices[i];
    }
    
    delete[] snapshot.keys;
    delete[] snapshot.values;
    delete[] snapshot.childIndices;
    delete[] snapshot.keyCounts;
    delete[] snapshot.childCounts;
    delete[] snapshot.isLeaf;
    delete[] snapshot.accessCount;
    delete[] snapshot.edges;
}

} // extern "C"
