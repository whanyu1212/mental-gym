function longestConsecutive(nums::Vector{Int})::Int
    if isempty(nums)
        return 0
    end

    nums_set = Set(nums)
    longest = 0

    for num in nums_set
        # Check if it's the start of a sequence
        if !((num - 1) in nums_set)
            current_num = num
            current_length = 1
            # Count the length of the current consecutive sequence
            while (current_num + 1) in nums_set
                current_num += 1
                current_length += 1
            end
            longest = max(longest, current_length)
        end
    end
    return longest
end

using Test

@testset "Longest Consecutive Sequence Tests" begin
    @test longestConsecutive([100, 4, 200, 1, 3, 2]) == 4
    @test longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
    @test longestConsecutive(Int[]) == 0 # Empty array
    @test longestConsecutive([1]) == 1 # Single element
    @test longestConsecutive([1, 1, 1, 1]) == 1 # Duplicate elements, single sequence
    @test longestConsecutive([1, 2, 3, 5, 6]) == 3 # Two sequences
    @test longestConsecutive([5, 4, 3, 2, 1]) == 5 # Reverse order
    @test longestConsecutive([1, 3, 5, 7, 9]) == 1 # No consecutive elements
    @test longestConsecutive([9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]) == 7 # More complex case from LeetCode
end
