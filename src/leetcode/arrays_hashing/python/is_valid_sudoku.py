from collections import defaultdict
from typing import List


class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        # Intuition: we are NOT solving the board, only validating current entries.
        # For each filled cell, the digit must be unique in:
        # 1) its row, 2) its column, and 3) its 3x3 box.
        rowset = defaultdict(set)
        colset = defaultdict(set)
        # Box key is (i // 3, j // 3):
        # rows 0-2 -> 0, 3-5 -> 1, 6-8 -> 2 (same idea for columns).
        squareset = defaultdict(set)

        for i in range(len(board)):
            for j in range(len(board[0])):
                if board[i][j] == ".":
                    continue
                if (
                    board[i][j] in rowset[i]
                    or board[i][j] in colset[j]
                    or board[i][j] in squareset[(i // 3, j // 3)]
                ):
                    return False

                rowset[i].add(board[i][j])
                colset[j].add(board[i][j])
                squareset[(i // 3, j // 3)].add(board[i][j])

        return True
