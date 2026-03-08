"""
Dictionary/HashMap Time-Space Tradeoff Visualization.

This module demonstrates the classic time-space tradeoff using
dictionaries, with visual demonstrations and benchmarks.
"""

import random
import sys
import time
from typing import List, Optional, Tuple

# =============================================================================
# Example 1: Two Sum - The Classic Tradeoff
# =============================================================================


def two_sum_no_space(nums: List[int], target: int) -> Optional[Tuple[int, int]]:
    """
    O(n²) time, O(1) space - brute force approach.

    For each number, check all subsequent numbers to find complement.
    """
    n = len(nums)
    comparisons = 0

    for i in range(n):
        for j in range(i + 1, n):
            comparisons += 1
            if nums[i] + nums[j] == target:
                return (i, j), comparisons

    return None, comparisons


def two_sum_with_dict(nums: List[int], target: int) -> Optional[Tuple[int, int]]:
    """
    O(n) time, O(n) space - hash map approach.

    Trade space for time: store seen numbers in dictionary.
    """
    seen = {}  # Extra space: up to O(n)
    lookups = 0

    for i, num in enumerate(nums):
        complement = target - num
        lookups += 1

        if complement in seen:
            return (seen[complement], i), lookups
        seen[num] = i

    return None, lookups


def visualize_two_sum_tradeoff() -> None:
    """Visualize the time-space tradeoff for two sum problem."""
    print("\n" + "=" * 60)
    print("TWO SUM: TIME-SPACE TRADEOFF")
    print("=" * 60)

    test_sizes = [100, 500, 1000, 2000]

    print(
        "\n{:<10} {:<15} {:<15} {:<20}".format(
            "Size", "O(n²) Time", "O(n) Time", "Space Used"
        )
    )
    print("-" * 60)

    for size in test_sizes:
        nums = list(range(size))
        target = size - 2  # Worst case: near end

        # O(n²) approach
        start = time.perf_counter()
        result1, comparisons = two_sum_no_space(nums, target)
        time_n2 = time.perf_counter() - start

        # O(n) approach
        start = time.perf_counter()
        result2, lookups = two_sum_with_dict(nums, target)
        time_n = time.perf_counter() - start

        # Dictionary space (approximate)
        dict_space = sys.getsizeof({i: nums[i] for i in range(len(nums))})

        print(
            "{:<10} {:<15.6f} {:<15.6f} {:<20}".format(
                size, time_n2, time_n, f"{dict_space / 1024:.1f} KB"
            )
        )

    print(
        "\nTradeoff: Using ~O(n) extra space reduces time complexity from O(n²) to O(n)"
    )


# =============================================================================
# Example 2: Frequency Counter vs Multiple Scans
# =============================================================================


def find_mode_multiple_scans(nums: List[int]) -> int:
    """
    O(n²) time, O(1) space - count each unique value separately.
    """
    if not nums:
        return None

    max_count = 0
    mode = nums[0]
    scans = 0

    # Get unique values first (one scan)
    unique = list(set(nums))
    scans += 1

    # Count each unique value (multiple scans)
    for val in unique:
        count = nums.count(val)
        scans += 1
        if count > max_count:
            max_count = count
            mode = val

    return mode, scans


def find_mode_with_dict(nums: List[int]) -> int:
    """
    O(n) time, O(n) space - build frequency map in single pass.
    """
    if not nums:
        return None

    freq = {}
    scans = 1  # Single pass

    # Build frequency map
    for num in nums:
        freq[num] = freq.get(num, 0) + 1

    # Find mode
    mode = max(freq, key=freq.get)

    return mode, scans


def visualize_frequency_tradeoff() -> None:
    """Visualize tradeoff in frequency counting scenarios."""
    print("\n" + "=" * 60)
    print("FREQUENCY COUNTING: TIME-SPACE TRADEOFF")
    print("=" * 60)

    # Generate data with varying uniqueness
    test_cases = [
        ("Low uniqueness", [random.randint(0, 10) for _ in range(1000)]),
        ("Medium uniqueness", [random.randint(0, 100) for _ in range(1000)]),
        ("High uniqueness", [random.randint(0, 900) for _ in range(1000)]),
    ]

    print(
        "\n{:<20} {:<15} {:<15} {:<15}".format(
            "Data Type", "Multiple Scans", "Dict Scans", "Speedup"
        )
    )
    print("-" * 65)

    for name, nums in test_cases:
        # Multiple scans
        start = time.perf_counter()
        mode1, scans1 = find_mode_multiple_scans(nums)
        time1 = time.perf_counter() - start

        # Dictionary
        start = time.perf_counter()
        mode2, scans2 = find_mode_with_dict(nums)
        time2 = time.perf_counter() - start

        speedup = time1 / time2

        print(
            "{:<20} {:<15.6f} {:<15.6f} {:<15.1f}x".format(name, time1, time2, speedup)
        )

    print("\nTradeoff: Dictionary uses O(n) space but reduces from O(n*k) to O(n)")
    print("where k = number of unique elements")


# =============================================================================
# Example 3: Precomputation - Query Performance Tradeoff
# =============================================================================


class RangeQueryNoPrecomp:
    """
    No precomputation - O(1) space, O(n) per query.
    """

    def __init__(self, nums: List[int]):
        self.nums = nums

    def range_sum(self, left: int, right: int) -> int:
        """Query time: O(n)"""
        return sum(self.nums[left : right + 1])

    def space_used(self) -> int:
        """Only stores original array."""
        return sys.getsizeof(self.nums)


class RangeQueryWithPrefix:
    """
    Precompute prefix sums - O(n) space, O(1) per query.
    """

    def __init__(self, nums: List[int]):
        self.nums = nums
        # Precomputation: O(n) time and space
        self.prefix = [0]
        for num in nums:
            self.prefix.append(self.prefix[-1] + num)

    def range_sum(self, left: int, right: int) -> int:
        """Query time: O(1)"""
        return self.prefix[right + 1] - self.prefix[left]

    def space_used(self) -> int:
        """Stores original array + prefix sums."""
        return sys.getsizeof(self.nums) + sys.getsizeof(self.prefix)


def visualize_precomputation_tradeoff() -> None:
    """Visualize precomputation time-space tradeoff."""
    print("\n" + "=" * 60)
    print("PRECOMPUTATION: QUERY PERFORMANCE TRADEOFF")
    print("=" * 60)

    nums = list(range(10000))
    num_queries = 1000

    # Generate random range queries
    queries = [
        (random.randint(0, 9000), random.randint(0, 9999)) for _ in range(num_queries)
    ]
    queries = [(min(left, r), max(left, r)) for left, r in queries]

    # No precomputation
    no_precomp = RangeQueryNoPrecomp(nums)
    start = time.perf_counter()
    for left, right in queries:
        no_precomp.range_sum(left, right)
    time_no_precomp = time.perf_counter() - start

    # With precomputation
    start = time.perf_counter()
    with_prefix = RangeQueryWithPrefix(nums)
    precomp_time = time.perf_counter() - start

    start = time.perf_counter()
    for left, right in queries:
        with_prefix.range_sum(left, right)
    time_with_precomp = time.perf_counter() - start

    print(f"\nArray size: {len(nums)}")
    print(f"Number of queries: {num_queries}")
    print()
    print("Without Precomputation:")
    print("  Setup time: 0.000000s")
    print(f"  Query time: {time_no_precomp:.6f}s")
    print(f"  Total time: {time_no_precomp:.6f}s")
    print(f"  Space used: {no_precomp.space_used() / 1024:.1f} KB")
    print()
    print("With Precomputation:")
    print(f"  Setup time: {precomp_time:.6f}s")
    print(f"  Query time: {time_with_precomp:.6f}s")
    print(f"  Total time: {precomp_time + time_with_precomp:.6f}s")
    print(f"  Space used: {with_prefix.space_used() / 1024:.1f} KB")
    print()
    print(f"Speedup: {time_no_precomp / time_with_precomp:.1f}x faster queries")
    print(
        f"Tradeoff: 2x space for {time_no_precomp / time_with_precomp:.0f}x faster queries"  # noqa: E501
    )


# =============================================================================
# Example 4: Caching/Memoization Tradeoff
# =============================================================================


def fibonacci_no_cache(n: int) -> Tuple[int, int]:
    """
    No caching - O(1) space, O(2^n) time.
    """
    call_count = [0]  # Mutable to track across recursion

    def fib(x):
        call_count[0] += 1
        if x <= 1:
            return x
        return fib(x - 1) + fib(x - 2)

    result = fib(n)
    return result, call_count[0]


def fibonacci_with_cache(n: int) -> Tuple[int, int]:
    """
    With caching - O(n) space, O(n) time.
    """
    cache = {}
    call_count = [0]

    def fib(x):
        call_count[0] += 1
        if x <= 1:
            return x
        if x in cache:
            return cache[x]

        cache[x] = fib(x - 1) + fib(x - 2)
        return cache[x]

    result = fib(n)
    return result, call_count[0], len(cache)


def visualize_caching_tradeoff() -> None:
    """Visualize caching/memoization tradeoff."""
    print("\n" + "=" * 60)
    print("CACHING/MEMOIZATION: TIME-SPACE TRADEOFF")
    print("=" * 60)

    test_values = [10, 15, 20, 25, 30]

    print(
        "\n{:<10} {:<20} {:<20} {:<15}".format(
            "n", "No Cache (calls)", "With Cache (calls)", "Cache Size"
        )
    )
    print("-" * 65)

    for n in test_values:
        # No cache
        start = time.perf_counter()
        result1, calls1 = fibonacci_no_cache(n)
        time1 = time.perf_counter() - start

        # With cache
        start = time.perf_counter()
        result2, calls2, cache_size = fibonacci_with_cache(n)
        time2 = time.perf_counter() - start

        print(
            "{:<10} {:<20} {:<20} {:<15}".format(
                n,
                f"{calls1} ({time1:.6f}s)",
                f"{calls2} ({time2:.6f}s)",
                f"{cache_size} entries",
            )
        )

    print("\nTradeoff: O(n) space reduces calls from O(2^n) to O(n)")


# =============================================================================
# Example 5: Memory Usage Visualization
# =============================================================================


def visualize_dictionary_memory() -> None:
    """Show actual memory usage of dictionaries at different sizes."""
    print("\n" + "=" * 60)
    print("DICTIONARY MEMORY USAGE")
    print("=" * 60)

    sizes = [10, 100, 1000, 10000, 100000]

    print("\n{:<15} {:<20} {:<20}".format("Size", "Empty Dict", "Int Key-Value Pairs"))
    print("-" * 55)

    for size in sizes:
        # Empty dict overhead
        empty = {}
        empty_size = sys.getsizeof(empty)

        # Dict with data
        data = {i: i for i in range(size)}
        data_size = sys.getsizeof(data)

        print(
            "{:<15} {:<20} {:<20}".format(
                size, f"{empty_size} bytes", f"{data_size / 1024:.1f} KB"
            )
        )

    print("\nNote: Dictionaries have overhead but provide O(1) lookups")


# =============================================================================
# Main Demonstration
# =============================================================================


def main():
    """Run all dictionary tradeoff demonstrations."""
    print("=" * 60)
    print("DICTIONARY TIME-SPACE TRADEOFF VISUALIZATION")
    print("=" * 60)

    # 1. Two Sum tradeoff
    visualize_two_sum_tradeoff()

    # 2. Frequency counting tradeoff
    visualize_frequency_tradeoff()

    # 3. Precomputation tradeoff
    visualize_precomputation_tradeoff()

    # 4. Caching tradeoff
    visualize_caching_tradeoff()

    # 5. Memory usage
    visualize_dictionary_memory()

    # Summary
    print("\n" + "=" * 60)
    print("KEY TAKEAWAYS: DICTIONARY TIME-SPACE TRADEOFFS")
    print("=" * 60)
    print(
        """
    Common Tradeoff Patterns:

    1. **Lookup Acceleration**
       - Without dict: O(n) lookup time, O(1) space
       - With dict: O(1) lookup time, O(n) space
       - Use when: Many lookups, can afford space

    2. **Frequency Counting**
       - Without dict: O(n*k) time, O(1) space (k = unique elements)
       - With dict: O(n) time, O(k) space
       - Use when: Need to count/group items

    3. **Precomputation**
       - Without dict: O(1) space, O(n) per query
       - With dict: O(n) space, O(1) per query
       - Use when: Multiple queries on same data

    4. **Memoization/Caching**
       - Without cache: O(1) space, exponential time (worst case)
       - With cache: O(n) space, polynomial/linear time
       - Use when: Overlapping subproblems

    When to Use Dictionaries:
    ✓ Need fast lookups (O(1) vs O(n))
    ✓ Counting/grouping operations
    ✓ Caching computed results
    ✓ Building indices for fast access
    ✓ Have sufficient memory

    When to Avoid:
    ✗ Memory is severely constrained
    ✗ Data is already sorted (binary search may suffice)
    ✗ Single-use computation (no reuse benefit)
    ✗ Small datasets (overhead not worth it)

    Rule of Thumb:
    If you're doing repeated linear scans → consider a dictionary!
    If you have O(n²) nested loops → consider a dictionary!
    """
    )


if __name__ == "__main__":
    main()
