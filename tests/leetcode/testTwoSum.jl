using Test
include("../../src/leetcode/arrays_hashing/TwoSum.jl")


@testset "twoSum" begin
    @test twoSum([2, 7, 11, 15], 9) == [1, 2]
    @test twoSum([3, 2, 4], 6) == [2, 3]
    @test twoSum([3, 3], 6) == [1, 2]

    @test twoSum([1, 2, 3, 4, 5], 9) == [4, 5]
    @test twoSum([5, 75, 25], 100) == [2, 3]
    @test twoSum([0, 4, 3, 0], 0) == [1, 4]
    @test twoSum([-3, 4, 3, 90], 0) == [1, 3]
    @test twoSum([1, 2, 3, 4, 5], 10) == nothing
end
