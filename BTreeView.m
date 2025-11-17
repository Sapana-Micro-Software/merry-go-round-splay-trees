#import "BTreeView.h"
#import <QuartzCore/QuartzCore.h>

@implementation BTreeView {
    NSTimer* _refreshTimer;
    NSMutableArray* _nodePositions;
    NSMutableArray* _nodeRects;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        _autoRefresh = NO;
        _refreshInterval = 0.1;
        _nodePositions = [NSMutableArray array];
        _nodeRects = [NSMutableArray array];
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
    
    BTreeSnapshot snapshot = btree_get_snapshot(_treeHandle);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->_nodePositions removeAllObjects];
        [self->_nodeRects removeAllObjects];
        
        if (snapshot.nodeCount == 0) {
            btree_free_snapshot(snapshot);
            [self setNeedsDisplay:YES];
            return;
        }
        
        // Calculate node positions using level-order layout
        NSMutableArray* levelNodes = [NSMutableArray array];
        NSMutableArray* currentLevel = [NSMutableArray array];
        
        if (snapshot.nodeCount > 0) {
            [currentLevel addObject:@0]; // Root node
        }
        
        while (currentLevel.count > 0) {
            [levelNodes addObject:[currentLevel copy]];
            NSMutableArray* nextLevel = [NSMutableArray array];
            
            for (NSNumber* nodeIdx in currentLevel) {
                int idx = [nodeIdx intValue];
                if (!snapshot.isLeaf[idx] && snapshot.childCounts[idx] > 0) {
                    for (int i = 0; i < snapshot.childCounts[idx]; i++) {
                        [nextLevel addObject:@(snapshot.childIndices[idx][i])];
                    }
                }
            }
            
            currentLevel = nextLevel;
        }
        
        // Calculate positions
        CGFloat nodeWidth = 120.0;
        CGFloat nodeHeight = 60.0;
        CGFloat horizontalSpacing = 20.0;
        CGFloat verticalSpacing = 80.0;
        
        CGFloat startY = self.bounds.size.height - 50.0;
        
        for (NSInteger level = 0; level < levelNodes.count; level++) {
            NSArray* nodes = levelNodes[level];
            CGFloat levelWidth = nodes.count * nodeWidth + (nodes.count - 1) * horizontalSpacing;
            CGFloat startX = (self.bounds.size.width - levelWidth) / 2.0;
            
            for (NSInteger i = 0; i < nodes.count; i++) {
                int nodeIdx = [nodes[i] intValue];
                CGFloat x = startX + i * (nodeWidth + horizontalSpacing);
                CGFloat y = startY - level * (nodeHeight + verticalSpacing);
                
                NSRect rect = NSMakeRect(x, y, nodeWidth, nodeHeight);
                [_nodeRects addObject:[NSValue valueWithRect:rect]];
                [_nodePositions addObject:@(nodeIdx)];
            }
        }
        
        btree_free_snapshot(snapshot);
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
    
    BTreeSnapshot snapshot = btree_get_snapshot(_treeHandle);
    
    // Draw edges first
    [[NSColor lightGrayColor] setStroke];
    NSBezierPath* edgePath = [NSBezierPath bezierPath];
    [edgePath setLineWidth:1.0];
    
    for (int i = 0; i < snapshot.edgeCount; i++) {
        int parentIdx = snapshot.edges[i * 2];
        int childIdx = snapshot.edges[i * 2 + 1];
        
        NSInteger parentPos = [_nodePositions indexOfObject:@(parentIdx)];
        NSInteger childPos = [_nodePositions indexOfObject:@(childIdx)];
        
        if (parentPos != NSNotFound && childPos != NSNotFound) {
            NSRect parentRect = [_nodeRects[parentPos] rectValue];
            NSRect childRect = [_nodeRects[childPos] rectValue];
            
            NSPoint parentPoint = NSMakePoint(
                NSMidX(parentRect),
                NSMinY(parentRect)
            );
            NSPoint childPoint = NSMakePoint(
                NSMidX(childRect),
                NSMaxY(childRect)
            );
            
            [edgePath moveToPoint:parentPoint];
            [edgePath lineToPoint:childPoint];
        }
    }
    [edgePath stroke];
    
    // Draw nodes
    for (NSInteger i = 0; i < _nodeRects.count; i++) {
        NSRect rect = [_nodeRects[i] rectValue];
        int nodeIdx = [_nodePositions[i] intValue];
        
        // Node background
        NSColor* nodeColor = snapshot.isLeaf[nodeIdx] 
            ? [NSColor colorWithRed:0.9 green:0.95 blue:1.0 alpha:1.0]
            : [NSColor colorWithRed:1.0 green:0.95 blue:0.9 alpha:1.0];
        [nodeColor setFill];
        [[NSColor blackColor] setStroke];
        
        NSBezierPath* nodePath = [NSBezierPath bezierPathWithRoundedRect:rect 
                                                                  xRadius:8.0 
                                                                  yRadius:8.0];
        [nodePath fill];
        [nodePath setLineWidth:2.0];
        [nodePath stroke];
        
        // Draw keys
        NSMutableString* keyText = [NSMutableString string];
        for (int j = 0; j < snapshot.keyCounts[nodeIdx]; j++) {
            if (j > 0) [keyText appendString:@", "];
            [keyText appendFormat:@"%d", snapshot.keys[nodeIdx][j]];
        }
        
        NSDictionary* textAttributes = @{
            NSFontAttributeName: [NSFont systemFontOfSize:11],
            NSForegroundColorAttributeName: [NSColor blackColor]
        };
        
        NSSize textSize = [keyText sizeWithAttributes:textAttributes];
        NSPoint textPoint = NSMakePoint(
            NSMidX(rect) - textSize.width / 2.0,
            NSMidY(rect) - textSize.height / 2.0
        );
        
        [keyText drawAtPoint:textPoint withAttributes:textAttributes];
        
        // Access count indicator
        if (snapshot.accessCount[nodeIdx] > 0) {
            NSString* accessText = [NSString stringWithFormat:@"#%d", snapshot.accessCount[nodeIdx]];
            NSDictionary* accessAttributes = @{
                NSFontAttributeName: [NSFont systemFontOfSize:9],
                NSForegroundColorAttributeName: [NSColor blueColor]
            };
            NSSize accessSize = [accessText sizeWithAttributes:accessAttributes];
            NSPoint accessPoint = NSMakePoint(
                NSMaxX(rect) - accessSize.width - 5,
                NSMinY(rect) + 5
            );
            [accessText drawAtPoint:accessPoint withAttributes:accessAttributes];
        }
    }
    
    btree_free_snapshot(snapshot);
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
