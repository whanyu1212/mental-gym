"""Tests for both charting_progress solutions (``chartingprogress`` on
Kattis)."""

import pytest
from charting_progress_2 import charting_progress
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("module", ["charting_progress", "charting_progress_2"])
@pytest.mark.parametrize("stdin, expected", sample_cases("chartingprogress"))
def test_official_samples(module, stdin, expected):
    assert tokens(run_solution(module, stdin)) == tokens(expected)


# Columns are sorted by value ascending; a column's value is its star's height
# from the bottom, so the sorted log's stars rise from bottom-left to top-right.
@pytest.mark.parametrize(
    "log, expected",
    [
        (["*\n"], "*\n"),  # 1x1 log
        (["*.\n", ".*\n"], ".*\n*.\n"),  # values [2, 1] -> [1, 2]
        (["..\n", "**\n"], "..\n**\n"),  # equal values keep their row
        ([".*.\n", "*.*\n"], "..*\n**.\n"),  # values [1, 2, 1] -> [1, 1, 2]
    ],
)
def test_single_log(log, expected):
    assert charting_progress(log) == expected


def test_blank_line_separates_logs_and_resets_columns():
    first = ["*.\n", ".*\n"]
    second = [".*\n", "*.\n"]
    assert charting_progress(first + ["\n"] + second) == ".*\n*.\n\n.*\n*.\n"
