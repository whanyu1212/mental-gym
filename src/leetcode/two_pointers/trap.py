from typing import List

# Intuition:
# The key to solving this problem is to figure out,
# for each individual bar, how much water can sit on top of it.


# Think about a single column i.
# The amount of water that can be trapped above this column depends on the walls around it.
# Specifically, it's constrained by:

# 1. The tallest bar to its left.
# 2. The tallest bar to its right.

# Water can only fill up to the height of the shorter of these two walls.
# Let's call the tallest bar on the left max_left and the tallest bar on the right max_right.
# The water level at column i can rise to min(max_left, max_right).

# So, the water trapped directly above column i is:

# water_at_i = min(max_left, max_right) - height[i]

# If height[i] is taller than or equal to this water level, then no water is trapped at that position. This is why we can cap the result at 0 if it's negative.

# The total trapped water is the sum of the water trapped at each individual column.


class Solution:
    def trap_bruteforce(self, height: List[int]) -> int:
        n = len(height)
        # you need at least 3 index to be to trap water in between
        if n <= 2:
            return 0
        total_water = 0
        # the bar at index 0 cannot trap anything on it
        for i in range(1, n - 1):
            max_left = 0

            # iterate towards its left until the 0
            for j in range(i, -1, -1):
                max_left = max(max_left, height[j])

            max_right = 0
            # iterate towards its right
            for k in range(i, n):
                max_right = max(max_right, height[k])

            water_at_i = min(max_right, max_left) - height[i]

            total_water += max(0, water_at_i)

        return total_water

    def trap_prefix_suffix_sum(self, height: List[int]) -> int:
        n = len(height)

        if n <= 2:
            return 0

        prefix_max = [0] * n
        suffix_max = [0] * n

        prefix_max[0] = height[0]

        for i in range(1, n):
            prefix_max[i] = max(prefix_max[i - 1], height[i])

        suffix_max[n - 1] = height[n - 1]

        for j in range(n - 2, -1, -1):
            suffix_max[j] = max(suffix_max[j + 1], height[j])

        total_water = 0

        for i in range(n):
            water_at_i = min(prefix_max[i], suffix_max[i]) - height[i]
            total_water += max(0, water_at_i)

        return total_water

    def trap_two_pointers(self, height: List[int]) -> int:
        n = len(height)
        if n <= 2:
            return 0

        l, r = 0, n - 1

        max_left, max_right = 0, 0
        total_water = 0

        while l < r:
            if height[l] < height[r]:
                if height[l] >= max_left:
                    max_left = height[l]
                else:
                    total_water += max_left - height[l]

                l += 1
            else:
                if height[r] >= max_right:
                    max_right = height[r]
                else:
                    total_water += max_right - height[r]

                r -= 1

        return total_water


# Example usage
if __name__ == "__main__":
    s = Solution()
    height = [4, 2, 0, 3, 2, 5]
    print(s.trap_bruteforce(height))
    print(s.trap_prefix_suffix_sum(height))
    print(s.trap_two_pointers(height))  # Output is 9
