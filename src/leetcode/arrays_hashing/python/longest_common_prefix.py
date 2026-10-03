from typing import List


class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        output = ""

        # ============================================================================
        # APPROACH 1: Vertical Scanning (Using zip with unpacking)
        # ============================================================================
        # Time: O(S) where S = sum of all characters in all strings (worst case)
        # Space: O(1) excluding output string
        #
        # How zip(*strs) works:
        #   Input:  ["flower", "flow", "flight"]
        #   After unpacking: zip("flower", "flow", "flight")
        #   Produces tuples: ('f','f','f'), ('l','l','l'), ('o','o','i'), ('w','w','g'),
        # ...
        #
        # Algorithm:
        #   1. For each character position, check if all strings have the same character
        #   2. Use set() to find unique characters at that position
        #   3. If set has length 1, all chars match → add to prefix
        #   4. If set has length > 1, chars differ → stop (prefix ends)
        #
        # Example walkthrough with ["flower", "flow", "flight"]:
        #   Iteration 1: ('f','f','f') → set={'f'} (len=1) → add 'f'
        #   Iteration 2: ('l','l','l') → set={'l'} (len=1) → add 'l'
        #   Iteration 3: ('o','o','i') → set={'o','i'} (len=2) → break
        #   Result: "fl"

        for char_tuple in zip(*strs):
            if len(set(char_tuple)) == 1:
                output += char_tuple[0]
            else:
                break
        return output

        # ============================================================================
        # APPROACH 2: Horizontal Scanning
        # ============================================================================
        # Time: O(S) where S = sum of all characters in all strings
        # Space: O(1) excluding output string
        #
        # Algorithm:
        #   1. Start with the first string as the initial prefix
        #   2. For each subsequent string, trim the prefix until it matches the start
        #   3. If prefix becomes empty, return immediately
        #
        # Example with ["flower", "flow", "flight"]:
        #   Initial prefix: "flower"
        #   Compare with "flow":
        #     - "flower" doesn't match start → trim to "flowe"
        #     - "flowe" doesn't match start → trim to "flow"
        #     - "flow" matches start → keep "flow"
        #   Compare with "flight":
        #     - "flow" doesn't match start → trim to "flo"
        #     - "flo" doesn't match start → trim to "fl"
        #     - "fl" matches start → keep "fl"
        #   Result: "fl"
        #
        # Uncomment to use:
        # if not strs:
        #     return ""
        # prefix = strs[0]
        # for s in strs[1:]:
        #     while not s.startswith(prefix):
        #         prefix = prefix[:-1]
        #         if not prefix:
        #             return ""
        # return prefix

        # ============================================================================
        # APPROACH 3: Divide and Conquer
        # ============================================================================
        # Time: O(S) where S = sum of all characters in all strings
        # Space: O(m * log n) for recursion stack, where m = length of prefix, n = number
        # of strings
        #
        # Algorithm:
        #   1. Divide the array of strings into two halves
        #   2. Recursively find the common prefix for each half
        #   3. Merge by finding common prefix between the two results
        #
        # Example with ["flower", "flow", "flight", "fly"]:
        #   Split: ["flower", "flow"] and ["flight", "fly"]
        #   Left half: commonPrefix("flower", "flow") = "flow"
        #   Right half: commonPrefix("flight", "fly") = "fl"
        #   Merge: commonPrefix("flow", "fl") = "fl"
        #   Result: "fl"
        #
        # Uncomment to use:
        # def commonPrefix(s1: str, s2: str) -> str:
        #     min_len = min(len(s1), len(s2))
        #     for i in range(min_len):
        #         if s1[i] != s2[i]:
        #             return s1[:i]
        #     return s1[:min_len]
        #
        # def divideAndConquer(strs: List[str], left: int, right: int) -> str:
        #     if left == right:
        #         return strs[left]
        #     mid = (left + right) // 2
        #     left_prefix = divideAndConquer(strs, left, mid)
        #     right_prefix = divideAndConquer(strs, mid + 1, right)
        #     return commonPrefix(left_prefix, right_prefix)
        #
        # if not strs:
        #     return ""
        # return divideAndConquer(strs, 0, len(strs) - 1)

        # ============================================================================
        # APPROACH 4: Binary Search (on prefix length)
        # ============================================================================
        # Time: O(S * log m) where S = sum of all characters, m = length of shortest
        # string
        # Space: O(1) excluding output string
        #
        # Algorithm:
        #   1. Find the minimum string length (upper bound for prefix)
        #   2. Binary search on the prefix length [0, min_len]
        #   3. For each mid point, check if all strings share the prefix of length mid
        #
        # Example with ["flower", "flow", "flight"]:
        #   Min length: 4 ("flow")
        #   Binary search range: [0, 4]
        #   mid = 2: Check "fl" → all strings start with "fl" ✓ → search [3, 4]
        #   mid = 3: Check "flo" → "flight" doesn't start with "flo" ✗ → search [3, 2]
        #   Result: "fl" (length 2)
        #
        # Uncomment to use:
        # if not strs:
        #     return ""
        # min_len = min(len(s) for s in strs)
        # low, high = 0, min_len
        # while low <= high:
        #     mid = (low + high) // 2
        #     prefix = strs[0][:mid]
        #     if all(s.startswith(prefix) for s in strs):
        #         low = mid + 1
        #     else:
        #         high = mid - 1
        # return strs[0][:high]


if __name__ == "__main__":
    sol = Solution()
    strs = ["flower", "flow", "flight"]
    print(sol.longestCommonPrefix(strs))
