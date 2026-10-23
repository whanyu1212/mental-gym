import pytest
from ferskastajarmid import sort_memes
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("ferskastajarmid"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("ferskastajarmid", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "memes, expected",
    [
        ([["only.png", 1, 1]], "only.png"),
        ([["a", 2, 3], ["b", 1, 5]], "a"),
        ([["zeta", 2, 3], ["alpha", 3, 2]], "alpha"),  # tie -> alphabetical
        ([["B", 0, 9], ["a", 0, 0]], "B"),  # all zero; uppercase sorts first
    ],
)
def test_sort_memes(memes, expected):
    assert sort_memes(memes) == expected
