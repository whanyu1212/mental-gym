from typing import List


class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # initialize pointers
        l, r = 0, 1
        max_profit = 0

        while r < len(prices):
            current_profit = prices[r] - prices[l]
            if prices[l] < prices[r]:
                max_profit = max(max_profit, current_profit)
            else:
                l = r  # if we find a better point to buy
            r += 1

        return max_profit


if __name__ == "__main__":
    sol = Solution()
    print(sol.maxProfit([7, 1, 5, 3, 6, 4]))  # output  5
    print(sol.maxProfit([7, 6, 4, 3, 1]))  # output 0
