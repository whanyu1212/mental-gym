"""
    twoSum(nums::Vector{Int}, target::Int) -> Vector{Int}

Finds two indices in the given vector `nums` such that the numbers at those indices add up to the `target`.

# Arguments
- `nums::Vector{Int}`: A vector of integers.
- `target::Int`: The target sum.

# Returns
- `Vector{Int}`: A vector containing the two indices of the numbers that add up to the target. If no such indices exist, returns `nothing`.

# Example
```julia
twoSum([2, 7, 11, 15], 9) # returns [1, 2]
```
"""
function twoSum(nums::Vector{Int}, target::Int)::Union{Vector{Int}, Nothing}
    dict = Dict{Int, Int}()
    for (i, num) in enumerate(nums)
        if haskey(dict, target - num)
            return [dict[target - num], i]
        end
        dict[num] = i
    end
    return nothing
end