from typing import List


class Solution:
    # The need for using a non-ascii character for more robust encoding
    # An abmiguous example: ["hello", "world,with,comma", "test"]
    # But even non-ascii character can be part of the string
    # e.g., ["neet", "co#de"] -> "neet#co#de" -> ["neet", "co", "de"]

    def encode(self, strs: List[str]) -> str:
        result = ""
        for s in strs:
            result = result + str(len(s)) + "#" + s
        return result

    def decode(self, s: str) -> List[str]:
        result = []

        i = 0
        while i < len(s):
            j = i
            while s[j] != "#":
                j += 1
            length = int(s[i:j])
            i = j + 1
            j = length + i

            result.append(s[i:j])
            i = j
        return result


if __name__ == "__main__":
    sol = Solution()
    print(sol.encode(["neet", "code"]))
    print(sol.decode("4#neet4#code"))
