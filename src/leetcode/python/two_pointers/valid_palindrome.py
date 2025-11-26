class Solution:
    def isPalindrome(self, s: str) -> bool:
        # output = ""  # creation of new string adds space complexity
        # for char in s:
        #     if char.isalnum():
        #         output += char.lower()

        # return output == output[::-1]

        l, r = 0, len(s) - 1

        while l < r:
            while l < r and not s[l].isalnum():
                l += 1
            while l < r and not s[r].isalnum():
                r -= 1
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1
        return True


if __name__ == "__main__":
    sol = Solution()
    print(sol.isPalindrome("Was it a car or a cat I saw?"))  # should return True
    print(sol.isPalindrome("tab a cat"))  # should return False
