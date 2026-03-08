from hlaupafmaeli import is_leap_year, leap_year_up_to


def test_is_leap_year():
    assert is_leap_year(2020)
    assert is_leap_year(2021) is False
    assert is_leap_year(1900) is False
    assert is_leap_year(2000)
    assert is_leap_year(2400)
    assert is_leap_year(2401) is False


def test_leap_year_up_to():
    assert leap_year_up_to(2020) == 490  # Assuming 2020 is the 490th leap year
    assert (
        leap_year_up_to(2021) == 490
    )  # 2021 is not a leap year, so the count remains the same
    assert (
        leap_year_up_to(2024) == 491
    )  # 2024 is the next leap year, so the count increases by 1
