from collections import deque
from typing import List, Tuple, Set


def find_most_landlocked_country(grid: List[str]) -> Tuple[str, int]:
    rows, cols = len(grid), len(grid[0])

    # Helper function to get valid neighbors
    def get_neighbors(r: int, c: int) -> List[Tuple[int, int]]:
        directions = [
            (-1, -1),
            (-1, 0),
            (-1, 1),
            (0, -1),
            (0, 1),
            (1, -1),
            (1, 0),
            (1, 1),
        ]
        neighbors = []
        for dr, dc in directions:
            new_r, new_c = r + dr, c + dc
            if 0 <= new_r < rows and 0 <= new_c < cols:
                neighbors.append((new_r, new_c))
        return neighbors

    # Find all countries and their cells
    country_cells = {}
    for r in range(rows):
        for c in range(cols):
            if grid[r][c].isalpha():
                if grid[r][c] not in country_cells:
                    country_cells[grid[r][c]] = []
                country_cells[grid[r][c]].append((r, c))

    def bfs_to_sea(start_cells: List[Tuple[int, int]]) -> int:
        queue = deque()
        visited = set()

        # Add all starting cells with distance 0
        for cell in start_cells:
            queue.append((cell, 0))
            visited.add(cell)

        borders_crossed = 0
        while queue:
            (r, c), borders = queue.popleft()

            # Check if we reached water
            for nr, nc in get_neighbors(r, c):
                if grid[nr][nc] == "~":
                    return borders

                if (nr, nc) not in visited:
                    visited.add((nr, nc))
                    # If moving to a different country, increment borders
                    new_borders = borders + (1 if grid[nr][nc] != grid[r][c] else 0)
                    queue.append(((nr, nc), new_borders))

        return float("inf")  # If no path to sea is found

    # Calculate landlocked level for each country
    landlocked_levels = {}
    for country in country_cells:
        landlocked_levels[country] = bfs_to_sea(country_cells[country])

    # Find the most landlocked country (with lowest alphabetical order in case of tie)
    max_level = max(landlocked_levels.values())
    most_landlocked = min(
        [
            country
            for country in landlocked_levels
            if landlocked_levels[country] == max_level
        ]
    )

    return most_landlocked, max_level


# Process the example test case

if __name__ == "__main__":
    test_case = [
        "~~~~CBBBC~",
        "~~~~CBYBC~",
        "~~~~CBBBC~",
        "~~~~CCCCC~",
        "~~~~~~~~~~",
        "~EFGHI~~~~",
        "~DAAAJ~~~~",
        "~DAXAK~~~~",
        "~DAAAL~~~~",
    ]

    country, level = find_most_landlocked_country(test_case)
    print(f"Most landlocked country: {country}")
    print(f"Number of borders to cross: {level}")
