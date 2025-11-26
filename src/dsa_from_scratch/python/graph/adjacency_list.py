class Vertex:
    """Class to represent a vertex in the graph"""

    def __init__(self, value):
        """Constructor"""
        self.value = value

    def __eq__(self, other):
        """Equality comparison"""
        if isinstance(other, Vertex):
            return self.value == other.value
        return False

    def __hash__(self):
        """Hash function"""
        return hash(self.value)

    def __repr__(self):
        """String representation"""
        return f"Vertex({self.value})"


class GraphAdjacencyList:
    """Undirected graph class based on adjacency list"""

    def __init__(self, edges: list[list[Vertex]]):
        """Constructor"""
        # Adjacency list, key: vertex, value: all adjacent vertices of that vertex
        self.adj_list = dict[Vertex, list[Vertex]]()
        # Add all vertices and edges
        for edge in edges:
            self.add_vertex(edge[0])
            self.add_vertex(edge[1])
            self.add_edge(edge[0], edge[1])

    def size(self) -> int:
        """Get the number of vertices"""
        return len(self.adj_list)

    def add_edge(self, vet1: Vertex, vet2: Vertex):
        """Add edge"""
        if vet1 not in self.adj_list or vet2 not in self.adj_list or vet1 == vet2:
            raise ValueError()
        # Add edge vet1 - vet2
        self.adj_list[vet1].append(vet2)
        self.adj_list[vet2].append(vet1)

    def remove_edge(self, vet1: Vertex, vet2: Vertex):
        """Remove edge"""
        if vet1 not in self.adj_list or vet2 not in self.adj_list or vet1 == vet2:
            raise ValueError()
        # Remove edge vet1 - vet2
        self.adj_list[vet1].remove(vet2)
        self.adj_list[vet2].remove(vet1)

    def add_vertex(self, vet: Vertex):
        """Add vertex"""
        if vet in self.adj_list:
            return
        # Add a new linked list to the adjacency list
        self.adj_list[vet] = []

    def remove_vertex(self, vet: Vertex):
        """Remove vertex"""
        if vet not in self.adj_list:
            raise ValueError()
        # Remove the vertex vet's corresponding linked list from the adjacency list
        self.adj_list.pop(vet)
        # Traverse other vertices' linked lists, removing all edges containing vet
        for vertex in self.adj_list:
            if vet in self.adj_list[vertex]:
                self.adj_list[vertex].remove(vet)

    def print(self):
        """Print the adjacency list"""
        print("Adjacency list: \n")
        for vertex in self.adj_list:
            tmp = [v.value for v in self.adj_list[vertex]]
            print(f"{vertex.value}: {tmp},")


# Example usage
if __name__ == "__main__":
    # Create vertices
    v1 = Vertex("A")
    v2 = Vertex("B")
    v3 = Vertex("C")
    v4 = Vertex("D")

    # Create an adjacency list dictionary
    adj_list = {v1: [v2, v3], v2: [v1, v4], v3: [v1], v4: [v2]}

    # Print the adjacency list
    for vertex, neighbors in adj_list.items():
        print(f"{vertex}: {neighbors}")

    # test the __eq__ method
    print(v1 == v2)  # False
    print(v1 == v1)  # True

    # test the __hash__ method

    print(hash(v1))  # -7676794055557054721

    # Test the graph class

    # Create a graph
    graph = GraphAdjacencyList([[v1, v2], [v2, v3], [v3, v4], [v4, v1]])
    # prints the initial adjacency list
    print("Initial State:")
    print("")
    graph.print()
    print("")

    print(f"The initial size of the graph is {graph.size()}")
    print("")

    # add a new edge between v1 and v4
    graph.add_edge(v1, v4)

    # A and D both adds each other to their adjacency list
    print("After adding an edge between A and D:")
    print("")
    graph.print()
    print("")

    # Remove edge between v1 and v2
    graph.remove_edge(v1, v2)
    print("After removing an edge between A and B:")
    print("")
    graph.print()
    print("")

    # Remove vertex v1
    graph.remove_vertex(v1)
    print("After removing vertex A:")
    print("")
    graph.print()
    print("")
