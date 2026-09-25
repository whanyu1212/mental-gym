class Solution:
    def validPalindrome(self, s: str) -> bool:
        def is_pali(sub: str) -> bool:
            return sub == sub[::-1]

        left, right = 0, len(s) - 1
        while left < right:
            if s[left] != s[right]:
                # Try skipping s[left] OR skipping s[right]
                return is_pali(s[left + 1 : right + 1]) or is_pali(s[left:right])
            left += 1
            right -= 1

        return True
