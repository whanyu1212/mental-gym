# Edge list representation is particularly suitable for Bellman-Ford because:
# The algorithm needs to iterate over all edges repeatedly
# Edge list makes it easy to check negative cycles
# Memory efficient compared to adjacency matrix
# Simple to represent weighted edges

# There are also 5 special cases involving the SSSP problem.
# When we encounter any one of them, we can solve it with different and (much) faster algorithm than the generic O(V×E)
# Bellman-Ford algorithm. They are:

# On Unweighted Graphs: O(V+E) BFS,
# On Graphs without negative weight: O((V+E) log V) Dijkstra's algorithm,
# On Graphs without negative weight cycle: O((V+E) log V) Modified Dijkstra's,
# On Tree: O(V+E) DFS/BFS,
# On Directed Acyclic Graphs (DAG): O(V+E) Dynamic Programming (DP)


def bellman_ford(graph: list, V: int, src: int) -> list:
    """Bellman-Ford algorithm to find shortest paths from a
    source vertex to all other vertices in a weighted graph.

    Args:
        graph (list): List of edges (u, v, w) where u, v are vertices
        V (int): Number of vertices
        src (int): Source vertex to find shortest paths from

    Returns:
        list: List of shortest distances from source vertex to all other vertices
    """
    dist = [float("inf")] * V  # Initialize distances to all vertices as infinity
    dist[src] = 0  # Distance from source to itself is 0

    # Relax all edges V-1 times
    # Runs V-1 times because shortest path can have at most V-1 edges
    for _ in range(V - 1):
        for u, v, w in graph:
            # If u is reachable and distance to v through u is smaller
            if dist[u] != float("inf") and dist[u] + w < dist[v]:
                # Update distance to v
                dist[v] = dist[u] + w

    # Check for negative weight cycles
    # Runs one more time to detect negative weight cycles
    # If any edge can still be relaxed after V-1 iterations, then there is a negative cycle
    for u, v, w in graph:
        if dist[u] != float("inf") and dist[u] + w < dist[v]:
            print("Graph contains negative weight cycle")
            return None

    return dist


# Example usage:
if __name__ == "__main__":
    # Graph represented as list of edges: (u, v, weight)
    graph = [(0, 1, 4), (0, 2, 3), (1, 2, -1), (1, 3, 2), (2, 3, 3)]
    V = 4  # Number of vertices
    src = 0  # Source vertex

    distances = bellman_ford(graph, V, src)
    if distances:
        print("Shortest distances from source vertex", src)
        for i in range(V):
            print(f"Vertex {i}: {distances[i]}")


# Initial: dist = [0, inf, inf, inf]
# Edge (0,1,4):
# - dist[0] + 4 = 0 + 4 = 4 < inf
# - Therefore update dist[1] = 4
# [0, 4, inf, inf]

# Edge (0,2,3):
# - dist[0] + 3 = 0 + 3 = 3 < inf
# - Therefore update dist[2] = 3
# [0, 4, 3, inf]

# Edge (1,2,-1):
# - dist[1] + (-1) = 4 + (-1) = 3 = dist[2]
# - No update needed
# [0, 4, 3, inf]
