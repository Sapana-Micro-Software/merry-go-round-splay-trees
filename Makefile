CXX = clang++
OBJC = clang
CXXFLAGS = -std=c++17 -O2 -Wall -fPIC
OBJCFLAGS = -fobjc-arc
LDFLAGS = -framework Cocoa -framework QuartzCore

# Source files
CXX_SOURCES = BTree.cpp BTreeBridge.cpp NSplayTree.cpp NSplayTreeBridge.cpp
OBJC_SOURCES = BTreeView.m BTreeViewController.m main.m NSplayTreeView.m NSplayTreeViewController.m splay_main.m
CXX_OBJECTS = $(CXX_SOURCES:.cpp=.o)
OBJC_OBJECTS = $(OBJC_SOURCES:.m=.o)
OBJECTS = $(CXX_OBJECTS) $(OBJC_OBJECTS)

# Targets
TARGET = BTreeVisualizer
SPLAY_TARGET = NSplayTreeVisualizer

.PHONY: all clean splay

all: $(TARGET) $(SPLAY_TARGET)

$(TARGET): BTree.o BTreeBridge.o BTreeView.o BTreeViewController.o main.o
	$(CXX) $^ -o $(TARGET) $(LDFLAGS)

$(SPLAY_TARGET): NSplayTree.o NSplayTreeBridge.o NSplayTreeView.o NSplayTreeViewController.o splay_main.o
	$(CXX) $^ -o $(SPLAY_TARGET) $(LDFLAGS)

splay: $(SPLAY_TARGET)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

%.o: %.m
	$(OBJC) $(OBJCFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET) $(SPLAY_TARGET)

install: $(TARGET)
	cp $(TARGET) /usr/local/bin/
