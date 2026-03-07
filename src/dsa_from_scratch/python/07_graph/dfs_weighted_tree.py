from collections import defaultdict
from typing import Optional, Dict, List, Tuple


class Node:
    def __init__(self, val: int) -> None:
        self.val = val
        self.neighbors: List[Tuple[Node, int]] = []  # List of (neighbor, weight) pairs


def dfs(
    node: Node, parent: Optional[Node], distances: Dict[int, int], current_dist: int
) -> None:
    """
    DFS to calculate shortest paths from root to all nodes
    Args:
        node: Current node
        parent: Parent node to avoid cycles
        distances: Dictionary to store shortest distances
        current_dist: Current distance from root to this node
    """
    # Update distance to current node
    distances[node.val] = current_dist

    # Explore all neighbors
    for neighbor, weight in node.neighbors:
        if neighbor != parent:
            dfs(neighbor, node, distances, current_dist + weight)


def build_tree() -> Node:
    """Helper function to build a sample weighted tree"""
    # Create nodes
    nodes = [Node(i) for i in range(5)]

    # Add edges with weights
    edges = [(0, 1, 4), (0, 2, 1), (1, 3, 3), (2, 4, 2)]  # (from, to, weight)

    # Build adjacency lists
    for u, v, w in edges:
        nodes[u].neighbors.append((nodes[v], w))
        nodes[v].neighbors.append((nodes[u], w))

    return nodes[0]  # Return root


def main():
    # Build sample tree
    root = build_tree()

    # Calculate shortest paths from root
    distances = {}
    dfs(root, None, distances, 0)

    # Print results
    print("Shortest distances from root:")
    for node, dist in sorted(distances.items()):
        print(f"Node {node}: {dist}")


if __name__ == "__main__":
    main()
