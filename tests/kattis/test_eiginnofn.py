import pytest
from eiginnofn import name_query
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("eiginnofn"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("eiginnofn", stdin)) == tokens(expected)


def test_name_query():
    residents = {"Atli": None, "Arnar": "Bjarni"}
    queries = ["Atli", "Arnar", "Bjarni", "Joi"]
    assert name_query(residents, queries) == [
        "Jebb",
        "Neibb en Arnar Bjarni er heima",
        "Neibb",  # only the former given name identifies a resident
        "Neibb",
    ]
