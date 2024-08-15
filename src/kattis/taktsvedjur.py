import sys


def calculate_game_score(
    input_points: list[int], multipliers: list[int], hits_to_next_level: list[int]
) -> int:
    """Calculate the score of a game based on the input points, multipliers, and hits to next level.
    Based on the input points, the score is calculated by multiplying the points with the corresponding multiplier.
    The multiplier is determined by the number of consecutive hits that have been made.
    The number of consecutive hits required to move to the next level is determined by the hits to next level list.
    current_hits is used to keep track of the current level of the player.

    Args:
        input_points (list[int]): a list of scores ranging from 0 to 115
        multipliers (list[int]): [1, 2, 4, 8]
        hits_to_next_level (list[int]): [2, 4, 8]

    Returns:
        int: the total score of the game
    """
    score_tracker = 0
    current_hits = 0
    consecutive_hits = 0

    for i in input_points:
        if i > 0:
            consecutive_hits += 1
            # print(f"Current hits: {current_hits}", f"Consecutive hits: {consecutive_hits}")
            if (
                current_hits < len(hits_to_next_level)
                and consecutive_hits >= hits_to_next_level[current_hits]
            ):
                current_hits += 1
                consecutive_hits = 0  # reset the counter
            score_tracker += i * multipliers[current_hits]
            # print(score_tracker)
        else:
            consecutive_hits = 0
            current_hits = max(
                0, current_hits - 1
            )  # ensure that it does not go below 0
            score_tracker += i * multipliers[current_hits]
            # print(score_tracker)
    return score_tracker


if __name__ == "__main__":
    input_points = [int(i.strip()) for i in sys.stdin.readlines()[1:]]
    multipliers = [1, 2, 4, 8]
    hits_to_next_level = [2, 4, 8]

    print(calculate_game_score(input_points, multipliers, hits_to_next_level))
