from typing import List

# Example: prices = [7, 1, 5, 3, 6, 4]
#
# Price
#   7 | *
#   6 |                   *
#   5 |           *
#   4 |                       *
#   3 |               *
#   2 |
#   1 |       *
#     +--+---+---+---+---+---+--
#       d0   d1  d2  d3  d4  d5
#
#  Buy on d1 (price=1), sell on d4 (price=6) → profit = 5
#
#  Sliding window approach:
#    - left pointer tracks the minimum buy price seen so far
#    - right pointer scans forward looking for the best sell price
#    - if prices[right] < prices[left], we found a cheaper buy → move left to right
#    - otherwise, compute profit and update max


class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # initialize pointers
        left, r = 0, 1
        max_profit = 0

        while r < len(prices):
            current_profit = prices[r] - prices[left]
            if prices[left] < prices[r]:
                max_profit = max(max_profit, current_profit)
            else:
                left = r  # if we find a better point to buy
            r += 1

        return max_profit


if __name__ == "__main__":
    sol = Solution()

    # Profitable case: buy at 1, sell at 6
    assert sol.maxProfit([7, 1, 5, 3, 6, 4]) == 5
    # Monotonically decreasing: no profitable transaction
    assert sol.maxProfit([7, 6, 4, 3, 1]) == 0
    # Single element: no transaction possible
    assert sol.maxProfit([5]) == 0
    # Two elements, profitable
    assert sol.maxProfit([1, 2]) == 1
    # Two elements, not profitable
    assert sol.maxProfit([2, 1]) == 0
    # All same prices
    assert sol.maxProfit([3, 3, 3, 3]) == 0
    # Buy at the very start, sell at the very end
    assert sol.maxProfit([1, 2, 3, 4, 5]) == 4

    print("All test cases passed!")
