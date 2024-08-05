# There is only 1 input which is the year to check against 2020
# Function needed: 1. Check if the input year is a leap year 2. Count the number of leap years between 2020 and the input year


def is_leap_year(year):
    # A year is a leap year if it is divisible by 4
    if year % 4 == 0:
        # However, if the year is also divisible by 100, it is not a leap year
        # unless it is also divisible by 400
        if year % 100 == 0:
            if year % 400 == 0:
                return True
            else:
                return False
        else:
            return True
    else:
        return False


def leap_year_up_to(year):
    """
    Count the years divisible by 4 first,
    then subtract the years divisible by 100 because
    these 2 conditions are mutually exclusive.
    Finally, add back some that are divisible by 400
    """
    return year // 4 - year // 100 + year // 400


if __name__ == "__main__":
    input_year = int(input())
    if is_leap_year(input_year):
        print(leap_year_up_to(input_year) - leap_year_up_to(2020))
    else:
        print("Neibb")
