#include "NSplayTreeBridge.h"
#include "NSplayTree.h"
#include <string>
#include <map>
#include <cstring>
#include <vector>

extern "C" {

struct NSplayTreeWrapper {
    NSplayTree<int, std::string>* tree;
    NSplayTree<RollingChecksum, BlockMetadata>* rsyncTree;
    std::map<int, std::string> valueCache;
    bool isRsyncMode;
    
    NSplayTreeWrapper(int initialBranching, int maxBranching, bool rsync = false)
        : isRsyncMode(rsync) {
        if (rsync) {
            rsyncTree = new NSplayTree<RollingChecksum, BlockMetadata>(initialBranching, maxBranching);
            tree = nullptr;
        } else {
            tree = new NSplayTree<int, std::string>(initialBranching, maxBranching);
            rsyncTree = nullptr;
        }
    }
    
    ~NSplayTreeWrapper() {
        if (tree) {
            tree->stopWorkerThreads();
            delete tree;
        }
        if (rsyncTree) {
            rsyncTree->stopWorkerThreads();
            delete rsyncTree;
        }
    }
};

NSplayTreeHandle nsplaytree_create(int initialBranching, int maxBranching) {
    return new NSplayTreeWrapper(initialBranching, maxBranching, false);
}

void nsplaytree_destroy(NSplayTreeHandle handle) {
    if (handle) {
        delete static_cast<NSplayTreeWrapper*>(handle);
    }
}

int nsplaytree_insert(NSplayTreeHandle handle, int key, const char* value) {
    if (!handle) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (!wrapper->tree) return 0;
    
    bool result = wrapper->tree->insert(key, std::string(value ? value : ""));
    return result ? 1 : 0;
}

int nsplaytree_remove(NSplayTreeHandle handle, int key) {
    if (!handle) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (!wrapper->tree) return 0;
    
    bool result = wrapper->tree->remove(key);
    return result ? 1 : 0;
}

const char* nsplaytree_search(NSplayTreeHandle handle, int key) {
    if (!handle) return nullptr;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (!wrapper->tree) return nullptr;
    
    std::string* result = wrapper->tree->search(key);
    if (result) {
        wrapper->valueCache[key] = *result;
        return wrapper->valueCache[key].c_str();
    }
    return nullptr;
}

int nsplaytree_insert_block(NSplayTreeHandle handle, const BlockMetadataC* block) {
    if (!handle || !block) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    
    if (!wrapper->rsyncTree) {
        // Create rsync tree if needed
        wrapper->rsyncTree = new NSplayTree<RollingChecksum, BlockMetadata>(
            wrapper->tree ? 2 : 2, 16);
    }
    
    RollingChecksum cs(block->checksum.a, block->checksum.b);
    BlockMetadata bm(cs, block->strongHash, block->blockIndex, block->blockSize);
    if (block->data) {
        bm.data = std::string(block->data);
    }
    
    bool result = wrapper->rsyncTree->insert(cs, bm);
    return result ? 1 : 0;
}

BlockMetadataC* nsplaytree_find_block(NSplayTreeHandle handle, const RollingChecksumC* checksum) {
    if (!handle || !checksum) return nullptr;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (!wrapper->rsyncTree) return nullptr;
    
    RollingChecksum cs(checksum->a, checksum->b);
    BlockMetadata* result = wrapper->rsyncTree->findBlock(cs);
    
    if (result) {
        static BlockMetadataC cached;
        cached.checksum.a = result->checksum.a;
        cached.checksum.b = result->checksum.b;
        cached.checksum.value = result->checksum.value;
        cached.strongHash = result->strongHash;
        cached.blockIndex = result->blockIndex;
        cached.blockSize = result->blockSize;
        if (!result->data.empty()) {
            static char dataBuffer[1024];
            strncpy(dataBuffer, result->data.c_str(), sizeof(dataBuffer) - 1);
            dataBuffer[sizeof(dataBuffer) - 1] = '\0';
            cached.data = dataBuffer;
        } else {
            cached.data = nullptr;
        }
        return &cached;
    }
    return nullptr;
}

int nsplaytree_find_matching_blocks(NSplayTreeHandle handle,
                                    const RollingChecksumC* checksum,
                                    uint32_t strongHash,
                                    BlockMetadataC** results,
                                    int* resultCount) {
    if (!handle || !checksum || !results || !resultCount) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (!wrapper->rsyncTree) return 0;
    
    RollingChecksum cs(checksum->a, checksum->b);
    auto matches = wrapper->rsyncTree->findMatchingBlocks(cs, strongHash);
    
    *resultCount = static_cast<int>(matches.size());
    if (matches.empty()) {
        *results = nullptr;
        return 1;
    }
    
    static std::vector<BlockMetadataC> cachedResults;
    cachedResults.resize(matches.size());
    
    for (size_t i = 0; i < matches.size(); i++) {
        cachedResults[i].checksum.a = matches[i].checksum.a;
        cachedResults[i].checksum.b = matches[i].checksum.b;
        cachedResults[i].checksum.value = matches[i].checksum.value;
        cachedResults[i].strongHash = matches[i].strongHash;
        cachedResults[i].blockIndex = matches[i].blockIndex;
        cachedResults[i].blockSize = matches[i].blockSize;
        cachedResults[i].data = nullptr;
    }
    
    *results = cachedResults.data();
    return 1;
}

void nsplaytree_set_max_branching(NSplayTreeHandle handle, int maxBranch) {
    if (!handle) return;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        wrapper->tree->setMaxBranching(maxBranch);
    }
    if (wrapper->rsyncTree) {
        wrapper->rsyncTree->setMaxBranching(maxBranch);
    }
}

int nsplaytree_get_max_branching(NSplayTreeHandle handle) {
    if (!handle) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        return wrapper->tree->getMaxBranching();
    }
    if (wrapper->rsyncTree) {
        return wrapper->rsyncTree->getMaxBranching();
    }
    return 0;
}

void nsplaytree_start_threads(NSplayTreeHandle handle, int numThreads) {
    if (!handle) return;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        wrapper->tree->startWorkerThreads(numThreads);
    }
    if (wrapper->rsyncTree) {
        wrapper->rsyncTree->startWorkerThreads(numThreads);
    }
}

void nsplaytree_stop_threads(NSplayTreeHandle handle) {
    if (!handle) return;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        wrapper->tree->stopWorkerThreads();
    }
    if (wrapper->rsyncTree) {
        wrapper->rsyncTree->stopWorkerThreads();
    }
}

int nsplaytree_size(NSplayTreeHandle handle) {
    if (!handle) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        return static_cast<int>(wrapper->tree->size());
    }
    if (wrapper->rsyncTree) {
        return static_cast<int>(wrapper->rsyncTree->size());
    }
    return 0;
}

int nsplaytree_height(NSplayTreeHandle handle) {
    if (!handle) return 0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        return wrapper->tree->height();
    }
    if (wrapper->rsyncTree) {
        return wrapper->rsyncTree->height();
    }
    return 0;
}

double nsplaytree_average_depth(NSplayTreeHandle handle) {
    if (!handle) return 0.0;
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    if (wrapper->tree) {
        return wrapper->tree->averageDepth();
    }
    if (wrapper->rsyncTree) {
        return wrapper->rsyncTree->averageDepth();
    }
    return 0.0;
}

NSplayTreeSnapshot nsplaytree_get_snapshot(NSplayTreeHandle handle) {
    NSplayTreeSnapshot snapshot = {0};
    if (!handle) return snapshot;
    
    NSplayTreeWrapper* wrapper = static_cast<NSplayTreeWrapper*>(handle);
    
    if (wrapper->tree) {
        auto treeSnapshot = wrapper->tree->getSnapshot();
        
        snapshot.nodeCount = static_cast<int>(treeSnapshot.nodes.size());
        snapshot.edgeCount = static_cast<int>(treeSnapshot.edges.size());
        
        if (snapshot.nodeCount == 0) return snapshot;
        
        snapshot.keys = new int[snapshot.nodeCount];
        snapshot.values = new char*[snapshot.nodeCount];
        snapshot.childIndices = new int*[snapshot.nodeCount];
        snapshot.childCounts = new int[snapshot.nodeCount];
        snapshot.accessCounts = new int[snapshot.nodeCount];
        snapshot.subtreeSizes = new int[snapshot.nodeCount];
        snapshot.maxChildren = new int[snapshot.nodeCount];
        
        for (int i = 0; i < snapshot.nodeCount; i++) {
            snapshot.keys[i] = static_cast<int>(treeSnapshot.nodes[i].key);
            std::string val = treeSnapshot.nodes[i].value;
            snapshot.values[i] = new char[val.length() + 1];
            strcpy(snapshot.values[i], val.c_str());
            
            snapshot.childCounts[i] = static_cast<int>(treeSnapshot.nodes[i].childIndices.size());
            snapshot.childIndices[i] = new int[snapshot.childCounts[i]];
            for (int j = 0; j < snapshot.childCounts[i]; j++) {
                snapshot.childIndices[i][j] = static_cast<int>(treeSnapshot.nodes[i].childIndices[j]);
            }
            
            snapshot.accessCounts[i] = treeSnapshot.nodes[i].accessCount;
            snapshot.subtreeSizes[i] = treeSnapshot.nodes[i].subtreeSize;
            snapshot.maxChildren[i] = treeSnapshot.nodes[i].maxChildren;
        }
        
        snapshot.edges = new int[snapshot.edgeCount * 2];
        for (int i = 0; i < snapshot.edgeCount; i++) {
            snapshot.edges[i * 2] = static_cast<int>(treeSnapshot.edges[i].first);
            snapshot.edges[i * 2 + 1] = static_cast<int>(treeSnapshot.edges[i].second);
        }
    }
    
    return snapshot;
}

void nsplaytree_free_snapshot(NSplayTreeSnapshot snapshot) {
    if (snapshot.nodeCount == 0) return;
    
    for (int i = 0; i < snapshot.nodeCount; i++) {
        delete[] snapshot.values[i];
        delete[] snapshot.childIndices[i];
    }
    
    delete[] snapshot.keys;
    delete[] snapshot.values;
    delete[] snapshot.childIndices;
    delete[] snapshot.childCounts;
    delete[] snapshot.accessCounts;
    delete[] snapshot.subtreeSizes;
    delete[] snapshot.maxChildren;
    delete[] snapshot.edges;
}

} // extern "C"
