"""
Recursion Depth Visualization

This module demonstrates and visualizes recursion depth limits and
stack overflow scenarios with interactive examples.
"""

import sys
import traceback
from typing import Optional


# =============================================================================
# Example 1: Understanding Recursion Depth
# =============================================================================

def simple_recursion(n: int, depth: int = 0) -> int:
    """
    Simple recursive function to demonstrate stack depth.
    
    Args:
        n: Number of recursive calls to make
        depth: Current depth (for tracking)
    
    Returns:
        Maximum depth reached
    """
    if n <= 0:
        return depth
    return simple_recursion(n - 1, depth + 1)


def visualize_recursion_stack(n: int, max_display: int = 10) -> None:
    """
    Visualize the recursion stack as it builds up.
    
    Args:
        n: Number of levels to recurse
        max_display: Maximum levels to display (for readability)
    """
    def recurse(current: int, depth: int = 0, trace: list = None) -> None:
        if trace is None:
            trace = []
        
        # Build visual representation
        indent = "  " * depth
        frame = f"{indent}├─ recurse({current}) [depth={depth}]"
        trace.append(frame)
        
        if current == 0:
            # Base case - print the stack
            print("\nRecursion Stack Visualization:")
            print("=" * 50)
            display_count = min(len(trace), max_display)
            for i, frame in enumerate(trace[:display_count]):
                print(frame)
            if len(trace) > max_display:
                print(f"  ... ({len(trace) - max_display} more frames)")
            print(f"\n└─ Base case reached at depth {depth}")
            print(f"Total stack frames: {depth + 1}")
            return
        
        recurse(current - 1, depth + 1, trace)
    
    recurse(n)


# =============================================================================
# Example 2: Recursion Limit and Stack Overflow
# =============================================================================

def test_recursion_limit() -> None:
    """
    Test and display the current recursion limit.
    """
    current_limit = sys.getrecursionlimit()
    print(f"\nCurrent recursion limit: {current_limit}")
    print(f"Default Python recursion limit: {1000}")
    
    # Try to hit the limit
    print("\nTesting recursion limit...")
    try:
        result = simple_recursion(current_limit + 100)
        print(f"Reached depth: {result}")
    except RecursionError as e:
        print(f"RecursionError: {e}")
        print(f"Maximum recursion depth exceeded!")


def demonstrate_stack_overflow() -> None:
    """
    Demonstrate what happens when recursion depth is exceeded.
    """
    print("\n" + "=" * 60)
    print("STACK OVERFLOW DEMONSTRATION")
    print("=" * 60)
    
    def infinite_recursion(n: int = 0) -> None:
        """Intentionally cause stack overflow."""
        return infinite_recursion(n + 1)
    
    print("\nAttempting infinite recursion...")
    try:
        infinite_recursion()
    except RecursionError:
        exc_info = traceback.format_exc()
        lines = exc_info.split('\n')
        
        # Show first few and last few lines of traceback
        print("Stack trace (abbreviated):")
        print('\n'.join(lines[:8]))
        print("  ... (many more frames)")
        print('\n'.join(lines[-5:]))


# =============================================================================
# Example 3: Tail Recursion vs Regular Recursion
# =============================================================================

def factorial_regular(n: int, depth: int = 0) -> tuple[int, int]:
    """
    Regular recursion - builds up pending operations.
    
    Returns:
        (result, max_depth)
    """
    if n <= 1:
        return 1, depth
    
    result, max_depth = factorial_regular(n - 1, depth + 1)
    return n * result, max_depth


def factorial_tail_recursive(n: int, acc: int = 1, depth: int = 0) -> tuple[int, int]:
    """
    Tail recursion - no pending operations after recursive call.
    
    Note: Python does NOT optimize tail recursion, so this still
    uses O(n) stack space. Languages like Scheme would optimize this.
    
    Returns:
        (result, max_depth)
    """
    if n <= 1:
        return acc, depth
    return factorial_tail_recursive(n - 1, n * acc, depth + 1)


def factorial_iterative(n: int) -> int:
    """
    Iterative version - O(1) space.
    
    This is the Python way to avoid deep recursion!
    """
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


# =============================================================================
# Example 4: Comparing Recursion Approaches
# =============================================================================

def compare_recursion_styles(n: int = 10) -> None:
    """
    Compare different recursion styles and their stack usage.
    """
    print("\n" + "=" * 60)
    print(f"RECURSION STYLE COMPARISON (n={n})")
    print("=" * 60)
    
    # Regular recursion
    result_regular, depth_regular = factorial_regular(n)
    print(f"\nRegular Recursion:")
    print(f"  Result: {result_regular}")
    print(f"  Max depth: {depth_regular}")
    print(f"  Stack frames: {depth_regular + 1}")
    print(f"  Pending operations: n * (n-1) * ... builds up")
    
    # Tail recursion
    result_tail, depth_tail = factorial_tail_recursive(n)
    print(f"\nTail Recursion:")
    print(f"  Result: {result_tail}")
    print(f"  Max depth: {depth_tail}")
    print(f"  Stack frames: {depth_tail + 1}")
    print(f"  Note: Python doesn't optimize tail calls!")
    
    # Iterative
    result_iter = factorial_iterative(n)
    print(f"\nIterative:")
    print(f"  Result: {result_iter}")
    print(f"  Max depth: 0 (no recursion)")
    print(f"  Stack frames: 1")
    print(f"  Space complexity: O(1)")


# =============================================================================
# Example 5: Practical Recursion Depth Issues
# =============================================================================

def deep_list_sum_recursive(lst: list, depth: int = 0) -> tuple[int, int]:
    """
    Sum a flat list recursively - will hit limit on large lists.
    
    Returns:
        (sum, max_depth)
    """
    if not lst:
        return 0, depth
    
    rest_sum, max_depth = deep_list_sum_recursive(lst[1:], depth + 1)
    return lst[0] + rest_sum, max_depth


def deep_list_sum_iterative(lst: list) -> int:
    """
    Sum a list iteratively - no depth limit.
    """
    return sum(lst)


def demonstrate_practical_limits() -> None:
    """
    Show practical scenarios where recursion depth becomes an issue.
    """
    print("\n" + "=" * 60)
    print("PRACTICAL RECURSION DEPTH LIMITS")
    print("=" * 60)
    
    # Small list - works fine
    small_list = list(range(100))
    result_small, depth_small = deep_list_sum_recursive(small_list)
    print(f"\nSmall list (100 elements):")
    print(f"  Recursive sum: {result_small}")
    print(f"  Stack depth: {depth_small}")
    print(f"  Status: ✓ Works fine")
    
    # Large list - hits recursion limit
    print(f"\nLarge list (2000 elements):")
    large_list = list(range(2000))
    try:
        result_large, depth_large = deep_list_sum_recursive(large_list)
        print(f"  Recursive sum: {result_large}")
        print(f"  Stack depth: {depth_large}")
    except RecursionError:
        print(f"  Recursive sum: RecursionError!")
        print(f"  Status: ✗ Exceeds recursion limit")
    
    # Iterative solution
    result_iter = deep_list_sum_iterative(large_list)
    print(f"  Iterative sum: {result_iter}")
    print(f"  Status: ✓ No depth limit")
    
    print("\n  Lesson: For linear operations, prefer iteration in Python!")


# =============================================================================
# Main Demonstration
# =============================================================================

def main():
    """
    Run all recursion depth demonstrations.
    """
    print("=" * 60)
    print("RECURSION DEPTH VISUALIZATION")
    print("=" * 60)
    
    # 1. Basic recursion visualization
    print("\n1. BASIC RECURSION STACK")
    print("-" * 40)
    visualize_recursion_stack(8)
    
    # 2. Recursion limit
    print("\n2. RECURSION LIMIT")
    print("-" * 40)
    test_recursion_limit()
    
    # 3. Stack overflow
    demonstrate_stack_overflow()
    
    # 4. Compare recursion styles
    compare_recursion_styles(10)
    
    # 5. Practical limits
    demonstrate_practical_limits()
    
    # Summary
    print("\n" + "=" * 60)
    print("KEY TAKEAWAYS")
    print("=" * 60)
    print("""
    1. Python has a default recursion limit (usually 1000)
    2. Each recursive call adds a stack frame (uses memory)
    3. Deep recursion → RecursionError (stack overflow)
    4. Python does NOT optimize tail recursion
    5. For deep/linear recursion, prefer iteration in Python
    6. Use recursion for:
       - Tree/graph traversal (bounded depth)
       - Divide-and-conquer (log depth)
       - Naturally recursive problems (parsing, etc.)
    
    When to avoid recursion in Python:
    - Processing large lists/arrays linearly
    - Deep nested structures (use iteration + explicit stack)
    - Performance-critical code (function call overhead)
    
    Adjusting recursion limit (use with caution):
        import sys
        sys.setrecursionlimit(new_limit)  # Default is 1000
    """)


if __name__ == "__main__":
    main()
