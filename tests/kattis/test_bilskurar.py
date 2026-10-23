import pytest
from bilskurar import count_intersections_efficient
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("bilskurar"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("bilskurar", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "houses, garages, expected",
    [
        ([1], [1], 0),
        ([1, 2], [2, 1], 1),
        ([1, 2, 3, 4, 5], [5, 4, 3, 2, 1], 10),  # every pair crosses
        ([4, 1, 3, 2], [4, 1, 3, 2], 0),  # same order, no crossings
    ],
)
def test_count_intersections(houses, garages, expected):
    assert count_intersections_efficient(houses, garages) == expected
