// Explicit template instantiations
#include "BTree.h"

template class BTree<int, int>;
template class BTree<int, std::string>;
template class BTree<std::string, int>;
template class BTree<std::string, std::string>;
