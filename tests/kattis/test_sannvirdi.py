import pytest
from kattis_samples import run_solution, sample_cases, tokens
from sannvirdi import (
    find_value_or_closest_smaller,
    sorted_list_to_balanced_bst,
    winner_for,
)


@pytest.mark.parametrize("stdin, expected", sample_cases("sannvirdi"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("sannvirdi", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "guesses, idea, expected",
    [
        ([5, 10, 20], 4, None),  # every guess is too high
        ([5, 10, 20], 5, 5),  # exact match
        ([5, 10, 20], 19, 10),  # closest from below
        ([5, 10, 20], 10**9, 20),
        ([0, 10], 0, 0),  # 0 is a legal guess
        ([0, 10], 9, 0),
        ([7], 7, 7),
    ],
)
def test_find_value_or_closest_smaller(guesses, idea, expected):
    root = sorted_list_to_balanced_bst(sorted(guesses))
    assert find_value_or_closest_smaller(root, idea) == expected


def test_winner_for_treats_zero_guess_as_a_winner():
    names_by_guess = {0: "zero", 10: "ten"}
    root = sorted_list_to_balanced_bst(sorted(names_by_guess))
    assert winner_for(root, names_by_guess, 0) == "zero"
    assert winner_for(root, names_by_guess, 9) == "zero"
    assert winner_for(root, names_by_guess, 10) == "ten"


def test_winner_for_no_winner():
    names_by_guess = {5: "eva"}
    root = sorted_list_to_balanced_bst(sorted(names_by_guess))
    assert winner_for(root, names_by_guess, 4) == ":("


def test_zero_guess_end_to_end():
    stdin = "2\nzero 0\nten 10\n3\n0\n5\n9\n"
    assert tokens(run_solution("sannvirdi", stdin)) == ["zero", "zero", "zero"]
