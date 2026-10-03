module LongestCommonPrefix

export longestCommonPrefix

"""
    longestCommonPrefix(strs::Vector{String}) -> String

Find the longest common prefix among an array of strings.

# Examples
```julia
longestCommonPrefix(["flower", "flow", "flight"])  # "fl"
longestCommonPrefix(["dog", "racecar", "car"])      # ""
```
"""
function longestCommonPrefix(strs::Vector{String})::String
    # ============================================================================
    # APPROACH 1: Vertical Scanning (Character-by-character comparison)
    # ============================================================================
    # Time: O(S) where S = sum of all characters in all strings (worst case)
    # Space: O(1) excluding output string
    #
    # Algorithm:
    #   1. For each character position, check if all strings have the same character
    #   2. If any string is shorter or character differs, stop
    #   3. Otherwise, add character to prefix
    #
    # Example with ["flower", "flow", "flight"]:
    #   Position 0: 'f' == 'f' == 'f' ✓ → add 'f'
    #   Position 1: 'l' == 'l' == 'l' ✓ → add 'l'
    #   Position 2: 'o' == 'o' != 'i' ✗ → stop
    #   Result: "fl"

    isempty(strs) && return ""

    prefix = ""
    min_len = minimum(length, strs)  # Find shortest string length

    for i in 1:min_len
        char = strs[1][i]
        # Check if all strings have the same character at position i
        for str in strs[2:end]
            if str[i] != char
                return prefix
            end
        end
        prefix *= char
    end

    return prefix

    # ============================================================================
    # APPROACH 2: Horizontal Scanning
    # ============================================================================
    # Time: O(S) where S = sum of all characters in all strings
    # Space: O(1) excluding output string
    #
    # Algorithm:
    #   1. Start with the first string as the initial prefix
    #   2. For each subsequent string, trim the prefix until it matches the start
    #   3. If prefix becomes empty, return immediately
    #
    # Example with ["flower", "flow", "flight"]:
    #   Initial prefix: "flower"
    #   Compare with "flow":
    #     - "flower" doesn't match start → trim to "flowe"
    #     - "flowe" doesn't match start → trim to "flow"
    #     - "flow" matches start → keep "flow"
    #   Compare with "flight":
    #     - "flow" doesn't match start → trim to "flo"
    #     - "flo" doesn't match start → trim to "fl"
    #     - "fl" matches start → keep "fl"
    #   Result: "fl"
    #
    # Uncomment to use:
    # isempty(strs) && return ""
    # prefix = strs[1]
    # for str in strs[2:end]
    #     while !startswith(str, prefix)
    #         prefix = prefix[1:end-1]
    #         isempty(prefix) && return ""
    #     end
    # end
    # return prefix

    # ============================================================================
    # APPROACH 3: Using reduce and zip (Functional approach)
    # ============================================================================
    # Time: O(S) where S = sum of all characters in all strings
    # Space: O(m) where m = length of prefix (for intermediate string)
    #
    # Algorithm:
    #   1. Zip all strings together (stops at shortest string)
    #   2. For each tuple of characters, check if all are the same
    #   3. Take characters until we find a mismatch
    #
    # Example with ["flower", "flow", "flight"]:
    #   zip creates: [('f','f','f'), ('l','l','l'), ('o','o','i'), ...]
    #   Check each tuple: all same? → take first character
    #   ('f','f','f'): all same ✓ → 'f'
    #   ('l','l','l'): all same ✓ → 'l'
    #   ('o','o','i'): not same ✗ → stop
    #   Result: "fl"
    #
    # Uncomment to use:
    # isempty(strs) && return ""
    # chars = zip(strs...)
    # prefix = ""
    # for char_tuple in chars
    #     if allequal(char_tuple)
    #         prefix *= first(char_tuple)
    #     else
    #         break
    #     end
    # end
    # return prefix

    # ============================================================================
    # APPROACH 4: Binary Search (on prefix length)
    # ============================================================================
    # Time: O(S * log m) where S = sum of all characters, m = length of shortest string
    # Space: O(1) excluding output string
    #
    # Algorithm:
    #   1. Find the minimum string length (upper bound for prefix)
    #   2. Binary search on the prefix length [0, min_len]
    #   3. For each mid point, check if all strings share the prefix of length mid
    #
    # Example with ["flower", "flow", "flight"]:
    #   Min length: 4 ("flow")
    #   Binary search range: [0, 4]
    #   mid = 2: Check "fl" → all strings start with "fl" ✓ → search [3, 4]
    #   mid = 3: Check "flo" → "flight" doesn't start with "flo" ✗ → search [3, 2]
    #   Result: "fl" (length 2)
    #
    # Uncomment to use:
    # isempty(strs) && return ""
    # min_len = minimum(length, strs)
    # low, high = 0, min_len
    # while low <= high
    #     mid = (low + high) ÷ 2
    #     prefix = strs[1][1:mid]
    #     if all(startswith(s, prefix) for s in strs)
    #         low = mid + 1
    #     else
    #         high = mid - 1
    #     end
    # end
    # return strs[1][1:high]
end

end  # module
