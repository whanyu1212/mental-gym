"""
    MaxArea(height::Vector{Int})::Int

Calculate the maximum area of water that can be contained between two lines.

# Arguments
- `height::Vector{Int}`: A vector of integers representing the height of lines.

# Returns
- `Int`: The maximum area of water that can be contained.

# Example
```julia
heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
println(MaxArea(heights))  # Output: 49
"""

function MaxArea(height::Vector{Int})::Int
    # Initialize left and right pointers to be at position 1 and n

    l, r = 1, length(height)
    max_area = 0
    while l < r
        max_area = max(max_area, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]
            l += 1 # move to the center to find a higher height
        else
            r -= 1 # move to the center to find a higher height
        end
    end
    return max_area
end