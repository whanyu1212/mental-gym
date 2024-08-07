import sys
from typing import Tuple


def process_multiline_input(numbers: list) -> Tuple[int, int]:
    d, b = int(numbers[0].strip()), int(numbers[1].strip())
    return d, b


def calculate_distance_geom(d, b):
    if d == 0:
        return 0
    # Sum of geometric series formula, for loop will run into time limit issue
    distance = d * (1 - (1 / 2) ** (b + 1)) / (1 - 1 / 2)
    return distance


if __name__ == "__main__":
    message = sys.stdin.readlines()
    d, b = process_multiline_input(message)
    print(calculate_distance_geom(d, b))
