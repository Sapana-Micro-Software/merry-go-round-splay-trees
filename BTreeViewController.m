#import "BTreeViewController.h"

@interface BTreeViewController ()
@property (nonatomic, assign) BTreeHandle treeHandle;
@end

@implementation BTreeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Initialize B-Tree with default min degree of 3
    _treeHandle = btree_create(3);
    
    // Start worker threads
    btree_start_threads(_treeHandle, 4);
    
    // Set up tree view
    _treeView.treeHandle = _treeHandle;
    _treeView.autoRefresh = YES;
    _treeView.refreshInterval = 0.1;
    [_treeView startAutoRefresh];
    
    // Update status
    [self updateStatus];
}

- (void)dealloc {
    if (_treeHandle) {
        btree_stop_threads(_treeHandle);
        btree_destroy(_treeHandle);
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
    
    int result = btree_insert(_treeHandle, key, value);
    
    if (result) {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Inserted key: %d", key];
        _keyField.stringValue = @"";
        _valueField.stringValue = @"";
    } else {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Key %d already exists", key];
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
    int result = btree_remove(_treeHandle, key);
    
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
    const char* value = btree_search(_treeHandle, key);
    
    if (value) {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Found key %d: %s", key, value];
        _valueField.stringValue = [NSString stringWithUTF8String:value];
    } else {
        _statusLabel.stringValue = [NSString stringWithFormat:@"Key %d not found", key];
        _valueField.stringValue = @"";
    }
    
    [_treeView refreshTree];
}

- (IBAction)sortTree:(id)sender {
    // Note: Sort is synchronous in the current implementation
    // For async, we'd need to add callback support to the bridge
    _statusLabel.stringValue = @"Sorting tree...";
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        // In a real implementation, we'd call sortAsync with a callback
        // For now, we'll just refresh the view
        dispatch_async(dispatch_get_main_queue(), ^{
            self->_statusLabel.stringValue = @"Tree sorted (in-order traversal)";
            [self->_treeView refreshTree];
        });
    });
}

- (IBAction)setMinDegree:(id)sender {
    NSString* degreeText = _minDegreeField.stringValue;
    
    if (degreeText.length == 0) {
        return;
    }
    
    int degree = [degreeText intValue];
    if (degree < 2) {
        _statusLabel.stringValue = @"Error: Min degree must be at least 2";
        return;
    }
    
    btree_set_min_degree(_treeHandle, degree);
    _statusLabel.stringValue = [NSString stringWithFormat:@"Min degree set to %d", degree];
    [_treeView refreshTree];
}

- (void)updateStatus {
    int size = btree_size(_treeHandle);
    int height = btree_height(_treeHandle);
    _statusLabel.stringValue = [NSString stringWithFormat:@"Size: %d, Height: %d", size, height];
}

@end
