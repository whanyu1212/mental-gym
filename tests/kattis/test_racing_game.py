import pytest
from kattis_samples import run_solution, sample_cases, tokens
from racing_game import parse_score


@pytest.mark.parametrize("stdin, expected", sample_cases("racinggame"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("racing_game", stdin)) == tokens(expected)


def flatten(ops):
    return [x for op in ops for x in op]


@pytest.mark.parametrize(
    "ops, expected",
    [
        ([(1, 5), (3, 1)], [5]),
        ([(1, 5), (1, 3), (1, 9), (3, 2)], [5]),
        ([(1, 5), (2, -7), (3, 1)], [-2]),  # records may go negative
        ([(2, 100), (1, 1), (3, 1)], [1]),  # add before any record is a no-op
        # Only the 10 fastest can ever be asked for; slower ones may be dropped.
        ([(1, v) for v in range(20, 0, -1)] + [(3, 10)], [10]),
    ],
)
def test_parse_score(ops, expected):
    assert parse_score(flatten(ops)) == expected
