from typing import List, Tuple, Set
from collections import defaultdict
import heapq


class LakeGrid:
    def __init__(self, grid: List[List[int]], rows: int, cols: int):
        self.grid = grid
        self.rows = rows
        self.cols = cols

        # Directions: N, NE, E, SE, S, SW, W, NW
        self.directions = [
            (-1, 0),
            (-1, 1),
            (0, 1),
            (1, 1),
            (1, 0),
            (1, -1),
            (0, -1),
            (-1, -1),
        ]

    def is_valid_position(self, row: int, col: int) -> bool:
        """Check if position is within lake boundaries"""
        return 0 <= row < self.rows and 0 <= col < self.cols

    def get_neighbors(self, row: int, col: int) -> List[Tuple[int, int, int]]:
        """Get valid neighbor positions and their costs"""
        neighbors = []
        current_flow = self.grid[row][col]

        for dir_idx, (dr, dc) in enumerate(self.directions):
            new_row, new_col = row + dr, col + dc

            if self.is_valid_position(new_row, new_col):
                # Cost is 0 if moving with current, 1 otherwise
                cost = 0 if current_flow != 8 and dir_idx == current_flow else 1
                neighbors.append((new_row, new_col, cost))

        return neighbors


def find_min_energy_path(
    lake: LakeGrid, start: Tuple[int, int], end: Tuple[int, int]
) -> int:
    """Find minimum energy path using Dijkstra's algorithm"""
    distances = defaultdict(lambda: float("inf"))
    distances[start] = 0
    pq = [(0, start)]
    visited = set()

    while pq:
        current_dist, (current_row, current_col) = heapq.heappop(pq)

        if (current_row, current_col) == end:
            return current_dist

        if (current_row, current_col) in visited:
            continue

        visited.add((current_row, current_col))

        for next_row, next_col, cost in lake.get_neighbors(current_row, current_col):
            if (next_row, next_col) not in visited:
                new_dist = current_dist + cost
                if new_dist < distances[(next_row, next_col)]:
                    distances[(next_row, next_col)] = new_dist
                    heapq.heappush(pq, (new_dist, (next_row, next_col)))

    return -1  # No path found


def solve_lake_currents() -> int:
    # Read input
    r, c = map(int, input().split())
    grid = []
    for _ in range(r):
        row = list(map(int, list(input().strip())))
        grid.append(row)
    r1, c1, r2, c2 = map(int, input().split())

    # Create lake grid and find minimum energy path
    lake = LakeGrid(grid, r, c)
    return find_min_energy_path(lake, (r1 - 1, c1 - 1), (r2 - 1, c2 - 1))


if __name__ == "__main__":
    result = solve_lake_currents()
    print(result)
