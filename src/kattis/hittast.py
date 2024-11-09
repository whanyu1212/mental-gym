# This is a weighted SSSP problem with a twist. The twist is that the cost of lodging at each location is added to the
# cost of the path. The goal is to find the minimum cost to travel from location 1 to location n.

# Given a weighted SSSP Problem, the Dijkstra's algorithm can be used to solve the problem with
# a slight modification. The modification is to add the lodging cost to the cost of the path when updating the distance
# to a neighbor.
import sys
import heapq
from typing import Tuple


def create_weighted_graph(
    n_locations: int, travel_path_n_cost: list
) -> Tuple[dict, dict]:
    """Create graphs with 1-based indexing for both parties because of
    their currency exchange rate differences. their weights for the
    same edge can be different.

    Args:
        n_locations (int): number of locations.
        travel_path_n_cost (list): list of travel paths and costs
        for each party.

    Returns:
        Tuple[dict, dict]: 2 graphs with 1-based indexing for
        each party.
    """
    graph_a = {i: [] for i in range(1, n_locations + 1)}
    graph_b = {i: [] for i in range(1, n_locations + 1)}

    for path in travel_path_n_cost:
        u, v, cost_uv, cost_vu = map(int, path.split())
        # No need to adjust indices if using dict
        graph_a[u].append((v, cost_uv))
        graph_a[v].append((u, cost_uv))

        graph_b[u].append((v, cost_vu))
        graph_b[v].append((u, cost_vu))

    return graph_a, graph_b


def dijkstra(graph: dict, start: int) -> dict:
    """Dijkstra's algorithm to find the minimum travel cost to
    reach each location. we do not consider lodging costs here to
    avoid double counting.

    Args:
        graph (dict): The graph with 1-based indexing.
        start (int): The starting location number.

    Returns:
        dict: Minimum total cost to reach each location.
    """
    distances = {node: float("inf") for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        curr_cost, curr_node = heapq.heappop(pq)
        if curr_cost > distances[curr_node]:
            continue

        for neighbor, travel_cost in graph[curr_node]:
            new_cost = distances[curr_node] + travel_cost
            if new_cost < distances[neighbor]:
                distances[neighbor] = new_cost
                heapq.heappush(pq, (new_cost, neighbor))

    return distances


if __name__ == "__main__":
    input_data = sys.stdin.read().strip().split("\n")
    # with open("input.txt", "r") as file:
    #     input_data = file.read().strip().split("\n")

    n_locations, n_paths = map(int, input_data[0].split())
    lodging_cost_list = list(map(int, input_data[1].split()))
    travel_path_n_cost = input_data[2:]

    graph_a, graph_b = create_weighted_graph(n_locations, travel_path_n_cost)
    lodging_cost = {i + 1: cost for i, cost in enumerate(lodging_cost_list)}
    min_cost_a = dijkstra(graph_a, 1)
    min_cost_b = dijkstra(graph_b, n_locations)

    combined_costs = {
        location: min_cost_a[location] + min_cost_b[location] + lodging_cost[location]
        for location in min_cost_a
    }

    sys.stdout.write(str(min(combined_costs.values())) + "\n")
