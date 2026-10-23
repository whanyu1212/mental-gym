import pytest
from jage import find_cheaters
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("jage"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("jage", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "players, tags, expected",
    [
        (["a", "b"], [("a", "b")], (0, [])),
        (["a", "b"], [("b", "a")], (1, ["b"])),
        (["a", "b", "c"], [("b", "c"), ("b", "a")], (1, ["b"])),  # counted once
        (["a", "b", "c"], [("c", "a"), ("c", "b"), ("b", "a")], (1, ["c"])),
    ],
)
def test_find_cheaters(players, tags, expected):
    assert find_cheaters(players, tags) == expected
