"""Tests for src/leetcode/two_pointers."""

import pytest
from boats_to_save_people import Solution as BoatsToSavePeople
from four_sum import Solution as FourSum
from max_area import Solution as MaxArea
from merge_alternatively import Solution as MergeAlternately
from merge_sorted_array import Solution as MergeSortedArray
from remove_duplicate import Solution as RemoveDuplicates
from remove_duplicates_ii import Solution as RemoveDuplicatesII
from reverse_string import Solution as ReverseString
from rotate_array import Solution as RotateArray
from three_sum import Solution as ThreeSum
from trap import Solution as TrappingRainWater
from two_sum2 import Solution as TwoSumII
from valid_palindrome import Solution as ValidPalindrome
from valid_palindrome_2 import Solution as ValidPalindromeII


def canonical_tuples(result):
    """Order-insensitive view of a list of k-tuples."""
    return sorted(sorted(group) for group in result)


@pytest.mark.parametrize(
    "people, limit, expected",
    [
        ([1, 2], 3, 1),
        ([3, 2, 2, 1], 3, 3),
        ([3, 5, 3, 4], 5, 4),
        ([5], 5, 1),
        ([1, 1, 1, 1], 2, 2),
    ],
)
def test_boats_to_save_people(people, limit, expected):
    assert BoatsToSavePeople().numRescueBoats(list(people), limit) == expected


@pytest.mark.parametrize(
    "nums, target, expected",
    [
        ([1, 0, -1, 0, -2, 2], 0, [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]),
        ([2, 2, 2, 2, 2], 8, [[2, 2, 2, 2]]),
        ([1, 2, 3], 6, []),
        ([0, 0, 0, 0], 1, []),
        (
            [1_000_000_000] * 4,
            -294_967_296,
            [],
        ),  # sum overflows 32-bit ints in other languages
    ],
)
def test_four_sum(nums, target, expected):
    assert canonical_tuples(FourSum().fourSum(list(nums), target)) == canonical_tuples(
        expected
    )


@pytest.mark.parametrize(
    "height, expected",
    [
        ([1, 8, 6, 2, 5, 4, 8, 3, 7], 49),
        ([1, 1], 1),
        ([4, 3, 2, 1, 4], 16),
        ([1, 2, 1], 2),
    ],
)
def test_max_area(height, expected):
    assert MaxArea().maxArea(height) == expected


@pytest.mark.parametrize(
    "word1, word2, expected",
    [
        ("abc", "pqr", "apbqcr"),
        ("ab", "pqrs", "apbqrs"),
        ("abcd", "pq", "apbqcd"),
        ("a", "b", "ab"),
    ],
)
def test_merge_alternately(word1, word2, expected):
    assert MergeAlternately().mergeAlternately(word1, word2) == expected


@pytest.mark.parametrize(
    "nums1, m, nums2, n, expected",
    [
        ([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3, [1, 2, 2, 3, 5, 6]),
        ([1], 1, [], 0, [1]),
        ([0], 0, [1], 1, [1]),
        ([4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3, [1, 2, 3, 4, 5, 6]),
    ],
)
def test_merge_sorted_array_in_place(nums1, m, nums2, n, expected):
    arr = list(nums1)
    assert MergeSortedArray().merge(arr, m, list(nums2), n) is None
    assert arr == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([1, 1, 2], [1, 2]),
        ([0, 0, 1, 1, 1, 2, 2, 3, 3, 4], [0, 1, 2, 3, 4]),
        ([7], [7]),
        ([2, 2, 2], [2]),
    ],
)
def test_remove_duplicates(nums, expected):
    arr = list(nums)
    k = RemoveDuplicates().removeDuplicates(arr)
    assert k == len(expected)
    assert arr[:k] == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([1, 1, 1, 2, 2, 3], [1, 1, 2, 2, 3]),
        ([0, 0, 1, 1, 1, 1, 2, 3, 3], [0, 0, 1, 1, 2, 3, 3]),
        ([1], [1]),
        ([1, 1], [1, 1]),
        ([2, 2, 2, 2], [2, 2]),
    ],
)
def test_remove_duplicates_ii(nums, expected):
    arr = list(nums)
    k = RemoveDuplicatesII().removeDuplicates(arr)
    assert k == len(expected)
    assert arr[:k] == expected


@pytest.mark.parametrize(
    "chars",
    [list("hello"), list("Hannah"), ["a"], ["a", "b"]],
)
def test_reverse_string_in_place(chars):
    arr = list(chars)
    assert ReverseString().reverseString(arr) is None
    assert arr == chars[::-1]


@pytest.mark.parametrize(
    "nums, k, expected",
    [
        ([1, 2, 3, 4, 5, 6, 7], 3, [5, 6, 7, 1, 2, 3, 4]),
        ([-1, -100, 3, 99], 2, [3, 99, -1, -100]),
        ([1, 2, 3], 0, [1, 2, 3]),
        ([1, 2, 3], 3, [1, 2, 3]),
        ([1, 2], 5, [2, 1]),  # k > n
        ([1], 4, [1]),
    ],
)
def test_rotate_array_in_place(nums, k, expected):
    arr = list(nums)
    assert RotateArray().rotate(arr, k) is None
    assert arr == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([-1, 0, 1, 2, -1, -4], [[-1, -1, 2], [-1, 0, 1]]),
        ([0, 1, 1], []),
        ([0, 0, 0], [[0, 0, 0]]),
        ([0, 0, 0, 0], [[0, 0, 0]]),
        ([-2, 0, 1, 1, 2], [[-2, 0, 2], [-2, 1, 1]]),
    ],
)
def test_three_sum(nums, expected):
    assert canonical_tuples(ThreeSum().threeSum(list(nums))) == canonical_tuples(
        expected
    )


@pytest.mark.parametrize(
    "method", ["trap_bruteforce", "trap_prefix_suffix_sum", "trap_two_pointers"]
)
@pytest.mark.parametrize(
    "height, expected",
    [
        ([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], 6),
        ([4, 2, 0, 3, 2, 5], 9),
        ([1], 0),
        ([2, 0], 0),
        ([3, 0, 3], 3),
        ([1, 2, 3, 4], 0),
        ([5, 4, 1, 2], 1),
    ],
)
def test_trapping_rain_water(method, height, expected):
    assert getattr(TrappingRainWater(), method)(height) == expected


@pytest.mark.parametrize(
    "numbers, target, expected",
    [
        ([2, 7, 11, 15], 9, [1, 2]),
        ([2, 3, 4], 6, [1, 3]),
        ([-1, 0], -1, [1, 2]),
        ([1, 2, 3, 4, 4, 9], 8, [4, 5]),
    ],
)
def test_two_sum_ii_one_indexed(numbers, target, expected):
    assert TwoSumII().twoSum(numbers, target) == expected


@pytest.mark.parametrize(
    "s, expected",
    [
        ("A man, a plan, a canal: Panama", True),
        ("race a car", False),
        (" ", True),
        ("Was it a car or a cat I saw?", True),
        ("0P", False),
        (".,", True),
    ],
)
def test_valid_palindrome(s, expected):
    assert ValidPalindrome().isPalindrome(s) is expected


@pytest.mark.parametrize(
    "s, expected",
    [
        ("aba", True),
        ("abca", True),
        ("abc", False),
        ("a", True),
        ("deeee", True),  # delete the left end
        ("eeeed", True),  # delete the right end
        ("abbca", True),
        ("abcddcbea", True),
        ("abcdecba", True),  # delete the inner "d"
        ("abcdefba", False),  # two mismatches deep inside
    ],
)
def test_valid_palindrome_ii(s, expected):
    assert ValidPalindromeII().validPalindrome(s) is expected
