import sys
from collections import defaultdict, deque

# 1. Detecting a Tree
# A tree is an undirected graph that is connected and acyclic.

# Steps:
# Check for Cycles: Use DFS to ensure there are no cycles.
# Check Connectivity: Ensure all vertices are visited during the DFS.
# There is exactly one root: A node with no incoming edges.


# 2. Detecting a Complete Graph
# A complete graph is a graph where every pair of distinct vertices is connected by a unique edge.

# Steps:
# Check Degree: Ensure every vertex has an edge to every other vertex.


# 3. Detecting a Bipartite Graph
# A bipartite graph is a graph whose vertices can be divided into two disjoint sets such that no two graph vertices within the same set are adjacent.

# Steps:
# Coloring: Use BFS or DFS to attempt to color the graph using two colors.


# 4. Detecting a Directed Acyclic Graph (DAG)
# A DAG is a directed graph with no cycles.

# Steps:
# Check for Cycles: Use DFS to detect cycles by tracking the recursion stack.


def convert_input_to_graph(edge_list: list, directed: int) -> dict:
    """Convert an edge list, i.e a list of tuples (A-B),
    to a graph represented as a dictionary.

    Args:
        edge_list (list): a list of tuples (A-B)
        directed (bool): whether it is a directed graph or not,
        if undirected, vertex will be appended to both vertices.
        Otherwise, it will only be appended to the first vertex.

    Returns:
        dict: a dictionary representing the graph.
    """
    graph = defaultdict(list)

    for edge in edge_list:
        graph[edge[0]].append(edge[1])
        if directed == 1:
            graph[edge[1]].append(edge[0])
    return graph


def dfs_cycle_detection_undirected(graph: dict, vertex, visited: set, parent) -> bool:
    """Perform DFS to check for cycles in an undirected graph.

    Args:
        graph (dict): The graph represented as an adjacency list.
        vertex: The current vertex being visited.
        visited (set): A set of visited vertices.
        parent: The parent vertex of the current vertex.

    Returns:
        bool: True if no cycles are found, False otherwise.
        
        
    Imagine we have the following graph:
             A
            / \
           B - C
           
    graph = {
        'A': ['B', 'C'],
        'B': ['A', 'C'],
        'C': ['A', 'B']
    }
    
    Initial call: dfs_undirected(graph, 'A', set(), None)
    
    Add 'A' to visited set: visited = {'A'}
    
    First level of recursion:
    dfs_undirected(graph, 'B', {'A'}, 'A')
    Add 'B' to visited set: visited = {'A', 'B'}
    
    Second level of recursion:
    dfs_undirected(graph, 'C', {'A', 'B'}, 'B')
    Add 'C' to visited set: visited = {'A', 'B', 'C'}
    
    Third level of recursion:
    dfs_undirected(graph, 'A', {'A', 'B', 'C'}, 'C')
    'A' is already in visited set, but 'A' is not the parent of 'C', 
    so return False
    
    """
    visited.add(vertex)
    for neighbor in graph[vertex]:
        if neighbor not in visited:
            if not dfs_cycle_detection_undirected(graph, neighbor, visited, vertex):
                return False
        elif neighbor != parent:
            return False
    return True


def dfs_cycle_detection_directed(
    graph: dict, vertex, visited: set, rec_stack: set
) -> bool:
    """Perform DFS to check for cycles in a directed graph.

    Args:
        graph (dict): The graph represented as an adjacency list.
        vertex: The current vertex being visited.
        visited (set): A set of visited vertices.
        rec_stack (set): The recursion stack to track the current path.

    Returns:
        bool: True if no cycles are found, False otherwise.

    Imagine we have the following graph:

      A → B → C
      ↑   ↓
      ←   D

      graph = {
        'A': ['B'],
        'B': ['C'],
        'C': ['D'],
        'D': ['B']
    }

    Initial call:
    dfs_directed(graph, 'A', set(), set())
    Add 'A' to visited set: visited = {'A'} and rec_stack = {'A'}

    First level of recursion:
    dfs_directed(graph, 'B', {'A'}, {'A'})
    Add 'B' to visited set: visited = {'A', 'B'} and rec_stack = {'A', 'B'}

    Second level of recursion:
    dfs_directed(graph, 'C', {'A', 'B'}, {'A', 'B'})
    Add 'C' to visited set: visited = {'A', 'B', 'C'} and rec_stack = {'A', 'B', 'C'}

    Third level of recursion:
    dfs_directed(graph, 'D', {'A', 'B', 'C'}, {'A', 'B', 'C'})
    Add 'D' to visited set: visited = {'A', 'B', 'C', 'D'} and rec_stack = {'A', 'B', 'C', 'D'}

    Fourth level of recursion:
    dfs_directed(graph, 'B', {'A', 'B', 'C', 'D'}, {'A', 'B', 'C', 'D'})
    'B' is already in rec_stack, so return False

    """
    visited.add(vertex)
    rec_stack.add(vertex)

    # Execute until there is no neighbor left at the last vertex
    # Start backtracking
    for neighbor in graph[vertex]:
        if neighbor not in visited:
            if not dfs_cycle_detection_directed(graph, neighbor, visited, rec_stack):
                return False
        elif neighbor in rec_stack:
            return False
    rec_stack.remove(vertex)
    return True


def is_tree(graph: dict, directed: int) -> int:
    """Check if the graph is a tree.

    Args:
        graph (dict): A graph represented as an adjacency list.
        directed (int): 1 for undirected, 2 for directed.

    Returns:
        int: 1 if the graph is a tree, 0 otherwise.
    """
    visited = set()
    start_vertex = next(iter(graph))

    if directed == 2:
        rec_stack = set()
        if not dfs_cycle_detection_directed(graph, start_vertex, visited, rec_stack):
            return 0

        # Check for exactly one root (node with no incoming edges)
        in_degree = {vertex: 0 for vertex in graph}
        for vertex in graph:
            for neighbor in graph[vertex]:
                in_degree[neighbor] += 1

        root_count = sum(1 for vertex in in_degree if in_degree[vertex] == 0)
        if root_count != 1:
            return 0

        # Check if all vertices are visited (graph is connected)
        if len(visited) != len(graph):
            return 0

        # Check if the number of edges is exactly n - 1
        edge_count = sum(len(neighbors) for neighbors in graph.values())
        if edge_count != len(graph) - 1:
            return 0

    else:
        if not dfs_cycle_detection_undirected(graph, start_vertex, visited, None):
            return 0

        if len(visited) != len(graph):
            return 0

        edge_count = sum(len(neighbors) for neighbors in graph.values()) // 2
        if edge_count != len(graph) - 1:
            return 0

    return 1


def check_completeness_of_graph(graph: dict) -> int:
    """Check the completeness of the graph by
    ensuring that every vertex is connected to
    every other vertex.

    Args:
        graph (dict): a graph represented as
        an adjacency list.

    Returns:
        int: 1 if the graph is complete, 0 otherwise.
    """
    for vertex in graph:
        # If every vertex is connected with the rest,
        # the length of the value list should be equal
        # to the length of the graph - 1
        if len(graph[vertex]) != len(graph) - 1:
            return 0
    return 1


def check_neighbor_color_bfs(graph: dict, start: int, color: dict) -> bool:
    """Check the coloring of the neighbors of a vertex

    Args:
        graph (dict): graph represented as an adjacency list.
        start (int): the starting vertex.
        color (dict): a dictionary to store the color of the vertices.

    Returns:
        bool: True if the graph is bipartite, False otherwise.
    """
    # Create a queue with the starting vertex
    queue = deque([start])
    color[start] = 0  # Start coloring with 0

    while queue:
        # Pop the current vertex
        vertex = queue.popleft()
        current_color = color[vertex]

        for neighbor in graph[vertex]:
            # If it has not been colored yet
            if neighbor not in color:
                # Assign the opposite color to the neighbor
                color[neighbor] = 1 - current_color
                queue.append(neighbor)
            elif color[neighbor] == current_color:
                # If the neighbor has the same color, the graph is not bipartite
                return False
    return True


def is_bipartite(graph: dict) -> int:
    """Check if the graph is bipartite by coloring
    the neighbors of the vertices.

    Args:
        graph (dict): graph represented as an adjacency list.

    Returns:
        int: 1 if the graph is bipartite, 0 otherwise.
    """
    color = {}

    for vertex in graph:
        if vertex not in color:
            if not check_neighbor_color_bfs(graph, vertex, color):
                return 0

    return 1


def is_DAG(graph: dict, directed: int) -> int:
    """We recycle the function used to
    detect cycles. If it is undirected,
    we return False. Otherwise, we return
    the result of the dfs_cycle_detection_directed
    function.

    Args:
        graph (dict): graph represented as an adjacency list.
        directed (int): 1 for undirected, 2 for directed.

    Returns:
        int: 1 if the graph is a DAG, 0 otherwise.
    """
    if directed != 2:
        return 0
    # return is_tree(graph, directed)
    return int(dfs_cycle_detection_directed(graph, next(iter(graph)), set(), set()))


def check_special_graphs(graph: dict, direction: int) -> list:
    """Chaining the order of the functions

    Args:
        graph (dict): graph represented as an adjacency list.
        direction (int): 1 for undirected, 2 for directed.

    Returns:
        list: a list of results from the functions.
    """
    results = []

    results.append(is_tree(graph, direction))
    results.append(check_completeness_of_graph(graph))
    results.append(is_bipartite(graph))
    results.append(is_DAG(graph, direction))

    return results


if __name__ == "__main__":
    # with open("input.txt", "r") as file:
    #     input_data = file.read().strip().split()

    input_data = sys.stdin.read().strip().split()

    vert, edges, direction = map(int, input_data[:3])

    edges = input_data[3:]

    edge_list = [(edges[i], edges[i + 1]) for i in range(0, len(edges), 2)]

    graph = convert_input_to_graph(edge_list, directed=direction)

    output = check_special_graphs(graph, direction)

    sys.stdout.write("\n".join(map(str, output)) + "\n")
