"""
    longest_consecutive(nums::Vector{Int})::Int

Finds the length of the longest consecutive elements sequence in the given vector of integers.

# Arguments
- `nums`: A vector of integers.

# Returns
- An integer representing the length of the longest consecutive elements sequence.
"""
function longest_consecutive(nums::Vector{Int})::Int
    # Initialize a set to store the numbers
    num_set = Set(nums)
    longest_streak = 0

    for n in nums
        if (n-1) ∉ num_set # \notin and tab to get the ∉ symbol in REPL
            length = 1
            while (n+length) in num_set
                length += 1
            end
            longest_streak = max(longest_streak, length)
        end
    end
    return longest_streak
end