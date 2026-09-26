import pytest
from gangur import count_passes
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("gangur"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("gangur", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "hallway, expected",
    [
        ("-", 0),
        (">", 0),
        ("<", 0),
        ("<>", 0),  # facing away from each other never meet
        ("><", 1),
        (">>><<<", 9),  # every right-walker meets every left-walker after it
        (">-<>-<", 3),
    ],
)
def test_count_passes(hallway, expected):
    assert count_passes(hallway) == expected
