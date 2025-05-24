from collections import defaultdict
from typing import List


class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        # create 3 dictionaries to store the unique elements
        # row wise, col wise and in the 3x3 square. We use that
        # to check if the board[i,j] has appeared before or not
        rowset = defaultdict(set)
        colset = defaultdict(set)
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
