import sys


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
    """Find the value in the BST that is closest to the target number
    and smaller than the target number.

    Args:
        root (TreeNode): starting root node
        num (int): target number to search for

    Returns:
        int: the cloest value to the target number
    """
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


# def print_tree(node, level=0):
#     if node:
#         print_tree(node.right, level + 1)
#         print("  " * level + str(node.val))
#         print_tree(node.left, level + 1)


# Example usage
if __name__ == "__main__":
    # with open("input.txt", "r") as file:
    #     input_data = file.read().strip().split()
    input_data = sys.stdin.read().strip().split()

    num_of_contestants = int(input_data[0])

    guesses = input_data[1 : num_of_contestants * 2 + 1]

    d = {}
    for i in range(0, len(guesses), 2):
        d[int(guesses[i + 1])] = guesses[i]

    numeric_guesses = sorted(list(d.keys()))

    ideas = input_data[num_of_contestants * 2 + 2 :]
    ideas = list(map(int, ideas))

    root = sorted_list_to_balanced_bst(numeric_guesses)

    # print_tree(root)

    for i in ideas:
        val = find_value_or_closest_smaller(root, i)
        if val:
            print(d[val])
        else:
            print(":(")
