"""
Space Complexity Demonstrations in Python.

This module shows how different approaches use memory, with concrete
examples of common patterns.
"""

import sys
from collections import deque

# =============================================================================
# Example 1: O(1) Space - Constant
# =============================================================================


def sum_array(arr: list[int]) -> int:
    """
    O(1) space - only using a single variable regardless of input size.
    """
    total = 0  # One integer
    for num in arr:  # Loop variable reused
        total += num
    return total


def reverse_in_place(arr: list[int]) -> None:
    """
    O(1) space - two pointers, modifying input in place.
    """
    left, right = 0, len(arr) - 1  # Two integers
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1


def find_max_min(arr: list[int]) -> tuple[int, int]:
    """
    O(1) space - fixed number of variables.
    """
    if not arr:
        return (0, 0)
    max_val = min_val = arr[0]  # Two integers
    for num in arr:
        if num > max_val:
            max_val = num
        if num < min_val:
            min_val = num
    return (max_val, min_val)


# =============================================================================
# Example 2: O(n) Space - Linear
# =============================================================================


def create_copy(arr: list[int]) -> list[int]:
    """
    O(n) space - creating a new list of same size.
    """
    return arr[:]  # Slice creates copy


def build_frequency_map(arr: list[int]) -> dict[int, int]:
    """
    O(n) space - hash map could have up to n unique entries.
    """
    freq = {}
    for num in arr:
        freq[num] = freq.get(num, 0) + 1
    return freq


def get_unique_elements(arr: list[int]) -> set[int]:
    """
    O(n) space - set could have up to n elements.
    """
    return set(arr)


# =============================================================================
# Example 3: Recursion Space
# =============================================================================


def factorial_recursive(n: int) -> int:
    """
    O(n) space - recursion stack depth is n.

    Each call adds a stack frame containing:
    - Function parameters
    - Local variables
    - Return address
    """
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)


def factorial_iterative(n: int) -> int:
    """
    O(1) space - no recursion, just a loop.
    """
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


def binary_search_recursive(arr: list[int], target: int, left: int, right: int) -> int:
    """
    O(log n) space - recursion depth is log n (halving each time).
    """
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)


def binary_search_iterative(arr: list[int], target: int) -> int:
    """
    O(1) space - no recursion stack.
    """
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1


# =============================================================================
# Example 4: Hidden Space Costs in Python
# =============================================================================


def string_concat_bad(chars: list[str]) -> str:
    """
    O(n²) total allocations! Each += creates a new string.

    Why? Strings are immutable in Python. "ab" + "c" creates new string
    "abc", doesn't modify "ab".
    """
    result = ""
    for char in chars:
        result += char  # Creates new string each time!
    return result


def string_concat_good(chars: list[str]) -> str:
    """
    O(n) space - single allocation at the end.

    join() is optimized: calculates total size first, then allocates once.
    """
    return ''.join(chars)


def list_comprehension_space(n: int) -> list[int]:
    """
    O(n) space - creates full list in memory.
    """
    return [x * 2 for x in range(n)]


def generator_expression_space(n: int):
    """
    O(1) space - generates values on demand.

    Values are computed lazily, one at a time.
    """
    return (x * 2 for x in range(n))


def slice_creates_copy(arr: list[int]) -> list[int]:
    """
    O(n) space - slicing creates a COPY!

    This is a common gotcha for Python developers.
    """
    half = arr[: len(arr) // 2]  # This is a new list!
    return half


# =============================================================================
# Example 5: BFS vs DFS Space
# =============================================================================


class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left = None
        self.right = None


def create_balanced_tree(depth: int) -> TreeNode | None:
    """Helper to create a balanced binary tree."""
    if depth == 0:
        return None
    node = TreeNode(depth)
    node.left = create_balanced_tree(depth - 1)
    node.right = create_balanced_tree(depth - 1)
    return node


def bfs_traversal(root: TreeNode | None) -> list[int]:
    """
    BFS using queue.

    Space: O(w) where w = max width of tree
    For balanced tree: O(n/2) = O(n) at the bottom level
    """
    if not root:
        return []

    result = []
    queue = deque([root])  # Queue holds nodes at current level

    while queue:
        node = queue.popleft()
        result.append(node.val)

        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

    return result


def dfs_traversal(root: TreeNode | None) -> list[int]:
    """
    DFS using recursion.

    Space: O(h) where h = height of tree
    For balanced tree: O(log n)
    For skewed tree: O(n)
    """
    result = []

    def dfs(node):
        if not node:
            return
        result.append(node.val)
        dfs(node.left)
        dfs(node.right)

    dfs(root)
    return result


# =============================================================================
# Demonstration
# =============================================================================


def show_size(obj, name: str):
    """Show approximate size of object."""
    size = sys.getsizeof(obj)
    print(f"   {name}: {size:,} bytes")


def main():
    print("=" * 60)
    print("SPACE COMPLEXITY DEMONSTRATIONS")
    print("=" * 60)

    # O(1) examples
    print("\n1. O(1) SPACE - CONSTANT")
    print("-" * 40)
    arr = list(range(10000))
    print(f"   Input size: {len(arr):,} elements")
    print("   sum_array: uses 1 variable (total)")
    print("   reverse_in_place: uses 2 variables (left, right)")
    print("   Space doesn't grow with input!")

    # O(n) examples
    print("\n2. O(n) SPACE - LINEAR")
    print("-" * 40)
    arr = list(range(1000))
    copy = create_copy(arr)
    freq = build_frequency_map(arr)
    unique = get_unique_elements(arr)
    show_size(arr, "Original list")
    show_size(copy, "Copy of list")
    show_size(freq, "Frequency dict")
    show_size(unique, "Unique set")

    # Recursion space
    print("\n3. RECURSION STACK SPACE")
    print("-" * 40)
    print("   factorial_recursive(1000):")
    print("      -> 1000 stack frames = O(n) space")
    print("   factorial_iterative(1000):")
    print("      -> 1 stack frame = O(1) space")
    print("\n   binary_search_recursive on 1M elements:")
    print("      -> ~20 stack frames = O(log n) space")
    print("   binary_search_iterative:")
    print("      -> 1 stack frame = O(1) space")

    # Hidden costs
    print("\n4. HIDDEN SPACE COSTS IN PYTHON")
    print("-" * 40)

    # String concatenation
    # unused: _chars = ['a'] * 1000
    print("   String building with 1000 chars:")
    print("      '+=' in loop: creates ~500,000 char copies total!")
    print("      ''.join():    creates 1,000 chars once")

    # List vs Generator
    n = 100000
    list_comp = list_comprehension_space(n)
    gen_exp = generator_expression_space(n)
    show_size(list_comp, f"List comprehension ({n:,} items)")
    show_size(gen_exp, "Generator expression")
    print("   Generator uses constant space regardless of n!")

    # Slicing
    print("\n   Slicing gotcha:")
    arr = list(range(10000))
    half = arr[:5000]
    show_size(arr, "Original")
    show_size(half, "Slice (it's a COPY!)")

    # BFS vs DFS
    print("\n5. BFS vs DFS TREE TRAVERSAL")
    print("-" * 40)
    # unused: _tree = create_balanced_tree(10)  # Depth 10 = 1023 nodes
    print("   Balanced tree with depth 10 (1023 nodes):")
    print("      BFS space: O(width) = O(512) at bottom level")
    print("      DFS space: O(height) = O(10)")
    print("   For balanced trees, DFS uses less space!")
    print("\n   Skewed tree (like a linked list) with 1000 nodes:")
    print("      BFS space: O(1) - only 1 node per level")
    print("      DFS space: O(1000) - full depth")
    print("   For skewed trees, BFS uses less space!")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(
        """
    Space Complexity Quick Reference:
    ─────────────────────────────────
    O(1)     - Fixed variables, two pointers
    O(log n) - Balanced tree recursion
    O(n)     - Hash map, list copy, slicing, recursion on linear structure
    O(n²)    - 2D matrix, adjacency matrix

    Python Gotchas:
    ───────────────
    - Slicing creates copies
    - String '+=' is O(n) per operation
    - List comprehension stores all; generator yields one at a time
    - Recursion has stack overhead

    Questions to Ask:
    ─────────────────
    1. Am I creating new collections?
    2. How deep does recursion go?
    3. What's the maximum queue/stack size?
    4. Am I accidentally copying data?
    """
    )


if __name__ == "__main__":
    main()
