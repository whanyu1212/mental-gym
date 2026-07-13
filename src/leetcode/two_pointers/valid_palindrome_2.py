class Solution:
    def validPalindrome(self, s: str) -> bool:
        def is_pali(sub: str) -> bool:
            return sub == sub[::-1]

        l, r = 0, len(s) - 1
        while l < r:
            if s[l] != s[r]:
                # Try skipping s[l] OR skipping s[r]
                return is_pali(s[l + 1 : r + 1]) or is_pali(s[l:r])
            l += 1
            r -= 1

        return True
