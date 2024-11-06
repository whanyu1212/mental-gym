class GraphEdgeList:
    def __init__(self):
        # Initialize an empty edge list
        self.edges = []

    def add_edge(self, u, v):
        # Add an edge (u, v) to the edge list
        self.edges.append((u, v))

    def display_edges(self):
        # Display all edges
        for edge in self.edges:
            print(f"Edge from {edge[0]} to {edge[1]}")

    def adjacent_nodes(self, u):
        # Find nodes adjacent to u
        return [v for x, v in self.edges if x == u] + [
            x for x, v in self.edges if v == u
        ]


# Example usage
if __name__ == "__main__":
    graph = GraphEdgeList()
    graph.add_edge(1, 2)
    graph.add_edge(2, 3)
    graph.add_edge(3, 4)
    graph.add_edge(4, 1)
    graph.add_edge(2, 4)

    # Display edges
    graph.display_edges()

    # Check adjacent nodes for a specific node
    print("Adjacent nodes of 2:", graph.adjacent_nodes(2))
