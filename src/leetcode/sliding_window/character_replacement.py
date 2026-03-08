class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        # Initialize a dict to store the character counts
        char_count = {}

        # initialize a left pointer
        left = 0
        max_f = 0
        res = 0
        # initialize the right pointer at the beginning as well
        # loop through the entire string
        for r in range(len(s)):
            # increment the count as the right pointer moves
            char_count[s[r]] = 1 + char_count.get(s[r], 0)
            max_f = max(max_f, char_count[s[r]])

            if (r - left + 1) - max_f > k:
                left += 1
                char_count[s[left]] -= 1

            res = max(res, r - left + 1)

        return res


if __name__ == "__main__":
    pass
