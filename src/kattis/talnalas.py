# This is an example of unweighted graph traversal SSSP problem that can be solved by
# BFS. The problem is to find the shortest path from the initial state to the actual
# passcode by changing the digits of the initial state one by one.
import sys
from collections import deque


def generate_list_of_neighbors(current_state: str, n_digits: int) -> list[str]:
    """Generate a list of possible neighbors of the current state by changing one digit
    at a time (+1 or -1).

    Args:
        current_state (str): the state of the numbers of the digital lock as a string
        n_digits (int): the number of digits on the digital lock that can be changed

    Returns:
        list[str]: a list of possible neighbors of the current state
    """
    neighbors = []
    for i in range(n_digits):
        neighbors.append(
            current_state[:i]  # empty if i == 0
            + str((int(current_state[i]) + 1) % 10)
            + current_state[i + 1 :]
        )
        neighbors.append(
            current_state[:i]
            + str((int(current_state[i]) - 1) % 10)
            + current_state[i + 1 :]
        )
    return neighbors


def check_allowed_neighbors(
    neighbors: list[str], allowed_passcodes: list[int]
) -> list[str]:
    """Check if the neighbors are allowed passcodes.

    Args:
        neighbors (list[str]): a list of possible neighbors of the current state
        allowed_passcodes (list[int]): a list of allowed passcodes

    Returns:
        list[str]: a list of allowed neighbors
    """
    return [neighbor for neighbor in neighbors if neighbor in allowed_passcodes]


def bfs(initial_state: str, actual_passcode: str, allowed_passcodes: list[int]) -> int:
    """Breadth-first search to find the shortest path from the initial state to the
    actual passcode.

    Args:
        initial_state (str): the initial state of the digital lock
        actual_passcode (str): the actual passcode of the digital lock
        allowed_passcodes (list[int]): a list of allowed passcodes

    Returns:
        int: the shortest path from the initial state to the actual passcode
    """

    visited = set()
    queue = deque([initial_state])
    distance = {initial_state: 0}
    predecessors = {initial_state: None}

    while queue:
        u = queue.popleft()
        visited.add(u)

        # If we have reached the actual passcode, break
        if u == actual_passcode:
            break

        # Check all the possible neighbors of the current state
        neighbors = generate_list_of_neighbors(u, len(u))
        # Check which neighbors are allowed passcodes
        allowed_neighbors = check_allowed_neighbors(neighbors, allowed_passcodes)

        for v in allowed_neighbors:
            # If the neighbor has not been visited, add it to the queue
            if v not in visited:
                queue.append(v)
                visited.add(v)
                # Update the distance and predecessor
                distance[v] = distance[u] + 1
                predecessors[v] = u

    # if we cannot reach the actual passcode
    if actual_passcode not in distance:
        return -1, []

    path = []
    step = actual_passcode  # Start from the last step
    while step is not None:
        path.append(step)  # Add the step to the path
        step = predecessors[step]  # find its previous step
    path.reverse()  # Reverse the path to get the correct order

    # return distance[actual_passcode], path
    return distance[actual_passcode], path


if __name__ == "__main__":
    # with open("input.txt", "r") as file:
    #     input_data = file.read().strip().split()
    input_data = sys.stdin.read().strip().split()

    # It's better to leave the numbers as strings for digit manipulation
    n_digits, n_lucky_numbers, initial_state, actual_passcode, *lucky_nums = input_data
    n_digits = int(n_digits)
    n_lucky_numbers = int(n_lucky_numbers)
    lucky_nums = lucky_nums[-n_lucky_numbers:]
    allowed_passcodes = set(lucky_nums + [actual_passcode])

    distance, path = bfs(initial_state, actual_passcode, allowed_passcodes)

    if distance == -1:
        sys.stdout.write("Neibb\n")
    else:
        sys.stdout.write(f"{distance}\n")
        for p in path:
            sys.stdout.write(f"{p}\n")
