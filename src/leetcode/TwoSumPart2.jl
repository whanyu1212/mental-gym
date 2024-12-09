using Test

function TwoSumPart2(nums::Vector{Int}, target::Int)
    i, j = 1, length(nums)
    while i < j
        sum = nums[i] + nums[j]
        if sum == target
            return [i, j]
        elseif sum < target
            i += 1
        else
            j -= 1
        end
    end
    return []
end

if abspath(PROGRAM_FILE) == @__FILE__
    @test TwoSumPart2([2, 7, 11, 15], 9) == [1, 2]
    @test TwoSumPart2([2, 3, 4], 6) == [1, 3]
    @test TwoSumPart2([-1, 0], -1) == [1, 2]
end