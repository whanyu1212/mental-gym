"""
    containsDuplicate(nums::Vector{Int})::Bool

Check if the input vector `nums` contains any duplicate elements.

# Arguments
- `nums`: A vector of integers.

# Returns
- `true` if there are duplicate elements in `nums`, otherwise `false`.
"""
function containsDuplicate(nums::Vector{Int})::Bool
    return length(nums) != length(Set(nums))
end