import os
import sys
import pytest


# Add the src/kattis directory to the PYTHONPATH
path_to_add = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../src/kattis/python")
)
sys.path.insert(0, path_to_add)

from hlaupafmaeli import is_leap_year, leap_year_up_to


def test_is_leap_year():
    assert is_leap_year(2020) == True
    assert is_leap_year(2021) == False
    assert is_leap_year(1900) == False
    assert is_leap_year(2000) == True
    assert is_leap_year(2400) == True
    assert is_leap_year(2401) == False


def test_leap_year_up_to():
    assert leap_year_up_to(2020) == 490  # Assuming 2020 is the 490th leap year
    assert (
        leap_year_up_to(2021) == 490
    )  # 2021 is not a leap year, so the count remains the same
    assert (
        leap_year_up_to(2024) == 491
    )  # 2024 is the next leap year, so the count increases by 1
