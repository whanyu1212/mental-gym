"""Tests for src/leetcode/stack."""

import pytest
from eval_rpn import Solution as EvalRPN
from generate_parenthesis import Solution as GenerateParenthesis
from max_sliding_window import Solution as MaxSlidingWindow
from merge_2_sorted_lists import ListNode
from merge_2_sorted_lists import Solution as MergeTwoLists
from min_stack import MinStack
from permutation_in_string import Solution as PermutationInString
from valid_sudoku import Solution as ValidSudoku


def to_linked(values):
    head = None
    for value in reversed(values):
        head = ListNode(value, head)
    return head


def to_list(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    return values


@pytest.mark.parametrize(
    "tokens, expected",
    [
        (["2", "1", "+", "3", "*"], 9),
        (["4", "13", "5", "/", "+"], 6),
        (
            ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"],
            22,
        ),
        (["7"], 7),
        (["-7", "2", "/"], -3),  # division truncates toward zero
        (["7", "-2", "/"], -3),
        (["3", "4", "-"], -1),  # operand order matters
    ],
)
def test_eval_rpn(tokens, expected):
    assert EvalRPN().evalRPN(tokens) == expected


@pytest.mark.parametrize(
    "n, expected",
    [
        (1, ["()"]),
        (2, ["(())", "()()"]),
        (3, ["((()))", "(()())", "(())()", "()(())", "()()()"]),
    ],
)
def test_generate_parenthesis(n, expected):
    assert sorted(GenerateParenthesis().generateParenthesis(n)) == expected


def test_generate_parenthesis_count_is_catalan():
    result = GenerateParenthesis().generateParenthesis(5)
    assert len(result) == len(set(result)) == 42


@pytest.mark.parametrize(
    "nums, k, expected",
    [
        ([1, 3, -1, -3, 5, 3, 6, 7], 3, [3, 3, 5, 5, 6, 7]),
        ([1], 1, [1]),
        ([1, -1], 1, [1, -1]),
        ([9, 11], 2, [11]),
        ([4, -2], 2, [4]),
        ([7, 2, 4], 2, [7, 4]),
        ([1, 3, 1, 2, 0, 5], 3, [3, 3, 2, 5]),
    ],
)
def test_max_sliding_window(nums, k, expected):
    assert MaxSlidingWindow().maxSlidingWindow(nums, k) == expected


@pytest.mark.parametrize(
    "list1, list2, expected",
    [
        ([1, 2, 4], [1, 3, 4], [1, 1, 2, 3, 4, 4]),
        ([], [], []),
        ([], [0], [0]),
        ([5], [], [5]),
        ([1, 2, 3], [4, 5, 6], [1, 2, 3, 4, 5, 6]),
    ],
)
def test_merge_two_sorted_lists(list1, list2, expected):
    merged = MergeTwoLists().mergeTwoLists(to_linked(list1), to_linked(list2))
    assert to_list(merged) == expected


def test_min_stack():
    stack = MinStack()
    stack.push(-2)
    stack.push(0)
    stack.push(-3)
    assert stack.getMin() == -3
    stack.pop()
    assert stack.top() == 0
    assert stack.getMin() == -2


def test_min_stack_duplicate_minimums():
    stack = MinStack()
    for value in [2, 1, 1, 3]:
        stack.push(value)
    assert stack.getMin() == 1
    stack.pop()  # 3
    stack.pop()  # one of the 1s
    assert stack.getMin() == 1
    stack.pop()
    assert stack.getMin() == 2
    assert stack.top() == 2


@pytest.mark.parametrize(
    "s1, s2, expected",
    [
        ("ab", "eidbaooo", True),
        ("ab", "eidboaoo", False),
        ("abc", "lecabee", True),
        ("abc", "lecaabee", False),
        ("a", "a", True),
        ("abc", "ab", False),  # s1 longer than s2
        ("adc", "dcda", True),  # match at the very end
    ],
)
def test_permutation_in_string(s1, s2, expected):
    assert PermutationInString().checkInclusion(s1, s2) is expected


VALID_BOARD = [
    ["1", "2", ".", ".", "3", ".", ".", ".", "."],
    ["4", ".", ".", "5", ".", ".", ".", ".", "."],
    [".", "9", "8", ".", ".", ".", ".", ".", "3"],
    ["5", ".", ".", ".", "6", ".", ".", ".", "4"],
    [".", ".", ".", "8", ".", "3", ".", ".", "5"],
    ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
    [".", ".", ".", ".", ".", ".", "2", ".", "."],
    [".", ".", ".", "4", "1", "9", ".", ".", "8"],
    [".", ".", ".", ".", "8", ".", ".", "7", "9"],
]


def with_cell(board, row, col, value):
    copy = [r[:] for r in board]
    copy[row][col] = value
    return copy


@pytest.mark.parametrize(
    "board, expected",
    [
        (VALID_BOARD, True),
        (with_cell(VALID_BOARD, 0, 8, "1"), False),  # duplicate in row 0
        (with_cell(VALID_BOARD, 8, 0, "1"), False),  # duplicate in column 0
        (with_cell(VALID_BOARD, 2, 0, "2"), False),  # duplicate in top-left box
        ([["."] * 9 for _ in range(9)], True),
    ],
)
def test_valid_sudoku(board, expected):
    assert ValidSudoku().isValidSudoku(board) is expected
