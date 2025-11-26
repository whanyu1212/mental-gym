from heapq import heappush, heappop


def modified_dijkstra(graph: dict, src: int, V: int) -> list:
    """Modified Dijkstra's algorithm that handles negative weights.

    Args:
        graph (dict): Graph as adjacency list with (vertex, weight) pairs
        src (int): Source vertex
        V (int): Number of vertices

    Returns:
        list: Shortest distances or None if negative cycle exists
    """
    dist = [float("inf")] * V
    dist[src] = 0

    # Priority queue: (distance, vertex)
    pq = [(0, src)]

    # Track number of relaxations per vertex
    relax_count = [0] * V

    while pq:
        d, u = heappop(pq)

        # Check for negative cycle
        relax_count[u] += 1
        if relax_count[u] >= V:
            return None  # Negative cycle detected

        # Process neighbors
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heappush(pq, (dist[v], v))

    return dist


# Example usage
if __name__ == "__main__":
    # Graph with negative edges but no negative cycles
    graph = {0: [(1, 4), (2, 1)], 1: [(3, 1)], 2: [(1, -2)], 3: []}  # Negative edge

    # Graph with negative cycle
    graph_cycle = {
        0: [(1, 1)],
        1: [(2, -3)],
        2: [(1, 1)],  # Creates cycle: 1->2->1 with total weight -2
    }

    print("Graph without negative cycle:", modified_dijkstra(graph, 0, 4))
    print("Graph with negative cycle:", modified_dijkstra(graph_cycle, 0, 3))
