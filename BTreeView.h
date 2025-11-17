#import <Cocoa/Cocoa.h>
#import "BTreeBridge.h"

@interface BTreeView : NSView

@property (nonatomic, assign) BTreeHandle treeHandle;
@property (nonatomic, assign) BOOL autoRefresh;
@property (nonatomic, assign) NSTimeInterval refreshInterval;

- (void)refreshTree;
- (void)startAutoRefresh;
- (void)stopAutoRefresh;

@end
