import os


# Boilerplate to create a tree
class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left = None
        self.right = None


def sorted_list_to_balanced_bst(values: list) -> TreeNode:
    """Convert a sorted list to a balanced binary search tree
    using recursion. A balanced BST has lower height and search
    time complexity as compared to an unbalanced BST.

    Args:
        values (list): input list of values

    Returns:
        TreeNode: root node of the balanced BST
    """
    if not values:
        return None

    # Find the middle index
    mid = len(values) // 2

    # The middle element becomes the root
    root = TreeNode(values[mid])

    # Recursively build the left and right subtrees
    root.left = sorted_list_to_balanced_bst(values[:mid])
    root.right = sorted_list_to_balanced_bst(values[mid + 1 :])

    return root


def find_value_or_closest_smaller(root: TreeNode, num: int) -> int:
    closest_value = None

    cur = root

    while cur:
        if cur.val == num:
            return cur.val
        elif cur.val < num:
            closest_value = cur.val
            cur = cur.right
        else:
            cur = cur.left

    return closest_value


def print_tree(node, level=0):
    if node:
        print_tree(node.right, level + 1)
        print("  " * level + str(node.val))
        print_tree(node.left, level + 1)


# Example usage
if __name__ == "__main__":
    # Create a sorted list
    values = [500, 100, 1000]

    # Convert the list to a balanced binary search tree

    root = sorted_list_to_balanced_bst(sorted(values))

    print_tree(root)

    target = 499

    print(find_value_or_closest_smaller(root, target))
