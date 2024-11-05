# Topological sort is a technique used in graph theory to order the vertices of a directed acyclic graph (DAG).
# It ensures that for every directed edge from vertex ( u ) to vertex ( v ), vertex ( u ) comes before vertex ( v ) in the ordering.


# The topological_sort function needs to go through every single node in the graph
# to ensure that all nodes are included in the topological order, even if they are
# not reachable from the starting node of the DFS traversal.

from collections import deque, defaultdict


def dfs(node, visited, rec_stack, stack, graph):
    visited.add(node)
    rec_stack.add(node)

    for neighbor in graph[node]:
        if neighbor not in visited:
            if not dfs(neighbor, visited, rec_stack, stack, graph):
                return False
        elif neighbor in rec_stack:
            # Cycle detected
            return False

    rec_stack.remove(node)
    stack.append(node)
    return True


def topological_sort(graph):
    visited = set()
    rec_stack = set()
    stack = []

    for node in graph:
        if node not in visited:
            if not dfs(node, visited, rec_stack, stack, graph):
                raise ValueError(
                    "Graph has at least one cycle, topological sort not possible"
                )

    return stack[::-1]


def kahn_topological_sort(graph):
    # Calculate in-degrees of all nodes
    in_degree = defaultdict(int)
    for node in graph:
        in_degree[node] = 0  # Initialize in-degree of each node to 0

    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] += 1  # Increment in-degree for each neighbor

    # Collect nodes with in-degree 0, means it has no edge coming into it
    zero_in_degree_queue = deque([node for node in graph if in_degree[node] == 0])

    topological_order = []

    while zero_in_degree_queue:
        # We pop the node with in-degree 0 from the queue
        node = zero_in_degree_queue.popleft()
        # Append it to the topological order
        topological_order.append(node)

        # For that node,
        # Decrease the in-degree of each neighbor

        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                # If in-degree of a neighbor becomes 0, add it to the queue as well
                zero_in_degree_queue.append(neighbor)

    # Check if there was a cycle
    if len(topological_order) == len(graph):
        return topological_order
    else:
        raise ValueError("Graph has at least one cycle, topological sort not possible")


# Example usage
if __name__ == "__main__":
    graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"], "E": []}
    try:
        result = topological_sort(graph)
        print("Topological Sort:", result)
    except ValueError as e:
        print(e)

    try:
        result = kahn_topological_sort(graph)
        print("Kahn's Topological Sort:", result)
    except ValueError as e:
        print(e)
