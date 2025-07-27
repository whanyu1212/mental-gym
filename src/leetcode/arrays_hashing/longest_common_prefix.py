from typing import List


class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        output = ""

        # using zip is the more elegant and pythonic way
        # Note on the difference betwen zip(strs)
        # zip(*strs), the unpacking operator
        for char_tuple in zip(*strs):
            if len(set(char_tuple)) == 1:
                output += char_tuple[0]
            else:
                break
        return output


if __name__ == "__main__":
    sol = Solution()
    strs = ["flower", "flow", "flight"]
    print(sol.longestCommonPrefix(strs))
