from heapq import heappush, heappop


def dijkstra(graph: dict, src: int, V: int) -> list:
    """Find shortest paths from source vertex using Dijkstra's algorithm.

    Args:
        graph (dict): Graph as adjacency list where graph[u] contains (v,w) pairs
        src (int): Source vertex
        V (int): Number of vertices

    Returns:
        list: Shortest distances from source to all vertices
    """
    # Initialize distances
    dist = [float("inf")] * V
    dist[src] = 0

    # Priority queue to store (distance, vertex)
    pq = [(0, src)]

    # Track visited vertices
    visited = set()

    while pq:
        # Get vertex with minimum distance
        d, u = heappop(pq)

        if u in visited:
            continue

        visited.add(u)

        # Update distances to neighbors
        for v, weight in graph[u]:
            if v not in visited and dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heappush(pq, (dist[v], v))

    return dist


# Example usage
if __name__ == "__main__":
    # Example graph: {vertex: [(neighbor, weight), ...]}
    graph = {0: [(1, 4), (2, 1)], 1: [(3, 1)], 2: [(1, 2), (3, 5)], 3: []}

    distances = dijkstra(graph, 0, 4)
    print(f"Shortest distances from vertex 0: {distances}")


# Example showing Dijkstra's failure with negative weight
# graph_with_negative = {
#     0: [(1, 4), (2, 1)],
#     1: [(3, 1)],
#     2: [(1, -3)],  # Negative weight edge
#     3: []
# }

# """
# What happens:
# 1. Starts at 0: dist=[0,∞,∞,∞]
# 2. Processes vertex 0:
#    - Updates dist[1]=4, dist[2]=1
#    - dist=[0,4,1,∞]
# 3. Processes vertex 2 (smallest distance):
#    - Updates dist[1] = 1 + (-3) = -2
#    - But 2 is already marked as visited!
#    - Wrong result as better path found after visiting
# """
