from collections import deque

# BFS will very likely produce wrong answer when run on weighted graphs as
# BFS is not actually designed for to solve the weighted version of SSSP problem


def bfs_shortest_path(adj_list: dict, src: int, V: int) -> list:
    """Find shortest paths in unweighted graph using BFS.

    Args:
        adj_list (dict): Graph as adjacency list where adj_list[u] contains neighbors of u
        src (int): Source vertex
        V (int): Number of vertices

    Returns:
        list: Distances from source to all vertices
    """
    # Initialize distances
    # Create a list of distances to all vertices and initialize them as infinity

    dist = [float("inf")] * V
    # Distance from source to itself is 0
    dist[src] = 0

    # Queue for BFS
    queue = deque([src])

    while queue:
        u = queue.popleft()

        # Process all neighbors
        for v in adj_list[u]:
            if dist[v] == float("inf"):
                dist[v] = dist[u] + 1
                # Add to queue to process its neighbors
                queue.append(v)

    return dist


# Example usage
if __name__ == "__main__":
    # Example graph as adjacency list
    graph = {0: [1, 2], 1: [0, 2, 3], 2: [0, 1, 3], 3: [1, 2]}

    distances = bfs_shortest_path(graph, 0, 4)
    print(f"Shortest distances from vertex 0: {distances}")
