# BFS starts at a selected node (source) and explores all of the neighbor nodes
# at the present depth prior to moving on to the nodes at the next depth level.

# Key characteristics of BFS:
# 1. Layered exploration: BFS explores nodes level by level,
# moving outward from the starting node.

# 2. Queue-based implementation: BFS uses a queue to keep track of the nodes that need to be explored.

# 3. Shortest path: In unweighted graphs, BFS can be used to find the shortest path between two nodes.

# 4. Visited tracking: BFS keeps track of the nodes that have been visited to avoid infinite loops.

# Time complexity: O(V + E), where V is the number of vertices and E is the number of edges in the graph.

from collections import deque


def bfs_traversal(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)

    while queue:
        node = queue.popleft()
        print(node, end=" ")

        for neighbor in graph[node]:
            if neighbor not in visited:
                queue.append(neighbor)
                visited.add(neighbor)


# For disconnected graphs, we need to iterate over all nodes in the graph
def bfs_full(graph):
    visited = set()
    for node in graph:
        if node not in visited:
            queue = deque([node])
            visited.add(node)

            while queue:
                current_node = queue.popleft()
                print(current_node, end=" ")

                for neighbor in graph[current_node]:
                    if neighbor not in visited:
                        queue.append(neighbor)
                        visited.add(neighbor)


# Example usage

if __name__ == "__main__":
    graph = {
        0: [1, 2],
        1: [0, 3, 4],
        2: [0, 5],
        3: [1],
        4: [1, 5],
        5: [2, 4],
    }

    print("BFS traversal starting from node 0:")
    bfs_traversal(graph, 0)
    print("\nBFS traversal of the full graph:")
    bfs_full(graph)
