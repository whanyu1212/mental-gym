def find_best_cut_position(wall):
    """
    Find the position where a vertical line would cut through the minimum number of bricks.

    Args:
        wall (List[List[int]]): List of rows, where each row contains the lengths of bricks

    Returns:
        tuple: (position, number of cuts needed)
    """
    if not wall:
        return (0, 0)

    # Calculate wall width (sum of bricks in any row)
    wall_width = sum(wall[0])  # e.g., 10

    # Dictionary to store count of edges at each position
    edge_counts = {}

    # Process each row
    for row in wall:
        position = 0
        # For each brick except the last one in the row
        for brick_length in row[:-1]:
            position += brick_length  # unit position of the brick
            # Count edge positions (where bricks meet)
            edge_counts[position] = edge_counts.get(position, 0) + 1

    print(edge_counts)

    # Find position with maximum number of edges
    max_edges = 0
    best_position = 0

    # Check all positions except leftmost (0) and rightmost (wall_width)
    for position in range(1, wall_width):
        edges = edge_counts.get(position, 0)  # get the number of edges at the position
        if edges > max_edges:
            max_edges = edges
            best_position = position

    # Number of rows minus number of edges = number of cuts needed
    cuts_needed = (
        len(wall) - max_edges
    )  # finding a place where the edges align the most

    return (best_position, cuts_needed)


def solve_wall_problem():
    # Read number of rows
    r = int(input())  # e.g., 6

    # Read wall configuration
    wall = []
    for _ in range(r):  # subsequent r lines
        row = list(map(int, input().split()))
        wall.append(row)

    # Find best cut position and minimum cuts needed
    position, cuts = find_best_cut_position(wall)

    # return cuts
    return cuts


# Example usage
if __name__ == "__main__":
    # Example input:
    # 6
    # 3 5 1 1
    # 2 3 3 2
    # 5 5
    # 4 4 2
    # 1 3 3 3
    # 1 1 6 2

    # 5
    # 1 5 7 1 999999986
    # 2 11 3 999999984
    # 5 5 2 6 999999982
    # 6 5 9 999999980
    # 3 3 3 3 2 8 999999978
    print(f"Minimum cuts needed: {solve_wall_problem()}")
