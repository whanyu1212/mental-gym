class PrefixSum:

    def __init__(self, nums):
        self.prefix = []
        total = 0
        for n in nums:
            total += n
            self.prefix.append(total)

    def rangeSum(self, left, right):
        preRight = self.prefix[right]
        preLeft = self.prefix[left - 1] if left > 0 else 0
        return preRight - preLeft


class PrefixSum2D:

    def __init__(self, matrix):
        rows = len(matrix)
        cols = len(matrix[0]) if rows > 0 else 0

        # Padded with an extra row and column of zeros for easier calculations
        self.prefix = [[0 for _ in range(cols + 1)] for _ in range(rows + 1)]

        for r in range(rows):
            for c in range(cols):
                self.prefix[r + 1][c + 1] = (
                    matrix[r][c]
                    + self.prefix[r][c + 1]
                    + self.prefix[r + 1][c]
                    - self.prefix[r][c]
                )

    def rangeSum(self, row1, col1, row2, col2):
        # Using the padded prefix matrix, indices are shifted by +1
        # Sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]
        return (
            self.prefix[row2 + 1][col2 + 1]
            - self.prefix[row1][col2 + 1]
            - self.prefix[row2 + 1][col1]
            + self.prefix[row1][col1]
        )


class PrefixSum3D:

    def __init__(self, cube):
        self.x_len = len(cube)
        self.y_len = len(cube[0]) if self.x_len > 0 else 0
        self.z_len = len(cube[0][0]) if self.y_len > 0 else 0

        # Padded with an extra plane of zeros in all 3 dimensions
        self.prefix = [
            [[0 for _ in range(self.z_len + 1)] for _ in range(self.y_len + 1)]
            for _ in range(self.x_len + 1)
        ]

        for x in range(self.x_len):
            for y in range(self.y_len):
                for z in range(self.z_len):
                    self.prefix[x + 1][y + 1][z + 1] = (
                        cube[x][y][z]
                        + self.prefix[x][y + 1][z + 1]
                        + self.prefix[x + 1][y][z + 1]
                        + self.prefix[x + 1][y + 1][z]
                        - self.prefix[x][y][z + 1]
                        - self.prefix[x][y + 1][z]
                        - self.prefix[x + 1][y][z]
                        + self.prefix[x][y][z]
                    )

    def rangeSum(self, x1, y1, z1, x2, y2, z2):
        # Using the padded prefix matrix, indices are shifted by +1
        return (
            self.prefix[x2 + 1][y2 + 1][z2 + 1]
            - self.prefix[x1][y2 + 1][z2 + 1]
            - self.prefix[x2 + 1][y1][z2 + 1]
            - self.prefix[x2 + 1][y2 + 1][z1]
            + self.prefix[x1][y1][z2 + 1]
            + self.prefix[x1][y2 + 1][z1]
            + self.prefix[x2 + 1][y1][z1]
            - self.prefix[x1][y1][z1]
        )
