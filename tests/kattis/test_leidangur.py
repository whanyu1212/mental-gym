import pytest
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("leidangur"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("leidangur", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "journey, expected",
    [
        ("...", ["0", "0", "0"]),  # nothing happens
        ("p", ["1", "0", "0"]),
        ("oO", ["0", "0", "0"]),  # bag ends empty but every demand was met
        ("pgGP", ["0", "0", "0"]),
        ("pgoO", ["1", "1", "0"]),
        ("pgoG", ["1", "0", "0"]),  # must throw away the jewel to reach the gold
        ("P", ["Neibb"]),
        ("gP", ["Neibb"]),  # digs past the gold, still no money
        ("pPP", ["Neibb"]),
    ],
)
def test_edge_cases(journey, expected):
    assert tokens(run_solution("leidangur", journey + "\n")) == expected
