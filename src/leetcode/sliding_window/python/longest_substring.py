class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Benefits of using set here:
        # 1. O(1) average time complexity for add, remove and in operations
        # 2. Automatic duplicate handling
        char_set = set()
        left = 0  # initialize pointer
        result = 0  # to keep track of the length of the longest substring

        for r in range(len(s)):
            while s[r] in char_set:
                char_set.remove(s[left])
                left += 1
            char_set.add(s[r])
            result = max(result, r - left + 1)

        return result


if __name__ == "__main__":
    pass
