# 3D prefix sum (inclusion-exclusion over a cube).
#
# 1D and 2D prefix sums are LeetCode problems (303 and 304) and live in
# src/leetcode/arrays_hashing/python/. The 3D version has no LeetCode problem,
# so it stays here as a generalization.


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
