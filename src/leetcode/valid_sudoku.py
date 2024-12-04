from typing import List
from collections import defaultdict


class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        # keys are row number, column number, or square number
        # values are sets of numbers in the row, column, or square
        row_dict = defaultdict(set)
        col_dict = defaultdict(set)
        square_dict = defaultdict(set)
        # divide the board into 9 squares
        # the key will be a tuple e.g., (0, 0) for the top-left square

        # 0, 0 | 0, 1 | 0, 2
        # ------------------
        # 1, 0 | 1, 1 | 1, 2
        # ------------------
        # 2, 0 | 2, 1 | 2, 2

        # Remark:
        # using absolute row/column indices (0-8) wouldn't work as well
        # for tracking 3x3 squares
        for i in range(9):
            for j in range(9):
                num = board[i][j]
                if num == ".":
                    continue
                elif (
                    num in row_dict[i]
                    or num in col_dict[j]
                    or num in square_dict[(i // 3, j // 3)]  # square number
                ):
                    return False
                row_dict[i].add(num)
                col_dict[j].add(num)
                square_dict[(i // 3, j // 3)].add(num)

        return True
    
# Example usage
if __name__ == "__main__":
    solution = Solution()
    print(solution.isValidSudoku(board = 
        [["1","2",".",".","3",".",".",".","."],
        ["4",".",".","5",".",".",".",".","."],
        [".","9","8",".",".",".",".",".","3"],
        ["5",".",".",".","6",".",".",".","4"],
        [".",".",".","8",".","3",".",".","5"],
        ["7",".",".",".","2",".",".",".","6"],
        [".",".",".",".",".",".","2",".","."],
        [".",".",".","4","1","9",".",".","8"],
        [".",".",".",".","8",".",".","7","9"]]
        ))  # True

 

