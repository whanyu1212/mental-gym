"""
A numeric matrix with one row-major buffer, built without NumPy.

Invariant: len(_data) == rows * cols. Cell (r, c) is at r * cols + c.
Rows use adjacent slots; consecutive entries in a column are cols slots
apart. The list stores object references, not packed numeric values like
a NumPy array.

Transforms allocate independent matrices, not views. Dimensions are
fixed; values are mutable. Negative indices and slicing are
intentionally unsupported.
"""

Number = int | float


class Matrix:
    """
    A fixed-shape matrix; zero dimensions are allowed.

    Negative dimensions and incompatible shapes raise ValueError. Out-
    of-range coordinates raise IndexError. Values are assumed numeric.
    """

    def __init__(self, rows: int, cols: int, fill: Number = 0) -> None:
        if rows < 0 or cols < 0:
            raise ValueError("dimensions must be nonnegative")
        self._rows = rows
        self._cols = cols
        self._data: list[Number] = [fill] * (rows * cols)

    @property
    def rows(self) -> int:
        return self._rows

    @property
    def cols(self) -> int:
        return self._cols

    @classmethod
    def from_rows(cls, rows: list[list[Number]]) -> "Matrix":
        """Copy rectangular nested lists; [] represents a 0-by-0
        matrix."""
        row_count = len(rows)
        col_count = len(rows[0]) if row_count else 0
        if any(len(row) != col_count for row in rows):
            raise ValueError("rows must all have the same length")
        result = cls(row_count, col_count)
        for r in range(row_count):
            for c in range(col_count):
                result.set(r, c, rows[r][c])
        return result

    def _index(self, row: int, col: int) -> int:
        if not 0 <= row < self.rows or not 0 <= col < self.cols:
            raise IndexError("matrix coordinate out of range")
        return row * self.cols + col

    def get(self, row: int, col: int) -> Number:
        """Read a cell in O(1) time."""
        return self._data[self._index(row, col)]

    def set(self, row: int, col: int, value: Number) -> None:
        """Replace a cell in O(1) time."""
        self._data[self._index(row, col)] = value

    def row(self, index: int) -> list[Number]:
        """Copy a row in O(cols) time and space; this is not a view."""
        if not 0 <= index < self.rows:
            raise IndexError("row index out of range")
        return [self.get(index, c) for c in range(self.cols)]

    def column(self, index: int) -> list[Number]:
        """Copy a column in O(rows) time and space; this is not a
        view."""
        if not 0 <= index < self.cols:
            raise IndexError("column index out of range")
        return [self.get(r, index) for r in range(self.rows)]

    def transpose(self) -> "Matrix":
        """Map (r, c) to (c, r); shape R-by-C becomes C-by-R."""
        result = Matrix(self.cols, self.rows)
        for r in range(self.rows):
            for c in range(self.cols):
                result.set(c, r, self.get(r, c))
        return result

    def rotate_clockwise(self) -> "Matrix":
        """Rotate 90 degrees: (r, c) becomes (c, R - 1 - r)."""
        result = Matrix(self.cols, self.rows)
        for r in range(self.rows):
            for c in range(self.cols):
                result.set(c, self.rows - 1 - r, self.get(r, c))
        return result

    def multiply(self, other: "Matrix") -> "Matrix":
        """
        Multiply R-by-K with K-by-C to produce R-by-C.

        Each output cell is a row/column dot product, not elementwise
        multiplication. For positive dimensions: O(R*K*C) time and
        O(R*C) output space. A zero inner dimension produces a zero-
        filled result.
        """
        if self.cols != other.rows:
            raise ValueError("left columns must equal right rows")
        result = Matrix(self.rows, other.cols)
        for r in range(self.rows):
            for c in range(other.cols):
                total: Number = 0
                for k in range(self.cols):
                    total += self.get(r, k) * other.get(k, c)
                result.set(r, c, total)
        return result
