# Implementation of DFS and BFS traversal on a graph (adjacency list representation)


# In the recursive DFS implementation, at each level of recursion,
# the current node is treated as the "start" node. The function
# explores all unvisited neighbors of this node, and for each neighbor,
# it recursively calls itself, treating that neighbor as the new "start" node.
# This process continues until all reachable nodes have been visited.

# Time complexity: O(V + E), where V is the number of vertices and E is the number of edges
# Space complexity: O(V), where V is the number of vertices
# The space complexity is O(V) because the visited set can contain at most V vertices.
# The recursive calls also consume space on the call stack, but the maximum depth of the call stack is O(V) as well.


def dfs_recursive(graph, start, visited=None):
    # Assume we start with an empty set of visited nodes
    if visited is None:
        visited = set()
    visited.add(start)
    print(f"Visiting Node {start}")

    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            print(f"Visiting Node {neighbor} from {start} since it is not visited \n")
            # Recursively visit the neighbor if it has not been visited
            dfs_recursive(graph, neighbor, visited)


# Not often used in practice, but it's good to know how to implement it
# DFS inherently follows a recursive pattern
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]  # Using a list as a stack

    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            print(node)  # Process the node
            # Add neighbors to the stack
            # Not a must to use reversed() here,
            # but it's a good practice to maintain the order of neighbors
            for neighbor in reversed(graph.get(node, [])):
                if neighbor not in visited:
                    stack.append(neighbor)


# For a disconnected graph, we need to ensure that all nodes are visited
def dfs_full(graph):
    visited = set()
    for node in graph:
        if node not in visited:
            dfs_recursive(graph, node, visited)


# Example usage
if __name__ == "__main__":
    graph = {1: [2, 3], 2: [4], 3: [], 4: [5], 5: []}

    print("DFS Recursive Traversal: \n")

    dfs_recursive(graph, 2)

    print("\nDFS Iterative Traversal: \n")

    dfs_iterative(graph, 2)

    print("\nDFS Full Traversal: \n")

    dfs_full(graph)
