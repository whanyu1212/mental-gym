class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        s_dict = {}
        t_dict = {}
        for char in s:
            s_dict[char] = s_dict.get(char, 0) + 1
        for char in t:
            t_dict[char] = t_dict.get(char, 0) + 1
        return s_dict == t_dict


# Example usage
solution = Solution.isAnagram("anagram", "nagaram")
print(solution)  # Output: True
solution = Solution.isAnagram("rat", "car")
print(solution)  # Output: False
