#ifndef BTREEBRIDGE_H
#define BTREEBRIDGE_H

#ifdef __cplusplus
extern "C" {
#endif

// C interface for Objective-C
typedef void* BTreeHandle;

BTreeHandle btree_create(int minDegree);
void btree_destroy(BTreeHandle handle);
int btree_insert(BTreeHandle handle, int key, const char* value);
int btree_remove(BTreeHandle handle, int key);
const char* btree_search(BTreeHandle handle, int key);
void btree_start_threads(BTreeHandle handle, int numThreads);
void btree_stop_threads(BTreeHandle handle);
int btree_size(BTreeHandle handle);
int btree_height(BTreeHandle handle);
void btree_set_min_degree(BTreeHandle handle, int degree);

// Snapshot for visualization
typedef struct {
    int** keys;           // Array of arrays: keys[i] is keys for node i
    char*** values;       // Array of arrays: values[i] is values for node i
    int** childIndices;   // Array of arrays: childIndices[i] is children for node i
    int* keyCounts;       // Number of keys per node
    int* childCounts;     // Number of children per node
    int* isLeaf;          // Is leaf flag per node
    int* accessCount;     // Access count per node
    int* edges;           // Flat array: [parent1, child1, parent2, child2, ...]
    int nodeCount;
    int edgeCount;
} BTreeSnapshot;

BTreeSnapshot btree_get_snapshot(BTreeHandle handle);
void btree_free_snapshot(BTreeSnapshot snapshot);

#ifdef __cplusplus
}
#endif

#endif // BTREEBRIDGE_H
