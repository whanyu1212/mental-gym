from typing import List


class Solution:
    def numRescueBoats(self, people: List[int], limit: int) -> int:
        """
        Return the minimum number of boats to carry every given person.

        Constraints:
        - Each boat can carry at most 2 people at the same time.
        - The combined weight of people in a boat cannot exceed ``limit``.
        """
        # =====================================================================
        # INTUITION: GREEDY + TWO POINTERS
        # =====================================================================
        #
        # 1. Why Greedy?
        #    - Focus on the heaviest person currently waiting (at `right`).
        #    - That person MUST get on a boat.
        #    - To minimize boats, try to pair them with someone.
        #    - Best chance of pairing is with the lightest available person
        #      (at `left`).
        #    - If people[left] + people[right] > limit, the heaviest person
        #      cannot pair with ANYONE, so they MUST take a boat alone.
        #    - If people[left] + people[right] <= limit, pairing them is
        #      optimal because it saves a boat while leaving heavier remaining
        #      spots for other medium-weight people.
        #
        # 2. Algorithm:
        #    - Sort `people` in ascending order.
        #    - Initialize two pointers: `left = 0`, `right = len(people) - 1`.
        #    - While `left <= right`:
        #        - If `people[left] + people[right] <= limit`, lightest person
        #          shares the boat -> advance `left += 1`.
        #        - Heaviest person ALWAYS takes this boat -> `right -= 1`.
        #        - Increment the boat count.
        #
        # 3. Complexity:
        #    - Time:  O(n log n) due to sorting (two-pointer pass is O(n)).
        #    - Space: O(1) auxiliary space (or O(n) based on sort).
        # =====================================================================
        people.sort()
        boats = 0

        left, right = 0, len(people) - 1
        while left <= right:
            remaining = limit - people[right]
            right -= 1
            boats += 1

            if left <= right and remaining >= people[left]:
                left += 1
        return boats


if __name__ == "__main__":
    test_cases = [
        ([1, 2], 3, 1),
        ([3, 2, 2, 1], 3, 3),
        ([3, 5, 3, 4], 5, 4),
    ]

    sol = Solution()
    for p_arr, lim, expected in test_cases:
        result = sol.numRescueBoats(p_arr.copy(), lim)
        print(f"people={p_arr}, limit={lim} -> {result} (exp: {expected})")
