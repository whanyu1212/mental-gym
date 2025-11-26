# The commonly used terminology of binary trees:

# Root node: The node at the top level of the binary tree, which has no parent node.
# Leaf node: A node with no children, both of its pointers point to None.
# Edge: The line segment connecting two nodes, i.e., node reference (pointer).
# The level of a node: Incrementing from top to bottom, with the root node's level being 1.
# The degree of a node: The number of children a node has. In a binary tree, the degree can be 0, 1, or 2.
# The height of a binary tree: The number of edges passed from the root node to the farthest leaf node.
# The depth of a node: The number of edges passed from the root node to the node.
# The height of a node: The number of edges from the farthest leaf node to the node.


class TreeNode:
    """Binary tree node. Very similar to a linked list node, but with two pointers."""

    def __init__(self, val: int):
        self.val: int = val  # Node value
        self.left: TreeNode | None = None  # Reference to left child node
        self.right: TreeNode | None = None  # Reference to right child node


# Example usage
if __name__ == "__main__":
    n1 = TreeNode(val=1)
    n2 = TreeNode(val=2)
    n3 = TreeNode(val=3)
    n4 = TreeNode(val=4)
    n5 = TreeNode(val=5)
    # Linking references (pointers) between nodes
    n1.left = n2
    n1.right = n3
    n2.left = n4
    n2.right = n5

    # Inserting and removing nodes
    p = TreeNode(0)
    # Inserting node P between n1 -> n2
    n1.left = p
    p.left = n2
    # Removing node P
    n1.left = n2
