using Test
include("../../src/leetcode/twoSum.jl")


@testset "twoSum" begin
    @test twoSum([2, 7, 11, 15], 9) == [1, 2]
    @test twoSum([3, 2, 4], 6) == [2, 3]
    @test twoSum([3, 3], 6) == [1, 2]
end
