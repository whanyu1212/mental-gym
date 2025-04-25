"""
    two_sum(nums::Vector{Int}, target::Int) -> Vector{Int}

Given a vector of integers `nums` and an integer `target`, return the 1-based indices
of the two numbers such that they add up to `target`.

Assumes that each input has exactly one solution, and the same element cannot be used twice.
Throws an error if no solution is found.

# Arguments
- `nums::Vector{Int}`: The input vector of integers.
- `target::Int`: The target sum.

# Returns
- `Vector{Int}`: A vector containing the two 1-based indices.

# Throws
- `ErrorException`: If no two numbers in `nums` sum to `target`.

# Examples
```jldoctest
julia> twoSum([2, 7, 11, 15], 9)
2-element Vector{Int64}:
 1
 2

julia> twoSum([3, 2, 4], 6)
2-element Vector{Int64}:
 2
 3
```
"""
function two_sum(nums::Vector{Int}, target::Int)::Vector{Int}
    num_to_index = Dict{Int,Int}() # Stores number -> index mapping
    for (index, num) in enumerate(nums)
        complement = target - num
        # Use get with default 0 (invalid index) to check if complement exists
        complement_index = get(num_to_index, complement, 0)
        if complement_index > 0 # Check if a valid index was found
            return [complement_index, index]
        end
        # Store the current number and its index
        num_to_index[num] = index
    end
    # If the loop completes, no solution was found (violates assumption)
    error("No two sum solution found for the given input.")
end