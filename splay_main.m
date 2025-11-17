#import <Cocoa/Cocoa.h>
#import "NSplayTreeViewController.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication* app = [NSApplication sharedApplication];
        
        // Create window
        NSWindow* window = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 1400, 900)
                                                       styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskResizable
                                                         backing:NSBackingStoreBuffered
                                                           defer:NO];
        [window setTitle:@"Dynamic N-Way Splay Tree - Rsync Application"];
        [window center];
        
        // Create view controller
        NSplayTreeViewController* viewController = [[NSplayTreeViewController alloc] init];
        
        // Create main view
        NSView* contentView = [[NSView alloc] initWithFrame:window.contentView.bounds];
        contentView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
        
        // Create tree view
        NSplayTreeView* treeView = [[NSplayTreeView alloc] initWithFrame:NSMakeRect(220, 100, 1000, 700)];
        treeView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
        viewController.treeView = treeView;
        [contentView addSubview:treeView];
        
        // Create control panel
        NSView* controlPanel = [[NSView alloc] initWithFrame:NSMakeRect(20, 20, 180, 800)];
        controlPanel.autoresizingMask = NSViewMinXMargin | NSViewHeightSizable;
        
        // Key field
        NSTextField* keyLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 750, 160, 20)];
        keyLabel.stringValue = @"Key:";
        keyLabel.bezeled = NO;
        keyLabel.drawsBackground = NO;
        keyLabel.editable = NO;
        [controlPanel addSubview:keyLabel];
        
        NSTextField* keyField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 725, 160, 25)];
        viewController.keyField = keyField;
        [controlPanel addSubview:keyField];
        
        // Value field
        NSTextField* valueLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 690, 160, 20)];
        valueLabel.stringValue = @"Value:";
        valueLabel.bezeled = NO;
        valueLabel.drawsBackground = NO;
        valueLabel.editable = NO;
        [controlPanel addSubview:valueLabel];
        
        NSTextField* valueField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 665, 160, 25)];
        viewController.valueField = valueField;
        [controlPanel addSubview:valueField];
        
        // Buttons
        NSButton* insertButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 620, 160, 30)];
        [insertButton setTitle:@"Insert (Splay)"];
        [insertButton setTarget:viewController];
        [insertButton setAction:@selector(insertKey:)];
        viewController.insertButton = insertButton;
        [controlPanel addSubview:insertButton];
        
        NSButton* deleteButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 580, 160, 30)];
        [deleteButton setTitle:@"Delete"];
        [deleteButton setTarget:viewController];
        [deleteButton setAction:@selector(deleteKey:)];
        viewController.deleteButton = deleteButton;
        [controlPanel addSubview:deleteButton];
        
        NSButton* searchButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 540, 160, 30)];
        [searchButton setTitle:@"Search (Splay)"];
        [searchButton setTarget:viewController];
        [searchButton setAction:@selector(searchKey:)];
        viewController.searchButton = searchButton;
        [controlPanel addSubview:searchButton];
        
        // Branching controls
        NSTextField* initBranchLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 500, 160, 20)];
        initBranchLabel.stringValue = @"Initial Branching:";
        initBranchLabel.bezeled = NO;
        initBranchLabel.drawsBackground = NO;
        initBranchLabel.editable = NO;
        [controlPanel addSubview:initBranchLabel];
        
        NSTextField* initialBranchingField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 475, 160, 25)];
        initialBranchingField.stringValue = @"2";
        viewController.initialBranchingField = initialBranchingField;
        [controlPanel addSubview:initialBranchingField];
        
        NSTextField* maxBranchLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 440, 160, 20)];
        maxBranchLabel.stringValue = @"Max Branching:";
        maxBranchLabel.bezeled = NO;
        maxBranchLabel.drawsBackground = NO;
        maxBranchLabel.editable = NO;
        [controlPanel addSubview:maxBranchLabel];
        
        NSTextField* maxBranchingField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 415, 160, 25)];
        maxBranchingField.stringValue = @"16";
        viewController.maxBranchingField = maxBranchingField;
        [controlPanel addSubview:maxBranchingField];
        
        NSButton* updateBranchButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 375, 160, 30)];
        [updateBranchButton setTitle:@"Update Branching"];
        [updateBranchButton setTarget:viewController];
        [updateBranchButton setAction:@selector(updateBranching:)];
        [controlPanel addSubview:updateBranchButton];
        
        // Display options
        NSButton* showAccessCountsButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 330, 160, 25)];
        [showAccessCountsButton setButtonType:NSButtonTypeSwitch];
        [showAccessCountsButton setTitle:@"Show Access Counts"];
        [showAccessCountsButton setState:NSControlStateValueOn];
        [showAccessCountsButton setTarget:viewController];
        [showAccessCountsButton setAction:@selector(toggleShowAccessCounts:)];
        viewController.showAccessCountsButton = showAccessCountsButton;
        [controlPanel addSubview:showAccessCountsButton];
        
        NSButton* showSubtreeSizesButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 300, 160, 25)];
        [showSubtreeSizesButton setButtonType:NSButtonTypeSwitch];
        [showSubtreeSizesButton setTitle:@"Show Subtree Sizes"];
        [showSubtreeSizesButton setState:NSControlStateValueOff];
        [showSubtreeSizesButton setTarget:viewController];
        [showSubtreeSizesButton setAction:@selector(toggleShowSubtreeSizes:)];
        viewController.showSubtreeSizesButton = showSubtreeSizesButton;
        [controlPanel addSubview:showSubtreeSizesButton];
        
        NSButton* rsyncModeButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 260, 160, 30)];
        [rsyncModeButton setButtonType:NSButtonTypeSwitch];
        [rsyncModeButton setTitle:@"Rsync Mode"];
        [rsyncModeButton setState:NSControlStateValueOff];
        [rsyncModeButton setTarget:viewController];
        [rsyncModeButton setAction:@selector(toggleRsyncMode:)];
        viewController.rsyncModeButton = rsyncModeButton;
        [controlPanel addSubview:rsyncModeButton];
        
        // Status label
        NSTextField* statusLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 200, 160, 50)];
        statusLabel.stringValue = @"Ready";
        statusLabel.bezeled = NO;
        statusLabel.drawsBackground = NO;
        statusLabel.editable = NO;
        statusLabel.alignment = NSTextAlignmentCenter;
        [statusLabel setFont:[NSFont systemFontOfSize:10]];
        viewController.statusLabel = statusLabel;
        [controlPanel addSubview:statusLabel];
        
        [contentView addSubview:controlPanel];
        
        window.contentView = contentView;
        viewController.view = contentView;
        
        [viewController viewDidLoad];
        
        [window makeKeyAndOrderFront:nil];
        [app run];
    }
    return 0;
}
