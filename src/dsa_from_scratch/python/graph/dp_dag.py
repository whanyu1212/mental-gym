from collections import defaultdict
from typing import List, Dict, Set
import math


class Graph:
    def __init__(self):
        # Initialize graph as adjacency list
        self.graph = defaultdict(list)
        self.V = 0  # Number of vertices

    def add_edge(self, u: int, v: int, w: int) -> None:
        """Add weighted edge to graph"""
        self.graph[u].append((v, w))
        # Taking max because the edge between u and v may be between any current vertices
        # +1 because vertices are 0-indexed
        self.V = max(self.V, u + 1, v + 1)

    def topological_sort_util(
        self, v: int, visited: Set[int], stack: List[int]
    ) -> None:
        """DFS version of topological sort"""
        visited.add(v)

        for next_node, _ in self.graph[v]:
            if next_node not in visited:
                self.topological_sort_util(next_node, visited, stack)

        stack.append(v)

    def shortest_path(self, source: int) -> Dict[int, int]:
        """Find shortest path from source using DP"""
        # Step 1: Get topological order
        visited = set()
        stack = []

        for i in range(self.V):
            if i not in visited:
                self.topological_sort_util(i, visited, stack)

        # Step 2: Initialize distances
        dist = {i: math.inf for i in range(self.V)}
        dist[source] = 0

        # Step 3: Process vertices in topological order
        while stack:
            u = stack.pop()

            # Update distances of all adjacent vertices
            if dist[u] != math.inf:
                for v, weight in self.graph[u]:
                    if dist[v] > dist[u] + weight:
                        dist[v] = dist[u] + weight

        return dist


def main():
    # Create a sample DAG
    g = Graph()
    g.add_edge(0, 1, 5)
    g.add_edge(0, 2, 3)
    g.add_edge(1, 3, 6)
    g.add_edge(1, 2, 2)
    g.add_edge(2, 3, 7)
    g.add_edge(2, 4, 4)
    g.add_edge(3, 4, -1)

    # Find shortest paths from source vertex 0
    source = 0
    distances = g.shortest_path(source)

    # Print the results
    print("Shortest distances from source vertex", source)
    for vertex, distance in distances.items():
        if distance == math.inf:
            print(f"Vertex {vertex}: No path exists")
        else:
            print(f"Vertex {vertex}: {distance}")


if __name__ == "__main__":
    main()
