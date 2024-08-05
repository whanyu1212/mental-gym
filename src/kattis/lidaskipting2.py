from decimal import Decimal, getcontext

# Set the precision
getcontext().prec = 101


def get_min_max_teams(participants):
    result = participants / Decimal(3)
    result_ceiled = result.to_integral_value(rounding="ROUND_CEILING")

    return f"{participants}\n{result_ceiled}"


if __name__ == "__main__":
    participants = int(input())
    print(get_min_max_teams(participants))
