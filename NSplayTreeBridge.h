/*
 * Copyright (C) 2025, Shyamal Suhana Chandra
 * All rights reserved.
 */

#ifndef NSPLAYTREEBRIDGE_H
#define NSPLAYTREEBRIDGE_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// C interface for Objective-C
typedef void* NSplayTreeHandle;

// Rsync-specific types
typedef struct {
    uint32_t a;
    uint32_t b;
    uint32_t value;
} RollingChecksumC;

typedef struct {
    RollingChecksumC checksum;
    uint32_t strongHash;
    size_t blockIndex;
    size_t blockSize;
    char* data;
} BlockMetadataC;

NSplayTreeHandle nsplaytree_create(int initialBranching, int maxBranching);
void nsplaytree_destroy(NSplayTreeHandle handle);

// Basic operations
int nsplaytree_insert(NSplayTreeHandle handle, int key, const char* value);
int nsplaytree_remove(NSplayTreeHandle handle, int key);
const char* nsplaytree_search(NSplayTreeHandle handle, int key);

// Rsync operations
int nsplaytree_insert_block(NSplayTreeHandle handle, const BlockMetadataC* block);
BlockMetadataC* nsplaytree_find_block(NSplayTreeHandle handle, const RollingChecksumC* checksum);
int nsplaytree_find_matching_blocks(NSplayTreeHandle handle, 
                                    const RollingChecksumC* checksum,
                                    uint32_t strongHash,
                                    BlockMetadataC** results,
                                    int* resultCount);

// Configuration
void nsplaytree_set_max_branching(NSplayTreeHandle handle, int maxBranch);
int nsplaytree_get_max_branching(NSplayTreeHandle handle);

// Thread management
void nsplaytree_start_threads(NSplayTreeHandle handle, int numThreads);
void nsplaytree_stop_threads(NSplayTreeHandle handle);

// Statistics
int nsplaytree_size(NSplayTreeHandle handle);
int nsplaytree_height(NSplayTreeHandle handle);
double nsplaytree_average_depth(NSplayTreeHandle handle);

// Snapshot for visualization
typedef struct {
    int* keys;
    char** values;
    int** childIndices;
    int* childCounts;
    int* accessCounts;
    int* subtreeSizes;
    int* maxChildren;
    int* edges;
    int nodeCount;
    int edgeCount;
} NSplayTreeSnapshot;

NSplayTreeSnapshot nsplaytree_get_snapshot(NSplayTreeHandle handle);
void nsplaytree_free_snapshot(NSplayTreeSnapshot snapshot);

#ifdef __cplusplus
}
#endif

#endif // NSPLAYTREEBRIDGE_H
