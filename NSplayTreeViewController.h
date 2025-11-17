#import <Cocoa/Cocoa.h>
#import "NSplayTreeView.h"
#import "NSplayTreeBridge.h"

@interface NSplayTreeViewController : NSViewController

@property (nonatomic, strong) IBOutlet NSplayTreeView* treeView;
@property (nonatomic, strong) IBOutlet NSTextField* keyField;
@property (nonatomic, strong) IBOutlet NSTextField* valueField;
@property (nonatomic, strong) IBOutlet NSTextField* initialBranchingField;
@property (nonatomic, strong) IBOutlet NSTextField* maxBranchingField;
@property (nonatomic, strong) IBOutlet NSTextField* statusLabel;
@property (nonatomic, strong) IBOutlet NSButton* insertButton;
@property (nonatomic, strong) IBOutlet NSButton* deleteButton;
@property (nonatomic, strong) IBOutlet NSButton* searchButton;
@property (nonatomic, strong) IBOutlet NSButton* rsyncModeButton;
@property (nonatomic, strong) IBOutlet NSButton* showAccessCountsButton;
@property (nonatomic, strong) IBOutlet NSButton* showSubtreeSizesButton;

- (IBAction)insertKey:(id)sender;
- (IBAction)deleteKey:(id)sender;
- (IBAction)searchKey:(id)sender;
- (IBAction)toggleRsyncMode:(id)sender;
- (IBAction)toggleShowAccessCounts:(id)sender;
- (IBAction)toggleShowSubtreeSizes:(id)sender;
- (IBAction)updateBranching:(id)sender;

@end
