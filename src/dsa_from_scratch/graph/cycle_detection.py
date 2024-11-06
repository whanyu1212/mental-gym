def cycle_detection_undirected(graph: dict, vertex, visited: set, parent) -> bool:
    visited.add(vertex)
    for neighbor in graph[vertex]:
        if neighbor not in visited:
            if cycle_detection_undirected(graph, neighbor, visited, vertex):
                return True
        elif parent != neighbor:
            return True
    return False


def cycle_detection_directed(graph, vertex, visited: set, rec_stack: set) -> bool:
    visited.add(vertex)
    rec_stack.add(vertex)

    for neighbor in graph[vertex]:
        if neighbor not in visited:
            if cycle_detection_directed(graph, neighbor, visited, rec_stack):
                return True
        # encountering a neighbor that is already in the recursion stack indicates
        # a cycle in the graph, because there is a back edge to an ancestor node
        elif neighbor in rec_stack:
            return True

    rec_stack.remove(vertex)
    return False


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

    visited = set()
    if cycle_detection_undirected(graph, 0, visited, None):
        print("Cycle detected")
    else:
        print("No cycle detected")
