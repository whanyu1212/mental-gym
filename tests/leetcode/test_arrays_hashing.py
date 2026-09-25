"""Tests for src/leetcode/arrays_hashing."""

import pytest
from contains_duplicate import Solution as ContainsDuplicate
from design_hashmap import MyHashMap
from design_hashset import MyHashSet
from encode_decode_string import Solution as EncodeDecode
from get_concatenation import Solution as GetConcatenation
from group_anagram import Solution as GroupAnagrams
from is_anagram import Solution as IsAnagram
from is_valid_sudoku import Solution as IsValidSudoku
from longest_common_prefix import Solution as LongestCommonPrefix
from longest_consecutive import Solution as LongestConsecutive
from majority_element import Solution as MajorityElement
from majority_element_2 import Solution as MajorityElementII
from majority_element_2 import SolutionBoyerMoore as MajorityElementIIBoyerMoore
from maximum_subarray import Solution as MaximumSubarray
from maximum_sum_circular_subarray import Solution as MaxCircularSubarray
from product_except_self import Solution as ProductExceptSelf
from range_query_sum_2d_immutable import NumMatrix
from sort_an_array import Solution as SortAnArray
from sort_colors import Solution as SortColors
from subarray_sum_equals_k import Solution as SubarraySumEqualsK
from top_k_frequent_elements import Solution as TopKFrequent
from two_sum import Solution as TwoSum
from xor_queries_subarray import Solution as XorQueries

VALID_SUDOKU = [
    ["5", "3", ".", ".", "7", ".", ".", ".", "."],
    ["6", ".", ".", "1", "9", "5", ".", ".", "."],
    [".", "9", "8", ".", ".", ".", ".", "6", "."],
    ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
    ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
    ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
    [".", "6", ".", ".", ".", ".", "2", "8", "."],
    [".", ".", ".", "4", "1", "9", ".", ".", "5"],
    [".", ".", ".", ".", "8", ".", ".", "7", "9"],
]


def with_cell(board, row, col, value):
    """Return a copy of ``board`` with one cell replaced."""
    copy = [r[:] for r in board]
    copy[row][col] = value
    return copy


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([1, 2, 3, 3], True),
        ([1, 2, 3, 4], False),
        ([], False),
        ([7], False),
    ],
)
def test_contains_duplicate(nums, expected):
    assert ContainsDuplicate().hasDuplicate(nums) is expected


def test_design_hashmap():
    m = MyHashMap()
    m.put(1, 1)
    m.put(2, 2)
    assert m.get(1) == 1
    assert m.get(3) == -1
    m.put(2, 1)  # overwrite
    assert m.get(2) == 1
    m.remove(2)
    assert m.get(2) == -1
    m.remove(99)  # removing a missing key is a no-op
    assert m.get(1) == 1


def test_design_hashmap_colliding_keys():
    m = MyHashMap()
    keys = [0, 1000, 2000, 1_000_000]  # plausible bucket collisions
    for i, key in enumerate(keys):
        m.put(key, i)
    assert [m.get(key) for key in keys] == [0, 1, 2, 3]
    m.remove(1000)
    assert [m.get(key) for key in keys] == [0, -1, 2, 3]


def test_design_hashset():
    s = MyHashSet()
    s.add(1)
    s.add(2)
    assert s.contains(1) is True
    assert s.contains(3) is False
    s.add(2)  # duplicate add
    assert s.contains(2) is True
    s.remove(2)
    assert s.contains(2) is False
    s.remove(99)  # removing a missing key is a no-op
    assert s.contains(1) is True


@pytest.mark.parametrize(
    "strs",
    [
        ["neet", "code", "love", "you"],
        ["we", "say", ":", "yes"],
        [""],
        [],
        ["a#b", "3#", "#", "12#34"],  # delimiter and digits inside words
        ["x" * 15, "y"],  # multi-digit length prefix
    ],
)
def test_encode_decode_round_trip(strs):
    codec = EncodeDecode()
    assert codec.decode(codec.encode(strs)) == strs


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([1, 2, 1], [1, 2, 1, 1, 2, 1]),
        ([1, 3, 2, 1], [1, 3, 2, 1, 1, 3, 2, 1]),
        ([5], [5, 5]),
    ],
)
def test_get_concatenation(nums, expected):
    assert GetConcatenation().getConcatenation(nums) == expected


def canonical_groups(groups):
    """Order-insensitive view of a list of groups."""
    return sorted(sorted(group) for group in groups)


@pytest.mark.parametrize(
    "strs, expected",
    [
        (
            ["eat", "tea", "tan", "ate", "nat", "bat"],
            [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]],
        ),
        ([""], [[""]]),
        (["a"], [["a"]]),
    ],
)
def test_group_anagrams(strs, expected):
    result = GroupAnagrams().groupAnagrams(strs)
    assert canonical_groups(result) == canonical_groups(expected)


@pytest.mark.parametrize(
    "s, t, expected",
    [
        ("racecar", "carrace", True),
        ("jar", "jam", False),
        ("a", "ab", False),
        ("a", "a", True),
        ("aacc", "ccac", False),
    ],
)
def test_is_anagram(s, t, expected):
    assert IsAnagram().isAnagram(s, t) is expected


@pytest.mark.parametrize(
    "board, expected",
    [
        (VALID_SUDOKU, True),
        (with_cell(VALID_SUDOKU, 0, 2, "5"), False),  # duplicate in row 0
        (with_cell(VALID_SUDOKU, 4, 0, "5"), False),  # duplicate in column 0
        (with_cell(VALID_SUDOKU, 1, 1, "9"), False),  # duplicate in top-left box
    ],
)
def test_is_valid_sudoku(board, expected):
    assert IsValidSudoku().isValidSudoku(board) is expected


@pytest.mark.parametrize(
    "strs, expected",
    [
        (["flower", "flow", "flight"], "fl"),
        (["dog", "racecar", "car"], ""),
        (["alone"], "alone"),
        (["", "b"], ""),
        (["ab", "a"], "a"),
    ],
)
def test_longest_common_prefix(strs, expected):
    assert LongestCommonPrefix().longestCommonPrefix(strs) == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([100, 4, 200, 1, 3, 2], 4),
        ([0, 3, 7, 2, 5, 8, 4, 6, 0, 1], 9),
        ([], 0),
        ([1, 2, 0, 1], 3),
    ],
)
def test_longest_consecutive(nums, expected):
    assert LongestConsecutive().longestConsecutive(nums) == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([3, 2, 3], 3),
        ([2, 2, 1, 1, 1, 2, 2], 2),
        ([5], 5),
    ],
)
def test_majority_element(nums, expected):
    assert MajorityElement().majorityElement(nums) == expected


@pytest.mark.parametrize("impl", [MajorityElementII, MajorityElementIIBoyerMoore])
@pytest.mark.parametrize(
    "nums, expected",
    [
        ([3, 2, 3], [3]),
        ([1], [1]),
        ([1, 2], [1, 2]),
        ([1, 1, 1, 3, 3, 2, 2, 2], [1, 2]),
        ([1, 2, 3], []),
    ],
)
def test_majority_element_ii(impl, nums, expected):
    assert sorted(impl().majorityElement(nums)) == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([-2, 1, -3, 4, -1, 2, 1, -5, 4], 6),
        ([1], 1),
        ([5, 4, -1, 7, 8], 23),
        ([-3, -1, -2], -1),
    ],
)
def test_maximum_subarray(nums, expected):
    assert MaximumSubarray().maxSubArray(nums) == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([1, -2, 3, -2], 3),
        ([5, -3, 5], 10),
        ([-3, -2, -3], -2),
        ([3, -1, 2, -1], 4),
    ],
)
def test_maximum_sum_circular_subarray(nums, expected):
    assert MaxCircularSubarray().maxSubarraySumCircular(nums) == expected


@pytest.mark.parametrize(
    "nums, expected",
    [
        ([1, 2, 3, 4], [24, 12, 8, 6]),
        ([-1, 1, 0, -3, 3], [0, 0, 9, 0, 0]),
        ([0, 0], [0, 0]),
        ([2, 3], [3, 2]),
    ],
)
def test_product_except_self(nums, expected):
    assert ProductExceptSelf().productExceptSelf(nums) == expected


def test_range_sum_query_2d():
    matrix = NumMatrix(
        [
            [3, 0, 1, 4, 2],
            [5, 6, 3, 2, 1],
            [1, 2, 0, 1, 5],
            [4, 1, 0, 1, 7],
            [1, 0, 3, 0, 5],
        ]
    )
    assert matrix.sumRegion(2, 1, 4, 3) == 8
    assert matrix.sumRegion(1, 1, 2, 2) == 11
    assert matrix.sumRegion(1, 2, 2, 4) == 12
    assert matrix.sumRegion(0, 0, 0, 0) == 3
    assert matrix.sumRegion(0, 0, 4, 4) == 58


# LeetCode 912 guarantees 1 <= len(nums), so no empty case.
SORT_CASES = [
    [5, 2, 3, 1],
    [5, 1, 1, 2, 0, 0],
    [7],
    [-4, 0, -4, 3, -1],
]


@pytest.mark.parametrize(
    "method",
    ["sortArray", "counting_sort_with_hashmap", "counting_sort_with_array", "heap_sort"],
)
@pytest.mark.parametrize("nums", SORT_CASES)
def test_sort_an_array(method, nums):
    assert getattr(SortAnArray(), method)(list(nums)) == sorted(nums)


@pytest.mark.parametrize("method", ["sortColors", "sortColorsThreePointer"])
@pytest.mark.parametrize(
    "nums",
    [[2, 0, 2, 1, 1, 0], [2, 0, 1], [0], [1, 1], [2, 2, 0, 0]],
)
def test_sort_colors_in_place(method, nums):
    arr = list(nums)
    assert getattr(SortColors(), method)(arr) is None
    assert arr == sorted(nums)


@pytest.mark.parametrize(
    "nums, k, expected",
    [
        ([1, 1, 1], 2, 2),
        ([1, 2, 3], 3, 2),
        ([1, -1, 0], 0, 3),
        ([3], 3, 1),
        ([0, 0, 0], 0, 6),
    ],
)
def test_subarray_sum_equals_k(nums, k, expected):
    assert SubarraySumEqualsK().subarraySum(nums, k) == expected


@pytest.mark.parametrize(
    "nums, k, expected",
    [
        ([1, 1, 1, 2, 2, 3], 2, [1, 2]),
        ([1], 1, [1]),
        ([4, 4, 5, 5, 5, 6], 1, [5]),
        ([1, 2], 2, [1, 2]),
    ],
)
def test_top_k_frequent(nums, k, expected):
    assert sorted(TopKFrequent().topKFrequent(nums, k)) == expected


@pytest.mark.parametrize(
    "nums, target",
    [
        ([2, 7, 11, 15], 9),
        ([3, 2, 4], 6),
        ([3, 3], 6),
        ([-1, -2, -3, -4, -5], -8),
    ],
)
def test_two_sum(nums, target):
    i, j = TwoSum().twoSum(nums, target)
    assert i != j
    assert nums[i] + nums[j] == target


@pytest.mark.parametrize(
    "arr, queries, expected",
    [
        ([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]], [2, 7, 14, 8]),
        ([4, 8, 2, 10], [[2, 3], [1, 3], [0, 0], [0, 3]], [8, 0, 4, 4]),
    ],
)
def test_xor_queries(arr, queries, expected):
    assert XorQueries().xorQueries(arr, queries) == expected
