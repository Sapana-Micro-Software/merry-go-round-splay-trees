cmake_minimum_required(VERSION 3.10)
project(BTreeVisualizer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_OBJC_STANDARD 11)
set(CMAKE_OBJC_STANDARD_REQUIRED ON)

# Find Cocoa framework (macOS)
find_library(COCOA_LIBRARY Cocoa)
find_library(QUARTZCORE_LIBRARY QuartzCore)

# C++ source files
set(CXX_SOURCES
    BTree.cpp
    BTreeBridge.cpp
)

# Objective-C source files
set(OBJC_SOURCES
    BTreeView.m
    BTreeViewController.m
    main.m
)

# Create object library for C++ files
add_library(btree_cpp OBJECT ${CXX_SOURCES})
target_include_directories(btree_cpp PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# Create executable
add_executable(${PROJECT_NAME} ${OBJC_SOURCES} $<TARGET_OBJECTS:btree_cpp>)

# Link frameworks
target_link_libraries(${PROJECT_NAME} 
    ${COCOA_LIBRARY}
    ${QUARTZCORE_LIBRARY}
)

# Compiler flags
target_compile_options(${PROJECT_NAME} PRIVATE
    $<$<COMPILE_LANGUAGE:CXX>:-Wall -Wextra -O2>
    $<$<COMPILE_LANGUAGE:OBJC>:-fobjc-arc>
)

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
