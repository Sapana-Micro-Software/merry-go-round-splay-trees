#import "NSplayTreeViewController.h"

@interface NSplayTreeViewController ()
@property (nonatomic, assign) NSplayTreeHandle treeHandle;
@property (nonatomic, assign) BOOL rsyncMode;
@end

@implementation NSplayTreeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    int initialBranching = _initialBranchingField.stringValue.length > 0 
        ? [_initialBranchingField.stringValue intValue] : 2;
    int maxBranching = _maxBranchingField.stringValue.length > 0 
        ? [_maxBranchingField.stringValue intValue] : 16;
    
    if (initialBranching < 2) initialBranching = 2;
    if (maxBranching < initialBranching) maxBranching = initialBranching;
    
    _treeHandle = nsplaytree_create(initialBranching, maxBranching);
    _rsyncMode = NO;
    
    nsplaytree_start_threads(_treeHandle, 4);
    
    _treeView.treeHandle = _treeHandle;
    _treeView.autoRefresh = YES;
    _treeView.refreshInterval = 0.05;  // Faster refresh for splay tree
    _treeView.showAccessCounts = YES;
    _treeView.showSubtreeSizes = NO;
    [_treeView startAutoRefresh];
    
    [self updateStatus];
}

- (void)dealloc {
    if (_treeHandle) {
        nsplaytree_stop_threads(_treeHandle);
        nsplaytree_destroy(_treeHandle);
    }
}

- (IBAction)insertKey:(id)sender {
    NSString* keyText = _keyField.stringValue;
    NSString* valueText = _valueField.stringValue;
    
    if (keyText.length == 0) {
        _statusLabel.stringValue = @"Error: Please enter a key";
        return;
    }
    
    int key = [keyText intValue];
    const char* value = valueText.length > 0 ? [valueText UTF8String] : "";
    
    int result = nsplaytree_insert(_treeHandle, key, value);
    
    if (result) {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Inserted key: %d (splayed to root)", key];
        _keyField.stringValue = @"";
        _valueField.stringValue = @"";
    } else {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Updated key: %d (splayed to root)", key];
    }
    
    [self updateStatus];
    [_treeView refreshTree];
}

- (IBAction)deleteKey:(id)sender {
    NSString* keyText = _keyField.stringValue;
    
    if (keyText.length == 0) {
        _statusLabel.stringValue = @"Error: Please enter a key";
        return;
    }
    
    int key = [keyText intValue];
    int result = nsplaytree_remove(_treeHandle, key);
    
    if (result) {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Deleted key: %d", key];
        _keyField.stringValue = @"";
    } else {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Key %d not found", key];
    }
    
    [self updateStatus];
    [_treeView refreshTree];
}

- (IBAction)searchKey:(id)sender {
    NSString* keyText = _keyField.stringValue;
    
    if (keyText.length == 0) {
        _statusLabel.stringValue = @"Error: Please enter a key";
        return;
    }
    
    int key = [keyText intValue];
    const char* value = nsplaytree_search(_treeHandle, key);
    
    if (value) {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Found key %d: %s (splayed to root)", key, value];
        _valueField.stringValue = [NSString stringWithUTF8String:value];
    } else {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Key %d not found", key];
        _valueField.stringValue = @"";
    }
    
    [_treeView refreshTree];
}

- (IBAction)toggleRsyncMode:(id)sender {
    _rsyncMode = !_rsyncMode;
    _statusLabel.stringValue = _rsyncMode 
        ? @"Rsync mode enabled (block matching)" 
        : @"Normal mode";
}

- (IBAction)toggleShowAccessCounts:(id)sender {
    _treeView.showAccessCounts = !_treeView.showAccessCounts;
    [_treeView refreshTree];
}

- (IBAction)toggleShowSubtreeSizes:(id)sender {
    _treeView.showSubtreeSizes = !_treeView.showSubtreeSizes;
    [_treeView refreshTree];
}

- (IBAction)updateBranching:(id)sender {
    int maxBranch = [_maxBranchingField.stringValue intValue];
    if (maxBranch >= 2) {
        nsplaytree_set_max_branching(_treeHandle, maxBranch);
        _statusLabel.stringValue = [NSString stringWithFormat:@"Max branching set to %d", maxBranch];
        [_treeView refreshTree];
    }
}

- (void)updateStatus {
    int size = nsplaytree_size(_treeHandle);
    int height = nsplaytree_height(_treeHandle);
    double avgDepth = nsplaytree_average_depth(_treeHandle);
    int maxBranch = nsplaytree_get_max_branching(_treeHandle);
    
    _statusLabel.stringValue = [NSString stringWithFormat:
        @"Size: %d | Height: %d | Avg Depth: %.2f | Max Branch: %d", 
        size, height, avgDepth, maxBranch];
}

@end
