"""
Time-Space Tradeoff Examples in Python.

This module demonstrates common scenarios where you can trade space for
time (or vice versa) in algorithm design.
"""

import time
from collections import defaultdict
from functools import lru_cache

# =============================================================================
# Example 1: Two Sum Problem
# =============================================================================


def two_sum_brute_force(nums: list[int], target: int) -> list[int]:
    """
    Brute force approach - check every pair.

    Time:  O(n²) - nested loops
    Space: O(1)  - only using indices
    """
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []


def two_sum_hashmap(nums: list[int], target: int) -> list[int]:
    """
    Hash map approach - trade space for time.

    Time:  O(n) - single pass
    Space: O(n) - storing seen values in hash map
    """
    seen = {}  # Extra space: O(n)
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []


# =============================================================================
# Example 2: Fibonacci - Recursion vs Memoization vs Iteration
# =============================================================================


def fib_recursive(n: int) -> int:
    """
    Naive recursion - recomputes same values many times.

    Time:  O(2^n) - exponential due to repeated work
    Space: O(n)   - recursion stack depth
    """
    if n <= 1:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)


@lru_cache(maxsize=None)
def fib_memoized(n: int) -> int:
    """
    Memoization - cache results to avoid recomputation.

    Time:  O(n) - each value computed once
    Space: O(n) - cache storage + recursion stack

    Tradeoff: Using O(n) extra space to reduce time from O(2^n) to O(n)
    """
    if n <= 1:
        return n
    return fib_memoized(n - 1) + fib_memoized(n - 2)


def fib_iterative(n: int) -> int:
    """
    Iterative with O(1) space - only track last two values.

    Time:  O(n) - single pass
    Space: O(1) - only two variables

    Best of both worlds for this problem!
    """
    if n <= 1:
        return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr


# =============================================================================
# Example 3: Finding Duplicates
# =============================================================================


def find_duplicate_sort(nums: list[int]) -> int | None:
    """
    Sort first, then check adjacent elements.

    Time:  O(n log n) - sorting dominates
    Space: O(1) or O(n) - depends on sort implementation

    Note: This modifies the input array!
    """
    nums.sort()  # In-place sort
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return nums[i]
    return None


def find_duplicate_hashset(nums: list[int]) -> int | None:
    """
    Use a set to track seen values.

    Time:  O(n) - single pass
    Space: O(n) - storing seen values

    Tradeoff: O(n) space to get O(n) time without modifying input
    """
    seen = set()
    for num in nums:
        if num in seen:
            return num
        seen.add(num)
    return None


# =============================================================================
# Example 4: String Matching - Precomputation Tradeoff
# =============================================================================


def count_anagrams_brute(words: list[str], target: str) -> int:
    """
    Check each word individually.

    Time:  O(n * k log k) - n words, k = avg word length, sorting each
    Space: O(k) - for sorting
    """
    target_sorted = ''.join(sorted(target))
    count = 0
    for word in words:
        if ''.join(sorted(word)) == target_sorted:
            count += 1
    return count


def count_anagrams_precompute(words: list[str], target: str) -> int:
    """
    Precompute sorted versions of all words.

    Time:  O(n * k log k) for preprocessing, O(1) for each query after
    Space: O(n * k) - storing preprocessed data

    Tradeoff: More space, but subsequent queries are O(1)
    """
    # Precompute: O(n * k log k) time, O(n * k) space
    anagram_groups = defaultdict(int)
    for word in words:
        key = ''.join(sorted(word))
        anagram_groups[key] += 1

    # Query: O(k log k) time
    target_key = ''.join(sorted(target))
    return anagram_groups.get(target_key, 0)


# =============================================================================
# Example 5: Graph - Adjacency Matrix vs Adjacency List
# =============================================================================


class GraphMatrix:
    """
    Adjacency Matrix representation.

    Space: O(V²) - always, regardless of edges

    Pros:
    - O(1) edge lookup
    - O(1) edge insertion/deletion

    Cons:
    - Wastes space for sparse graphs
    - O(V²) to iterate all edges
    """

    def __init__(self, num_vertices: int):
        self.V = num_vertices
        self.matrix = [[0] * num_vertices for _ in range(num_vertices)]

    def add_edge(self, u: int, v: int) -> None:
        self.matrix[u][v] = 1
        self.matrix[v][u] = 1  # Undirected

    def has_edge(self, u: int, v: int) -> bool:
        return self.matrix[u][v] == 1  # O(1)

    def get_neighbors(self, u: int) -> list[int]:
        return [v for v in range(self.V) if self.matrix[u][v]]  # O(V)


class GraphList:
    """
    Adjacency List representation.

    Space: O(V + E) - proportional to actual edges

    Pros:
    - Space efficient for sparse graphs
    - O(degree) to iterate neighbors

    Cons:
    - O(degree) edge lookup (could be O(V) worst case)
    """

    def __init__(self, num_vertices: int):
        self.V = num_vertices
        self.adj = defaultdict(list)

    def add_edge(self, u: int, v: int) -> None:
        self.adj[u].append(v)
        self.adj[v].append(u)  # Undirected

    def has_edge(self, u: int, v: int) -> bool:
        return v in self.adj[u]  # O(degree of u)

    def get_neighbors(self, u: int) -> list[int]:
        return self.adj[u]  # O(1) to return reference


# =============================================================================
# Demonstration
# =============================================================================


def benchmark(func, *args, iterations=1000):
    """Simple benchmark helper."""
    start = time.perf_counter()
    for _ in range(iterations):
        result = func(*args)
    elapsed = time.perf_counter() - start
    return result, elapsed


def main():
    print("=" * 60)
    print("TIME-SPACE TRADEOFF DEMONSTRATIONS")
    print("=" * 60)

    # Example 1: Two Sum
    print("\n1. TWO SUM")
    print("-" * 40)
    nums = list(range(1000)) + [500]  # Target pair at end
    target = 999  # 499 + 500

    _, time_brute = benchmark(two_sum_brute_force, nums, target, iterations=100)
    _, time_hash = benchmark(two_sum_hashmap, nums, target, iterations=100)

    print(f"   Brute Force O(n²): {time_brute:.4f}s")
    print(f"   Hash Map O(n):     {time_hash:.4f}s")
    print(f"   Speedup:           {time_brute/time_hash:.1f}x")
    print(
        f"   Tradeoff:          O(n) extra space for ~{time_brute/time_hash:.0f}x speed"
    )

    # Example 2: Fibonacci
    print("\n2. FIBONACCI")
    print("-" * 40)
    n = 30

    _, time_recursive = benchmark(fib_recursive, n, iterations=1)
    fib_memoized.cache_clear()
    _, time_memo = benchmark(fib_memoized, n, iterations=1)
    _, time_iter = benchmark(fib_iterative, n, iterations=1)

    print(f"   Recursive O(2^n):  {time_recursive:.4f}s")
    print(f"   Memoized O(n):     {time_memo:.6f}s")
    print(f"   Iterative O(n):    {time_iter:.6f}s")
    print(f"   Memo speedup:      {time_recursive/time_memo:.0f}x (uses O(n) space)")
    print("   Iterative:         Best! O(n) time, O(1) space")

    # Example 3: Find Duplicate
    print("\n3. FIND DUPLICATE")
    print("-" * 40)
    nums = list(range(10000)) + [5000]  # Duplicate in middle

    nums_copy = nums.copy()
    _, time_sort = benchmark(find_duplicate_sort, nums_copy, iterations=100)
    _, time_set = benchmark(find_duplicate_hashset, nums, iterations=100)

    print(f"   Sort O(n log n):   {time_sort:.4f}s (modifies input)")
    print(f"   HashSet O(n):      {time_set:.4f}s (O(n) extra space)")
    print("   Tradeoff:          Space vs preserving input")

    # Summary
    print("\n" + "=" * 60)
    print("KEY TAKEAWAYS")
    print("=" * 60)
    print(
        """
    1. Hash maps trade O(n) space for O(1) lookup time
    2. Memoization trades O(n) space for avoiding recomputation
    3. Precomputation trades space for faster repeated queries
    4. Adjacency matrix trades O(V²) space for O(1) edge lookup
    5. Sometimes iterative solutions give best of both worlds

    Ask yourself:
    - How much memory do I have?
    - How many times will this run?
    - Can I modify the input?
    - What's the bottleneck: time or space?
    """
    )


if __name__ == "__main__":
    main()
