#import <Cocoa/Cocoa.h>
#import "BTreeViewController.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication* app = [NSApplication sharedApplication];
        
        // Create window
        NSWindow* window = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 1200, 800)
                                                       styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskResizable
                                                         backing:NSBackingStoreBuffered
                                                           defer:NO];
        [window setTitle:@"B-Tree with Splay Optimization"];
        [window center];
        
        // Create view controller
        BTreeViewController* viewController = [[BTreeViewController alloc] init];
        
        // Create main view
        NSView* contentView = [[NSView alloc] initWithFrame:window.contentView.bounds];
        contentView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
        
        // Create tree view
        BTreeView* treeView = [[BTreeView alloc] initWithFrame:NSMakeRect(200, 100, 800, 600)];
        treeView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
        viewController.treeView = treeView;
        [contentView addSubview:treeView];
        
        // Create control panel
        NSView* controlPanel = [[NSView alloc] initWithFrame:NSMakeRect(20, 20, 160, 700)];
        controlPanel.autoresizingMask = NSViewMinXMargin | NSViewHeightSizable;
        
        // Key field
        NSTextField* keyLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 650, 140, 20)];
        keyLabel.stringValue = @"Key:";
        keyLabel.bezeled = NO;
        keyLabel.drawsBackground = NO;
        keyLabel.editable = NO;
        [controlPanel addSubview:keyLabel];
        
        NSTextField* keyField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 625, 140, 25)];
        viewController.keyField = keyField;
        [controlPanel addSubview:keyField];
        
        // Value field
        NSTextField* valueLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 590, 140, 20)];
        valueLabel.stringValue = @"Value:";
        valueLabel.bezeled = NO;
        valueLabel.drawsBackground = NO;
        valueLabel.editable = NO;
        [controlPanel addSubview:valueLabel];
        
        NSTextField* valueField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 565, 140, 25)];
        viewController.valueField = valueField;
        [controlPanel addSubview:valueField];
        
        // Buttons
        NSButton* insertButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 520, 140, 30)];
        [insertButton setTitle:@"Insert"];
        [insertButton setTarget:viewController];
        [insertButton setAction:@selector(insertKey:)];
        viewController.insertButton = insertButton;
        [controlPanel addSubview:insertButton];
        
        NSButton* deleteButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 480, 140, 30)];
        [deleteButton setTitle:@"Delete"];
        [deleteButton setTarget:viewController];
        [deleteButton setAction:@selector(deleteKey:)];
        viewController.deleteButton = deleteButton;
        [controlPanel addSubview:deleteButton];
        
        NSButton* searchButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 440, 140, 30)];
        [searchButton setTitle:@"Search"];
        [searchButton setTarget:viewController];
        [searchButton setAction:@selector(searchKey:)];
        viewController.searchButton = searchButton;
        [controlPanel addSubview:searchButton];
        
        NSButton* sortButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 400, 140, 30)];
        [sortButton setTitle:@"Sort"];
        [sortButton setTarget:viewController];
        [sortButton setAction:@selector(sortTree:)];
        viewController.sortButton = sortButton;
        [controlPanel addSubview:sortButton];
        
        // Min degree field
        NSTextField* degreeLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 360, 140, 20)];
        degreeLabel.stringValue = @"Min Degree:";
        degreeLabel.bezeled = NO;
        degreeLabel.drawsBackground = NO;
        degreeLabel.editable = NO;
        [controlPanel addSubview:degreeLabel];
        
        NSTextField* minDegreeField = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 335, 140, 25)];
        minDegreeField.stringValue = @"3";
        viewController.minDegreeField = minDegreeField;
        [controlPanel addSubview:minDegreeField];
        
        NSButton* setDegreeButton = [[NSButton alloc] initWithFrame:NSMakeRect(10, 300, 140, 30)];
        [setDegreeButton setTitle:@"Set Min Degree"];
        [setDegreeButton setTarget:viewController];
        [setDegreeButton setAction:@selector(setMinDegree:)];
        [controlPanel addSubview:setDegreeButton];
        
        // Status label
        NSTextField* statusLabel = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 250, 140, 40)];
        statusLabel.stringValue = @"Ready";
        statusLabel.bezeled = NO;
        statusLabel.drawsBackground = NO;
        statusLabel.editable = NO;
        statusLabel.alignment = NSTextAlignmentCenter;
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
