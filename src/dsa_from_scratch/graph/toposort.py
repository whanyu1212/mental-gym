# Topological sort is a technique used in graph theory to order the vertices of a directed acyclic graph (DAG).
# It ensures that for every directed edge from vertex ( u ) to vertex ( v ), vertex ( u ) comes before vertex ( v ) in the ordering.


# The topological_sort function needs to go through every single node in the graph
# to ensure that all nodes are included in the topological order, even if they are
# not reachable from the starting node of the DFS traversal.

from collections import deque, defaultdict


from typing import List, Dict, Set


def dfs(
    node: int,
    visited: Set[int],
    rec_stack: Set[int],
    stack: List[int],
    graph: Dict[int, List[int]],
) -> bool:
    """
    Perform a Depth-First Search (DFS) to detect cycles and build the topological order.

    Args:
        node (int): The current node being visited.
        visited (Set[int]): A set of nodes that have been visited.
        rec_stack (Set[int]): A set of nodes in the current recursion stack.
        stack (List[int]): The list to store the topological order.
        graph (Dict[int, List[int]]): The adjacency list of the graph.

    Returns:
        bool: True if no cycle is detected, False otherwise.
    """
    # Add the current node to the visited set and recursion stack
    visited.add(node)
    # Add the current node to the recursion stack
    # to detect cycles in the current recursion path
    rec_stack.add(node)

    for neighbor in graph[node]:
        if neighbor not in visited:
            # Terminates when there is no more unvisited neighbor
            if not dfs(neighbor, visited, rec_stack, stack, graph):
                return False
        # If the neighbor is in the recursion stack, then a cycle is detected
        elif neighbor in rec_stack:
            return False

    rec_stack.remove(node)
    # Add the current node to the stack after visiting all its neighbors
    # The deepest node in the recursion stack will be appended first
    # which is also the last node in the topological order
    stack.append(node)
    return True


def topological_sort(graph: Dict[int, List[int]]) -> List[int]:
    """
    Perform a topological sort on a directed acyclic graph (DAG).

    Args:
        graph (Dict[int, List[int]]): The adjacency list of the graph.

    Returns:
        List[int]: The nodes in topologically sorted order.

    Raises:
        ValueError: If the graph has at least one cycle.
    """
    visited = set()
    rec_stack = set()
    stack = []

    for node in graph:
        if node not in visited:
            if not dfs(node, visited, rec_stack, stack, graph):
                raise ValueError(
                    "Graph has at least one cycle, topological sort not possible"
                )
    # The topological order is stored in the stack in reverse order
    # because we are appending the nodes to the stack after the recursive call.
    # the first node to be appended to the stack will be the last node in the topological order.
    return stack[::-1]


# Kahn's algorithm for topological sorting works by iteratively removing nodes with
# no incoming edges (in-degree of 0) and updating the in-degrees of their neighbors.
# # Here is a step-by-step explanation:
# Calculate In-Degrees:
# Initialize the in-degree of each node to 0.
# Traverse the graph and for each node, increment the in-degree of its neighbors.

# Initialize Queue:
# Collect all nodes with in-degree 0 and add them to a queue. These nodes have no dependencies and can be processed first.

# Process Nodes:
# While the queue is not empty:
# Remove a node from the queue and add it to the topological order.
# For each neighbor of this node, decrement its in-degree by 1.
# If a neighbor's in-degree becomes 0, add it to the queue.

# Check for Cycles:
# After processing all nodes, if the number of nodes in the topological order is equal to the number of nodes in the graph, a valid topological sort is obtained.
# If not, the graph contains at least one cycle, making topological sorting impossible.


def kahn_topological_sort(graph):

    # Initializes a dictionary to store the in-degree of each node
    # Any key that is not present in the dictionary will have an in-degree of 0
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
