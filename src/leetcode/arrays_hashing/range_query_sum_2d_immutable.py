from typing import List

# 304. Range Sum Query 2D - Immutable
#
# Given a 2D matrix matrix, handle multiple queries of the following type:
# 1. Calculate the sum of the elements of matrix inside the rectangle defined by its
#    upper left corner (row1, col1) and lower right corner (row2, col2).
#
# Implement the NumMatrix class:
# - NumMatrix(int[][] matrix) Initializes the object with the integer matrix matrix.
# - int sumRegion(int row1, int col1, int row2, int col2) Returns the sum of the
#   elements of matrix inside the rectangle defined by its upper left corner (row1, col1)
#   and lower right corner (row2, col2).
#
# You must design an algorithm where sumRegion works on O(1) time complexity.


class NumMatrix:

    def __init__(self, matrix: List[List[int]]):
        # O(1) requirement means you cannot iterate over the lists
        # You need to have a matrix that stores the prefix

        #           original   above        left       diagonal
        # P[i][j] = M[i][j] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]

        self.prefix_matrix = self.calcPrefixMatrix(matrix)

    def calcPrefixMatrix(self, matrix: List[List[int]]):
        rows = len(matrix)
        cols = len(matrix[0]) if rows > 0 else 0

        prefix_matrix = [[0 for _ in range(cols)] for _ in range(rows)]

        for i in range(rows):
            for j in range(cols):
                # fill in placeholder first
                prefix_matrix[i][j] = matrix[i][j]

                # if its not first row
                if i > 0:
                    prefix_matrix[i][j] += prefix_matrix[i - 1][j]

                if j > 0:
                    prefix_matrix[i][j] += prefix_matrix[i][j - 1]

                if i > 0 and j > 0:
                    prefix_matrix[i][j] -= prefix_matrix[i - 1][j - 1]

        return prefix_matrix

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        # Sum(r1, c1, r2, c2) = P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]
        full_sum = self.prefix_matrix[row2][col2]
        above_sum = self.prefix_matrix[row1 - 1][col2] if row1 > 0 else 0
        left_sum = self.prefix_matrix[row2][col1 - 1] if col1 > 0 else 0
        overlap_sum = (
            self.prefix_matrix[row1 - 1][col1 - 1] if row1 > 0 and col1 > 0 else 0
        )

        return full_sum - above_sum - left_sum + overlap_sum


if __name__ == "__main__":
    matrix = [
        [3, 0, 1, 4, 2],
        [5, 6, 3, 2, 1],
        [1, 2, 0, 1, 5],
        [4, 1, 0, 1, 7],
        [1, 0, 3, 0, 5],
    ]

    numMatrix = NumMatrix(matrix)
    print("Testing NumMatrix...")

    res1 = numMatrix.sumRegion(2, 1, 4, 3)
    print(f"sumRegion(2, 1, 4, 3) = {res1} (Expected: 8)")
    assert res1 == 8, f"Expected 8, got {res1}"

    res2 = numMatrix.sumRegion(1, 1, 2, 2)
    print(f"sumRegion(1, 1, 2, 2) = {res2} (Expected: 11)")
    assert res2 == 11, f"Expected 11, got {res2}"

    res3 = numMatrix.sumRegion(1, 2, 2, 4)
    print(f"sumRegion(1, 2, 2, 4) = {res3} (Expected: 12)")
    assert res3 == 12, f"Expected 12, got {res3}"

    print("All tests passed!")
