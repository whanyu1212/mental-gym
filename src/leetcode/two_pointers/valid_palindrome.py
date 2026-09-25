class Solution:
    def isPalindrome(self, s: str) -> bool:
        # output = ""  # creation of new string adds space complexity
        # for char in s:
        #     if char.isalnum():
        #         output += char.lower()

        # return output == output[::-1]

        left, right = 0, len(s) - 1

        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True


if __name__ == "__main__":
    sol = Solution()
    print(sol.isPalindrome("Was it a car or a cat I saw?"))  # should return True
    print(sol.isPalindrome("tab a cat"))  # should return False
