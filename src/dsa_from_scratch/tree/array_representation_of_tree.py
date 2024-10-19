class ArrayBinaryTree:
    """Array-based binary tree class (1-indexed)"""

    def __init__(self, arr: list[int | None]):
        """Constructor that initializes a 1-indexed binary tree"""
        # Insert a placeholder at the beginning to make it 1-indexed
        self._tree = [0] + list(
            arr
        )  # may not need to convert to list if the input is None

    def size(self):
        """List capacity"""
        return len(self._tree)

    def val(self, i: int) -> int | None:
        """Get the value of the node at index i"""
        # If the index is out of bounds, return None, representing a vacancy
        if i <= 0 or i >= self.size():
            return None
        return self._tree[i]

    def left(self, i: int) -> int | None:
        """Get the index of the left child of the node at index i"""
        return 2 * i

    def right(self, i: int) -> int | None:
        """Get the index of the right child of the node at index i"""
        return 2 * i + 1

    def parent(self, i: int) -> int | None:
        """Get the index of the parent of the node at index i"""
        if i <= 1:
            return None
        return i // 2

    def level_order(self) -> list[int]:
        """Level-order traversal"""
        self.res = []
        # Traverse array, starting from index 1
        # Follows the level of the tree from top to bottom,
        # left to right
        for i in range(1, self.size()):
            if self.val(i) is not None:
                self.res.append(self.val(i))
        return self.res

    def dfs(self, i: int, order: str):
        """Depth-first traversal"""
        if self.val(i) is None:
            return
        # Pre-order traversal
        if order == "pre":
            self.res.append(self.val(i))
        self.dfs(self.left(i), order)
        # In-order traversal
        if order == "in":
            self.res.append(self.val(i))
        self.dfs(self.right(i), order)
        # Post-order traversal
        if order == "post":
            self.res.append(self.val(i))

    def pre_order(self) -> list[int]:
        """Pre-order traversal"""
        self.res = []
        self.dfs(1, order="pre")  # Start from index 1
        return self.res

    def in_order(self) -> list[int]:
        """In-order traversal"""
        self.res = []
        self.dfs(1, order="in")  # Start from index 1
        return self.res

    def post_order(self) -> list[int]:
        """Post-order traversal"""
        self.res = []
        self.dfs(1, order="post")  # Start from index 1
        return self.res


# Suppose we have a binary tree like this:

#       1
#      / \
#     2   3
#    / \
#   4   5

# 1. Pre-order Traversal
# Order: Visit Node → Traverse Left Subtree → Traverse Right Subtree
# Sequence: In Pre-order traversal, the root node is always the first to be visited, followed by the left child and then the right child.
# The Pre-order traversal would be: 1, 2, 4, 5, 3


# 2. In-order Traversal
# Order: Traverse Left Subtree → Visit Node → Traverse Right Subtree
# Sequence: In In-order traversal, the left child is always visited first, then the root, and finally the right child.
# The In-order traversal would be: 4, 2, 5, 1, 3


# 3. Post-order Traversal
# Order: Traverse Left Subtree → Traverse Right Subtree → Visit Node
# Sequence: In Post-order traversal, the left child is visited first, followed by the right child, and finally the root node.
# The Post-order traversal would be: 4, 5, 2, 3, 1
