from collections import defaultdict
from typing import List


class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        # avoid checking if the key is in the dict
        result = defaultdict(list)

        for s in strs:
            count = [0] * 26

            for char in s:
                count[ord(char) - ord("a")] += 1
            # convert the list to a tuple so it can be used as a key
            result[tuple(count)].append(s)

        return list(result.values())


if __name__ == "__main__":
    solution = Solution()
    print(
        solution.groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    )  # [["bat"],["nat","tan"],["ate","eat","tea"]]
    print(solution.groupAnagrams([""]))  # [[""]]
    print(solution.groupAnagrams(["a"]))  # [["a"]]
