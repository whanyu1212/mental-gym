import pytest
from kattis_samples import run_solution, sample_cases, tokens
from taktsvedjur import calculate_game_score

MULTIPLIERS = [1, 2, 4, 8]
HITS_TO_NEXT_LEVEL = [2, 4, 8]


@pytest.mark.parametrize("stdin, expected", sample_cases("taktsvedjur"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("taktsvedjur", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "notes, expected",
    [
        ([0, 0, 0], 0),  # never hits
        ([10, 0, 10, 0, 10], 30),  # never two in a row: stays at x1
        ([10, 10], 30),  # second hit already counts double
        ([10] * 6, 10 + 20 * 4 + 40),  # x2 after 2 hits, x4 after 4 more
        ([10] * 14 + [10], 10 + 20 * 4 + 40 * 8 + 80 * 2),  # caps at x8
        ([10, 10, 0, 10], 30 + 0 + 10),  # a miss drops one step
    ],
)
def test_calculate_game_score(notes, expected):
    assert calculate_game_score(notes, MULTIPLIERS, HITS_TO_NEXT_LEVEL) == expected
