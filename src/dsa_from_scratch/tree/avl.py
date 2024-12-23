# After multiple insertions and removals,
# a binary search tree might degrade to a linked list.
# In such cases, the time complexity of all operations degrades from
# O(log n) to O(n). To avoid this, we can use an AVL tree


# Minimum number of vertices in an AVL tree of height h
# fib(h+3) - 1

# Maximum number of vertices in an AVL tree of height h
# 2^h+1 - 1


class TreeNode:
    """AVL tree node"""

    def __init__(self, val: int):
        self.val: int = val  # Node value
        self.height: int = 0  # Node height
        self.left: TreeNode | None = None  # Left child reference
        self.right: TreeNode | None = None  # Right child reference


class AVLTree:
    def __init__(self):
        self.root: TreeNode | None = None

    def height(self, node: TreeNode | None) -> int:
        """Get node height"""
        # Empty node height is -1, leaf node height is 0
        # The "node height" refers to the distance from that node to its farthest leaf node
        if node is not None:
            return node.height
        return -1

    def update_height(self, node: TreeNode | None):
        """Update node height"""
        # Node height equals the height of the tallest subtree + 1
        node.height = max([self.height(node.left), self.height(node.right)]) + 1

    def balance_factor(self, node: TreeNode | None) -> int:
        """Get balance factor"""
        # Empty node balance factor is 0
        if node is None:
            return 0
        # Node balance factor = left subtree height - right subtree height
        return self.height(node.left) - self.height(node.right)

    # the balance factor of any node in an AVL tree satisfies the following property:
    # -1 <= balance factor <= 1

    def right_rotate(self, node: TreeNode | None) -> TreeNode | None:
        """Right rotation operation"""
        child = node.left
        grand_child = child.right
        # Rotate node to the right around child
        child.right = node
        node.left = grand_child
        # Update node height
        self.update_height(node)
        self.update_height(child)
        # Return the root of the subtree after rotation
        return child

    def left_rotate(self, node: TreeNode | None) -> TreeNode | None:
        """Left rotation operation"""
        child = node.right
        grand_child = child.left
        # Rotate node to the left around child
        child.left = node
        node.right = grand_child
        # Update node height
        self.update_height(node)
        self.update_height(child)
        # Return the root of the subtree after rotation
        return child

    def rotate(self, node: TreeNode | None) -> TreeNode | None:
        """Perform rotation operation to restore balance to the subtree"""
        # Get the balance factor of node
        balance_factor = self.balance_factor(node)
        # Left-leaning tree
        if balance_factor > 1:
            if self.balance_factor(node.left) >= 0:
                # Right rotation
                return self.right_rotate(node)
            else:
                # First left rotation then right rotation
                node.left = self.left_rotate(node.left)
                return self.right_rotate(node)
        # Right-leaning tree
        elif balance_factor < -1:
            if self.balance_factor(node.right) <= 0:
                # Left rotation
                return self.left_rotate(node)
            else:
                # First right rotation then left rotation
                node.right = self.right_rotate(node.right)
                return self.left_rotate(node)
        # Balanced tree, no rotation needed, return
        return node

    def insert(self, val):
        """Insert node"""
        self._root = self.insert_helper(self._root, val)

    def insert_helper(self, node: TreeNode | None, val: int) -> TreeNode:
        """Recursively insert node (helper method)"""
        if node is None:
            return TreeNode(val)
        # 1. Find insertion position and insert node
        if val < node.val:
            node.left = self.insert_helper(node.left, val)
        elif val > node.val:
            node.right = self.insert_helper(node.right, val)
        else:
            # Do not insert duplicate nodes, return
            return node
        # Update node height
        self.update_height(node)
        # 2. Perform rotation operation to restore balance to the subtree
        return self.rotate(node)

    def remove(self, val: int):
        """Remove node"""
        self._root = self.remove_helper(self._root, val)

    def remove_helper(self, node: TreeNode | None, val: int) -> TreeNode | None:
        """Recursively remove node (helper method)"""
        if node is None:
            return None
        # 1. Find and remove the node
        if val < node.val:
            node.left = self.remove_helper(node.left, val)
        elif val > node.val:
            node.right = self.remove_helper(node.right, val)
        else:
            if node.left is None or node.right is None:
                child = node.left or node.right
                # Number of child nodes = 0, remove node and return
                if child is None:
                    return None
                # Number of child nodes = 1, remove node
                else:
                    node = child
            else:
                # Number of child nodes = 2, remove the next node in in-order traversal and replace the current node with it
                temp = node.right
                while temp.left is not None:
                    temp = temp.left
                node.right = self.remove_helper(node.right, temp.val)
                node.val = temp.val
        # Update node height
        self.update_height(node)
        # 2. Perform rotation operation to restore balance to the subtree
        return self.rotate(node)

    def search(self, val: int) -> TreeNode:
        def search_helper(node: TreeNode, val: int) -> TreeNode:
            if node is None or node.val == val:
                return node
            if val < node.val:
                return search_helper(node.left, val)
            else:
                return search_helper(node.right, val)

        return search_helper(self._root, val)
