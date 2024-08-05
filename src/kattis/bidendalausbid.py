import sys
from typing import Tuple


def process_multiline_input(message: list) -> Tuple[int, int, int, int]:
    h1, m1 = map(int, message[0].strip().split(":"))
    h2, m2 = map(int, message[1].strip().split(":"))

    return h1, m1, h2, m2


def calculate_waited_time_in_minutes(h1: int, m1: int, h2: int, m2: int) -> int:
    diff_in_minutes = h2 * 60 + m2 - h1 * 60 - m1

    if diff_in_minutes < 0:
        diff_in_minutes += 24 * 60

    return diff_in_minutes


if __name__ == "__main__":
    message = sys.stdin.readlines()
    h1, m1, h2, m2 = process_multiline_input(message)
    print(calculate_waited_time_in_minutes(h1, m1, h2, m2))
