#import <Cocoa/Cocoa.h>
#import "BTreeView.h"
#import "BTreeBridge.h"

@interface BTreeViewController : NSViewController

@property (nonatomic, strong) IBOutlet BTreeView* treeView;
@property (nonatomic, strong) IBOutlet NSTextField* keyField;
@property (nonatomic, strong) IBOutlet NSTextField* valueField;
@property (nonatomic, strong) IBOutlet NSTextField* minDegreeField;
@property (nonatomic, strong) IBOutlet NSTextField* statusLabel;
@property (nonatomic, strong) IBOutlet NSButton* insertButton;
@property (nonatomic, strong) IBOutlet NSButton* deleteButton;
@property (nonatomic, strong) IBOutlet NSButton* searchButton;
@property (nonatomic, strong) IBOutlet NSButton* sortButton;

- (IBAction)insertKey:(id)sender;
- (IBAction)deleteKey:(id)sender;
- (IBAction)searchKey:(id)sender;
- (IBAction)sortTree:(id)sender;
- (IBAction)setMinDegree:(id)sender;

@end
