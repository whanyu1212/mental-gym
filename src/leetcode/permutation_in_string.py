class Solution:
    """
    Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.

    In other words, return true if one of s1's permutations is the substring of s2.



    Example 1:

    Input: s1 = "ab", s2 = "eidbaooo"
    Output: true
    Explanation: s2 contains one permutation of s1 ("ba").
    Example 2:

    Input: s1 = "ab", s2 = "eidboaoo"
    Output: false


    Constraints:

    1 <= s1.length, s2.length <= 104
    s1 and s2 consist of lowercase English letters.
    """

    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False

        s1_counts = {}
        for char in s1:
            s1_counts[char] = s1_counts.get(char, 0) + 1

        window_counts = {}
        L = 0
        for R in range(len(s2)):
            window_counts[s2[R]] = window_counts.get(s2[R], 0) + 1
            # Add the counts of the new character until the window size is equal to s1
            if R - L + 1 == len(s1):  # Window size matches s1
                if window_counts == s1_counts:
                    return True
                window_counts[s2[L]] -= 1
                if window_counts[s2[L]] == 0:
                    del window_counts[s2[L]]
                L += 1

        return False


if __name__ == "__main__":
    s1 = "abc"
    s2 = "lecabee"

    solution = Solution()
    print(solution.checkInclusion(s1, s2))
