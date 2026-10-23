import pytest
from inflation2 import apply_inflation
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("inflation2"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("inflation2", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "prices, events, expected",
    [
        ([5], ["INFLATION 0"], [5]),
        ([1, 2], ["SET 9 4"], [3]),  # no dish has price 9
        ([2, 2, 3], ["SET 2 7"], [17]),  # every matching dish changes
        # SET matches the post-inflation price: [3, 5] -> [1, 5].
        ([1, 3], ["INFLATION 2", "SET 3 1"], [8, 6]),
        ([4, 4], ["SET 4 4"], [8]),  # set to the same price
    ],
)
def test_apply_inflation(prices, events, expected):
    assert apply_inflation(prices, events) == expected
