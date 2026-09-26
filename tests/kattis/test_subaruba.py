import pytest
from kattis_samples import run_solution, sample_cases, tokens
from subaruba import process_text_ubbi_dubbi

VOWELS = set("aeiouyAEIOUY")


@pytest.mark.parametrize("stdin, expected", sample_cases("subaruba"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("subaruba", stdin)) == tokens(expected)


@pytest.mark.parametrize(
    "plain, encoded",
    [
        ("xyz", "xubyz"),  # y is a vowel
        ("Ola", "Uboluba"),  # capital vowel -> "Ub" + lowercase
        ("brr.", "brr."),  # no vowels
    ],
)
def test_encode_and_decode(plain, encoded):
    assert process_text_ubbi_dubbi(plain, VOWELS, "D") == encoded
    assert process_text_ubbi_dubbi(encoded, VOWELS, "A") == plain


@pytest.mark.parametrize("text", ["Sara er skrytin.", "Hubert, aye.", "ubub"])
def test_round_trip(text):
    encoded = process_text_ubbi_dubbi(text, VOWELS, "D")
    assert process_text_ubbi_dubbi(encoded, VOWELS, "A") == text
