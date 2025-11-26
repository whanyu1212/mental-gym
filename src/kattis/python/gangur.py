# very similar to the following problem:
# https://www.geeksforgeeks.org/count-passing-car-pairs/


def count_passes(input_str: str) -> int:
    """Given a string of characters, return the number of pairs of people
    that pass each other.

    Args:
        input_str (str): a string of characters, can be either "<", "-", or ">"

    Returns:
        int: the number of pairs of people that pass each other
    """
    passes = 0
    right_facing = 0

    for i in input_str:
        if i == ">":
            right_facing += 1
        elif i == "<":
            passes += right_facing

    return passes


if __name__ == "__main__":
    input_str = input().strip()
    print(count_passes(input_str))
