#import <Cocoa/Cocoa.h>
#import "NSplayTreeBridge.h"

@interface NSplayTreeView : NSView

@property (nonatomic, assign) NSplayTreeHandle treeHandle;
@property (nonatomic, assign) BOOL autoRefresh;
@property (nonatomic, assign) NSTimeInterval refreshInterval;
@property (nonatomic, assign) BOOL showAccessCounts;
@property (nonatomic, assign) BOOL showSubtreeSizes;

- (void)refreshTree;
- (void)startAutoRefresh;
- (void)stopAutoRefresh;

@end
