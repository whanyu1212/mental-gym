"""
    minWindow(s::String, t::String)::String

Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.

This function solves the "Minimum Window Substring" problem on LeetCode (Problem #76).

# Arguments
- `s::String`: The string in which to find the minimum window substring.
- `t::String`: The string containing the characters to be included in the window.

# Returns
- `String`: The minimum window substring of `s` that contains all characters of `t`. If no such substring exists, returns `""`.
"""

function minWindow(s::String, t::String)::String
    if isempty(s) || isempty(t) || length(s) < length(t)
        return ""
    end

    # Initialize the hashmaps
    pattern_count, window = Dict{Char, Int}(), Dict{Char, Int}()
    for c in t
        pattern_count[c] = get(pattern_count, c, 0) + 1
    end
    
    # Tracking variables for comparing the window and pattern, whether they match in count
    have, need = 0, length(pattern_count) # O(1) time complexity to check if the window and pattern match
    left, right = 1, 1
    min_len, res = Inf, [0, 0]

    # Sliding window algorithm
    for right in eachindex(s)
        c = s[right]
        window[c] = get(window, c, 0) + 1
        if haskey(pattern_count, c) && window[c] == pattern_count[c]
            have += 1
        end

        while have == need
            # Check if its shorter than the current minimum length
            if right - left + 1 < min_len
                min_len = right - left + 1
                res = [left, right]
            end
            
            # Shrink the window by moving the left pointer to the right
            # Subtrack the counter if the character is in the pattern
            c = s[left]
            if haskey(pattern_count, c) && window[c] == pattern_count[c]
                have -= 1
            end
            window[c] -= 1
            left += 1
        end
    end
    return min_len == Inf ? "" : s[res[1]:res[2]]
end

# Example usage

if abspath(PROGRAM_FILE) == @__FILE__
    println(minWindow("ADOBECODEBANC", "ABC")) # Expected output: "BANC"
    println(minWindow("a", "a")) # Expected output: "a"
    println(minWindow("a", "aa")) # Expected output: ""
end