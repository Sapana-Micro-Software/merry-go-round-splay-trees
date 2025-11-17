#import "NSplayTreeView.h"
#import <QuartzCore/QuartzCore.h>

@implementation NSplayTreeView {
    NSTimer* _refreshTimer;
    NSMutableArray* _nodePositions;
    NSMutableArray* _nodeRects;
    NSMutableDictionary* _nodeInfo;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        _autoRefresh = NO;
        _refreshInterval = 0.1;
        _showAccessCounts = YES;
        _showSubtreeSizes = NO;
        _nodePositions = [NSMutableArray array];
        _nodeRects = [NSMutableArray array];
        _nodeInfo = [NSMutableDictionary dictionary];
        self.wantsLayer = YES;
        self.layer.backgroundColor = [[NSColor whiteColor] CGColor];
    }
    return self;
}

- (void)dealloc {
    [self stopAutoRefresh];
}

- (void)refreshTree {
    if (!_treeHandle) return;
    
    NSplayTreeSnapshot snapshot = nsplaytree_get_snapshot(_treeHandle);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->_nodePositions removeAllObjects];
        [self->_nodeRects removeAllObjects];
        [self->_nodeInfo removeAllObjects];
        
        if (snapshot.nodeCount == 0) {
            nsplaytree_free_snapshot(snapshot);
            [self setNeedsDisplay:YES];
            return;
        }
        
        // Build tree structure for layout
        NSMutableArray* levelNodes = [NSMutableArray array];
        NSMutableArray* currentLevel = [NSMutableArray array];
        
        if (snapshot.nodeCount > 0) {
            [currentLevel addObject:@0]; // Root
        }
        
        while (currentLevel.count > 0) {
            [levelNodes addObject:[currentLevel copy]];
            NSMutableArray* nextLevel = [NSMutableArray array];
            
            for (NSNumber* nodeIdx in currentLevel) {
                int idx = [nodeIdx intValue];
                if (snapshot.childCounts[idx] > 0) {
                    for (int i = 0; i < snapshot.childCounts[idx]; i++) {
                        [nextLevel addObject:@(snapshot.childIndices[idx][i])];
                    }
                }
            }
            
            currentLevel = nextLevel;
        }
        
        // Calculate positions (radial layout for splay tree)
        CGFloat nodeWidth = 100.0;
        CGFloat nodeHeight = 50.0;
        CGFloat horizontalSpacing = 30.0;
        CGFloat verticalSpacing = 100.0;
        
        CGFloat centerX = self.bounds.size.width / 2.0;
        CGFloat startY = self.bounds.size.height - 50.0;
        
        for (NSInteger level = 0; level < levelNodes.count; level++) {
            NSArray* nodes = levelNodes[level];
            
            if (level == 0) {
                // Root at center top
                int rootIdx = [nodes[0] intValue];
                NSRect rect = NSMakeRect(centerX - nodeWidth / 2.0, startY, nodeWidth, nodeHeight);
                [_nodeRects addObject:[NSValue valueWithRect:rect]];
                [_nodePositions addObject:@(rootIdx)];
                
                NSDictionary* info = @{
                    @"accessCount": @(snapshot.accessCounts[rootIdx]),
                    @"subtreeSize": @(snapshot.subtreeSizes[rootIdx]),
                    @"maxChildren": @(snapshot.maxChildren[rootIdx]),
                    @"childCount": @(snapshot.childCounts[rootIdx])
                };
                _nodeInfo[@(rootIdx)] = info;
            } else {
                // Children arranged around parent
                CGFloat levelWidth = nodes.count * nodeWidth + (nodes.count - 1) * horizontalSpacing;
                CGFloat startX = centerX - levelWidth / 2.0;
                
                for (NSInteger i = 0; i < nodes.count; i++) {
                    int nodeIdx = [nodes[i] intValue];
                    CGFloat x = startX + i * (nodeWidth + horizontalSpacing);
                    CGFloat y = startY - level * (nodeHeight + verticalSpacing);
                    
                    NSRect rect = NSMakeRect(x, y, nodeWidth, nodeHeight);
                    [_nodeRects addObject:[NSValue valueWithRect:rect]];
                    [_nodePositions addObject:@(nodeIdx)];
                    
                    NSDictionary* info = @{
                        @"accessCount": @(snapshot.accessCounts[nodeIdx]),
                        @"subtreeSize": @(snapshot.subtreeSizes[nodeIdx]),
                        @"maxChildren": @(snapshot.maxChildren[nodeIdx]),
                        @"childCount": @(snapshot.childCounts[nodeIdx])
                    };
                    _nodeInfo[@(nodeIdx)] = info;
                }
            }
        }
        
        nsplaytree_free_snapshot(snapshot);
        [self setNeedsDisplay:YES];
    });
}

- (void)drawRect:(NSRect)dirtyRect {
    [super drawRect:dirtyRect];
    
    if (!_treeHandle || _nodeRects.count == 0) {
        NSDictionary* attributes = @{
            NSFontAttributeName: [NSFont systemFontOfSize:18],
            NSForegroundColorAttributeName: [NSColor grayColor]
        };
        NSString* message = @"No tree data";
        NSSize textSize = [message sizeWithAttributes:attributes];
        NSPoint textPoint = NSMakePoint(
            (self.bounds.size.width - textSize.width) / 2.0,
            (self.bounds.size.height - textSize.height) / 2.0
        );
        [message drawAtPoint:textPoint withAttributes:attributes];
        return;
    }
    
    NSplayTreeSnapshot snapshot = nsplaytree_get_snapshot(_treeHandle);
    
    // Draw edges
    [[NSColor lightGrayColor] setStroke];
    NSBezierPath* edgePath = [NSBezierPath bezierPath];
    [edgePath setLineWidth:1.5];
    
    for (int i = 0; i < snapshot.edgeCount; i++) {
        int parentIdx = snapshot.edges[i * 2];
        int childIdx = snapshot.edges[i * 2 + 1];
        
        NSInteger parentPos = [_nodePositions indexOfObject:@(parentIdx)];
        NSInteger childPos = [_nodePositions indexOfObject:@(childIdx)];
        
        if (parentPos != NSNotFound && childPos != NSNotFound) {
            NSRect parentRect = [_nodeRects[parentPos] rectValue];
            NSRect childRect = [_nodeRects[childPos] rectValue];
            
            NSPoint parentPoint = NSMakePoint(NSMidX(parentRect), NSMinY(parentRect));
            NSPoint childPoint = NSMakePoint(NSMidX(childRect), NSMaxY(childRect));
            
            [edgePath moveToPoint:parentPoint];
            [edgePath lineToPoint:childPoint];
        }
    }
    [edgePath stroke];
    
    // Draw nodes
    for (NSInteger i = 0; i < _nodeRects.count; i++) {
        NSRect rect = [_nodeRects[i] rectValue];
        int nodeIdx = [_nodePositions[i] intValue];
        NSDictionary* info = _nodeInfo[@(nodeIdx)];
        
        // Color based on access count (hot nodes are brighter)
        int accessCount = [info[@"accessCount"] intValue];
        CGFloat intensity = MIN(1.0, 0.3 + (accessCount / 100.0));
        NSColor* nodeColor = [NSColor colorWithRed:intensity 
                                             green:0.8 
                                              blue:0.9 
                                             alpha:1.0];
        
        [nodeColor setFill];
        [[NSColor blackColor] setStroke];
        
        NSBezierPath* nodePath = [NSBezierPath bezierPathWithRoundedRect:rect 
                                                                  xRadius:6.0 
                                                                  yRadius:6.0];
        [nodePath fill];
        [nodePath setLineWidth:2.0];
        [nodePath stroke];
        
        // Draw key
        NSString* keyText = [NSString stringWithFormat:@"%d", snapshot.keys[nodeIdx]];
        NSDictionary* textAttributes = @{
            NSFontAttributeName: [NSFont boldSystemFontOfSize:12],
            NSForegroundColorAttributeName: [NSColor blackColor]
        };
        
        NSSize textSize = [keyText sizeWithAttributes:textAttributes];
        NSPoint textPoint = NSMakePoint(
            NSMidX(rect) - textSize.width / 2.0,
            NSMidY(rect) - textSize.height / 2.0 + 5
        );
        [keyText drawAtPoint:textPoint withAttributes:textAttributes];
        
        // Draw access count
        if (_showAccessCounts && accessCount > 0) {
            NSString* accessText = [NSString stringWithFormat:@"#%d", accessCount];
            NSDictionary* accessAttributes = @{
                NSFontAttributeName: [NSFont systemFontOfSize:8],
                NSForegroundColorAttributeName: [NSColor blueColor]
            };
            NSSize accessSize = [accessText sizeWithAttributes:accessAttributes];
            NSPoint accessPoint = NSMakePoint(
                NSMaxX(rect) - accessSize.width - 3,
                NSMinY(rect) + 3
            );
            [accessText drawAtPoint:accessPoint withAttributes:accessAttributes];
        }
        
        // Draw subtree size
        if (_showSubtreeSizes) {
            int subtreeSize = [info[@"subtreeSize"] intValue];
            NSString* sizeText = [NSString stringWithFormat:@"S:%d", subtreeSize];
            NSDictionary* sizeAttributes = @{
                NSFontAttributeName: [NSFont systemFontOfSize:8],
                NSForegroundColorAttributeName: [NSColor darkGrayColor]
            };
            NSSize sizeSize = [sizeText sizeWithAttributes:sizeAttributes];
            NSPoint sizePoint = NSMakePoint(
                NSMinX(rect) + 3,
                NSMinY(rect) + 3
            );
            [sizeText drawAtPoint:sizePoint withAttributes:sizeAttributes];
        }
        
        // Draw branching factor
        int maxChildren = [info[@"maxChildren"] intValue];
        int childCount = [info[@"childCount"] intValue];
        if (maxChildren > 2) {
            NSString* branchText = [NSString stringWithFormat:@"%d/%d", childCount, maxChildren];
            NSDictionary* branchAttributes = @{
                NSFontAttributeName: [NSFont systemFontOfSize:7],
                NSForegroundColorAttributeName: [NSColor purpleColor]
            };
            NSSize branchSize = [branchText sizeWithAttributes:branchAttributes];
            NSPoint branchPoint = NSMakePoint(
                NSMidX(rect) - branchSize.width / 2.0,
                NSMinY(rect) - 12
            );
            [branchText drawAtPoint:branchPoint withAttributes:branchAttributes];
        }
    }
    
    nsplaytree_free_snapshot(snapshot);
}

- (void)startAutoRefresh {
    if (_autoRefresh) return;
    _autoRefresh = YES;
    _refreshTimer = [NSTimer scheduledTimerWithTimeInterval:_refreshInterval
                                                     target:self
                                                   selector:@selector(refreshTree)
                                                   userInfo:nil
                                                    repeats:YES];
}

- (void)stopAutoRefresh {
    _autoRefresh = NO;
    if (_refreshTimer) {
        [_refreshTimer invalidate];
        _refreshTimer = nil;
    }
}

@end
