"""
    merge(nums1::Vector{Int}, m::Int, nums2::Vector{Int}, n::Int)

Merge the first `m` values of `nums1` with all `n` values of `nums2`.
Store the sorted result in `nums1` in place.

Julia uses 1-based indexing. Because we merge from right to left:

- `i` reads the last unmerged value from the original part of `nums1`.
- `j` reads the last unmerged value from `nums2`.
- `k` points to the next position to write in `nums1`.
"""
function merge(nums1::Vector{Int}, m::Int, nums2::Vector{Int}, n::Int)::Nothing
    # In Julia, the last element of the first m values is at index m.
    i = m
    j = n
    k = m + n

    # Compare values while both input sections still have unread values.
    # Place the larger value at nums1[k], then move the pointer that supplied it.
    while i >= 1 && j >= 1
        if nums1[i] > nums2[j]
            nums1[k] = nums1[i]
            i -= 1
            k -= 1
        else
            nums1[k] = nums2[j]
            j -= 1
            k -= 1
        end
    end

    # If nums1's original values finish first, nums2 may still have values
    # that must be copied into the remaining positions of nums1.
    # If nums2 finishes first, nums1's remaining values are already in place.
    while j >= 1
        nums1[k] = nums2[j]
        j -= 1
        k -= 1
    end

    return nothing
end

# Example usage
if abspath(PROGRAM_FILE) == @__FILE__
    nums1 = [1, 2, 3, 0, 0, 0]
    nums2 = [2, 5, 6]
    merge(nums1, 3, nums2, 3)
    println(nums1)  # Expected after completing the TODOs: [1, 2, 2, 3, 5, 6]
end
