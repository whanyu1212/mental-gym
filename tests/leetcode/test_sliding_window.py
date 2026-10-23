"""Tests for src/leetcode/sliding_window."""

import pytest
from character_replacement import Solution as CharacterReplacement
from contains_duplicate_2 import Solution as ContainsDuplicateII
from longest_substring import Solution as LongestSubstring
from max_profit import Solution as MaxProfit
from subarrays_with_avg_geq_threshold import Solution as SubarraysWithAvg


@pytest.mark.parametrize(
    "s, k, expected",
    [
        ("ABAB", 2, 4),
        ("AABABBA", 1, 4),
        ("XYYX", 2, 4),
        ("AAAA", 0, 4),
        ("ABCD", 0, 1),
        ("A", 1, 1),
    ],
)
def test_character_replacement(s, k, expected):
    assert CharacterReplacement().characterReplacement(s, k) == expected


@pytest.mark.parametrize(
    "nums, k, expected",
    [
        ([1, 2, 3, 1], 3, True),
        ([1, 0, 1, 1], 1, True),
        ([1, 2, 3, 1, 2, 3], 2, False),
        ([1, 2, 3, 1], 2, False),  # duplicate exactly one step too far
        ([1], 1, False),
        ([1, 1], 0, False),
    ],
)
def test_contains_nearby_duplicate(nums, k, expected):
    assert ContainsDuplicateII().containsNearbyDuplicate(nums, k) is expected


@pytest.mark.parametrize(
    "s, expected",
    [
        ("abcabcbb", 3),
        ("bbbbb", 1),
        ("pwwkew", 3),
        ("", 0),
        (" ", 1),
        ("abba", 2),  # left pointer must never move backward
        ("dvdf", 3),
    ],
)
def test_length_of_longest_substring(s, expected):
    assert LongestSubstring().lengthOfLongestSubstring(s) == expected


@pytest.mark.parametrize(
    "prices, expected",
    [
        ([7, 1, 5, 3, 6, 4], 5),
        ([7, 6, 4, 3, 1], 0),
        ([1], 0),
        ([2, 4, 1], 2),
        ([3, 2, 6, 5, 0, 3], 4),
    ],
)
def test_max_profit(prices, expected):
    assert MaxProfit().maxProfit(prices) == expected


@pytest.mark.parametrize(
    "arr, k, threshold, expected",
    [
        ([2, 2, 2, 2, 5, 5, 5, 8], 3, 4, 3),
        ([11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5, 6),
        ([1, 1, 1], 3, 1, 1),
        ([1, 2, 3], 1, 4, 0),
        ([4], 1, 4, 1),  # average exactly at threshold counts
    ],
)
def test_num_of_subarrays(arr, k, threshold, expected):
    assert SubarraysWithAvg().numOfSubarrays(arr, k, threshold) == expected
