from collections import deque


def is_bipartite(graph):

    # Initialize color dictionary to store the color of each node
    color = {}

    # Looping through nodes in the graph
    # Just in case there are disconnected components
    for node in graph:

        if node not in color:
            # Start BFS from this node

            queue = deque([node])
            color[node] = 0  # Start coloring with 0

            while queue:
                current = queue.popleft()

                for neighbor in graph[current]:
                    if neighbor not in color:
                        # Assign alternate color to the neighbor
                        color[neighbor] = 1 - color[current]
                        queue.append(neighbor)
                    elif color[neighbor] == color[current]:
                        # If the neighbor has the same color, the graph is not bipartite
                        return False
    return True


# Example usage
if __name__ == "__main__":
    graph = {
        0: [1, 3],
        1: [0, 2],
        2: [1, 3],
        3: [0, 2],
    }

    print(is_bipartite(graph))  # Output: True

    graph = {
        0: [1, 2, 3],
        1: [0, 2],
        2: [1, 3],
        3: [0, 2],
    }

    print(is_bipartite(graph))  # Output: False
