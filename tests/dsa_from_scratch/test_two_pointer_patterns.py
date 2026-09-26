"""
Tests for src/dsa_from_scratch/python/two_pointers.

Each template is checked on hand-picked edge cases and against a brute-
force version on a fixed set of random inputs.
"""

import itertools
import random

import pytest
from two_pointer_patterns import (
    compact_keep_at_most,
    find_middle,
    is_palindrome,
    max_container_area,
    merge_into_first,
    merge_sorted,
    pair_with_sum,
    reverse_in_place,
    trapped_water,
    unique_triplets_with_sum,
)

RNG_SEED = 20260926


def random_lists(count=300, max_len=9, low=-5, high=5):
    rng = random.Random(RNG_SEED)
    return [
        [rng.randint(low, high) for _ in range(rng.randint(0, max_len))]
        for _ in range(count)
    ]


@pytest.mark.parametrize("items", [[], [1], [1, 2], list("hello"), [3, 1, 2, 5]])
def test_reverse_in_place(items):
    expected = items[::-1]
    assert reverse_in_place(items) is None
    assert items == expected


@pytest.mark.parametrize(
    "text, expected",
    [("", True), ("a", True), ("abba", True), ("racecar", True), ("ab", False)],
)
def test_is_palindrome(text, expected):
    assert is_palindrome(text) is expected


@pytest.mark.parametrize("nums", random_lists())
def test_pair_with_sum_matches_brute_force(nums):
    nums = sorted(nums)
    for target in range(-10, 11):
        got = pair_with_sum(nums, target)
        exists = any(
            nums[i] + nums[j] == target
            for i, j in itertools.combinations(range(len(nums)), 2)
        )
        if not exists:
            assert got is None
        else:
            i, j = got
            assert i < j and nums[i] + nums[j] == target


@pytest.mark.parametrize(
    "heights, expected",
    [([], 0), ([5], 0), ([1, 1], 1), ([1, 8, 6, 2, 5, 4, 8, 3, 7], 49)],
)
def test_max_container_area(heights, expected):
    assert max_container_area(heights) == expected


@pytest.mark.parametrize("heights", random_lists(low=0, high=9))
def test_max_container_area_matches_brute_force(heights):
    expected = max(
        (
            (j - i) * min(heights[i], heights[j])
            for i, j in itertools.combinations(range(len(heights)), 2)
        ),
        default=0,
    )
    assert max_container_area(heights) == expected


@pytest.mark.parametrize("k", [1, 2, 3])
@pytest.mark.parametrize("nums", random_lists(low=0, high=3))
def test_compact_keep_at_most_matches_brute_force(nums, k):
    nums = sorted(nums)
    expected = [
        value for value, group in itertools.groupby(nums) for value in list(group)[:k]
    ]
    arr = list(nums)
    kept = compact_keep_at_most(arr, k)
    assert arr[:kept] == expected


@pytest.mark.parametrize(
    "first, second",
    [([], []), ([1], []), ([], [1]), ([1, 3, 5], [2, 4]), ([1, 1], [1])],
)
def test_merge_sorted(first, second):
    assert merge_sorted(first, second) == sorted(first + second)


@pytest.mark.parametrize("nums", random_lists())
def test_merge_into_first_matches_sorted(nums):
    split = len(nums) // 2
    first, second = sorted(nums[:split]), sorted(nums[split:])
    buffer = first + [0] * len(second)
    assert merge_into_first(buffer, len(first), second, len(second)) is None
    assert buffer == sorted(nums)


@pytest.mark.parametrize("nums", random_lists(max_len=8, low=-4, high=4))
def test_unique_triplets_with_sum_matches_brute_force(nums):
    for target in (-2, 0, 3):
        expected = sorted(
            {
                tuple(sorted(c))
                for c in itertools.combinations(nums, 3)
                if sum(c) == target
            }
        )
        got = unique_triplets_with_sum(nums, target)
        assert [tuple(t) for t in got] == expected


@pytest.mark.parametrize(
    "heights, expected",
    [
        ([], 0),
        ([3], 0),
        ([2, 0], 0),
        ([3, 0, 3], 3),
        ([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], 6),
    ],
)
def test_trapped_water(heights, expected):
    assert trapped_water(heights) == expected


@pytest.mark.parametrize("heights", random_lists(low=0, high=6))
def test_trapped_water_matches_brute_force(heights):
    expected = sum(
        min(max(heights[: i + 1]), max(heights[i:])) - heights[i]
        for i in range(len(heights))
    )
    assert trapped_water(heights) == expected


@pytest.mark.parametrize("length", range(1, 12))
def test_find_middle(length):
    assert find_middle(list(range(length))) == length // 2
