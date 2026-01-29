class GraphAdjacencyMatrix:
    def __init__(self, vertices: list[int], edges: list[list[int]]):
        self.vertices: list[int] = []
        self.adj_mat: list[list[int]] = []
        # Add vertex
        for val in vertices:
            self.add_vertex(val)
        # Add edge
        # Edges elements represent vertex indices
        for e in edges:
            self.add_edge(e[0], e[1])

    def size(self) -> int:
        """Get number of vertices in the graph

        Returns:
            int: number of vertices in the graph
        """
        return len(self.vertices)

    def add_vertex(self, val: int):
        """Add a new vertex to the graph.
        Append additional row and column to the adjacency matrix

        Args:
            val (int): value of the new vertex
        """
        n = self.size()
        # Add new vertex value to the vertex list
        self.vertices.append(val)
        # Add a row to the adjacency matrix
        new_row = [0] * n
        self.adj_mat.append(new_row)
        # Add a column to the adjacency matrix
        for row in self.adj_mat:
            row.append(0)

    def remove_vertex(self, index: int):
        """Remove vertex at `index` from the graph

        Args:
            index (int): index of the vertex to remove

        Raises:
            IndexError: if index is out of bounds
        """
        if index >= self.size():
            raise IndexError()
        # Remove vertex at `index` from the vertex list
        self.vertices.pop(index)
        # Remove the row at `index` from the adjacency matrix
        self.adj_mat.pop(index)
        # Remove the column at `index` from the adjacency matrix
        for row in self.adj_mat:
            row.pop(index)

    def add_edge(self, i: int, j: int):
        """Add edge between vertices i and j

        Args:
            i (int): index of vertex i
            j (int): index of vertex j

        Raises:
            IndexError: if i or j is out of bounds
        """
        if i < 0 or j < 0 or i >= self.size() or j >= self.size() or i == j:
            raise IndexError()
        # In an undirected graph, the adjacency matrix is symmetric about the main diagonal, i.e., satisfies (i, j) == (j, i)
        self.adj_mat[i][j] = 1
        self.adj_mat[j][i] = 1

    def remove_edge(self, i: int, j: int):
        """Remove edge between vertices i and j

        Args:
            i (int): index of vertex i
            j (int): index of vertex j

        Raises:
            IndexError: if i or j is out of bounds
        """
        if i < 0 or j < 0 or i >= self.size() or j >= self.size() or i == j:
            raise IndexError()
        self.adj_mat[i][j] = 0
        self.adj_mat[j][i] = 0


# Example usage
if __name__ == "__main__":
    vertices = [0, 1, 2, 3]
    # Each inner list represent an edge between two vertices
    edges = [[0, 1], [0, 2], [1, 2], [2, 3]]
    graph = GraphAdjacencyMatrix(vertices, edges)
    print(graph.adj_mat)
    # Output:
    # [[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]]
    # The adjacency matrix is symmetric about the main diagonal

    graph.add_vertex(4)
    print(graph.adj_mat)
    # Output:
    # [[0, 1, 1, 0, 0], [1, 0, 1, 0, 0], [1, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]]

    graph.remove_vertex(2)
    print(graph.adj_mat)
    # Output:
    # [[0, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]

    graph.add_edge(0, 2)
    print(graph.adj_mat)
    # Output:
    # [[0, 1, 1, 0], [1, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]]

    graph.remove_edge(0, 1)
    print(graph.adj_mat)
    # Output:
    # [[0, 0, 1, 0], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]]
