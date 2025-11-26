using Test
include("../../src/leetcode/julia/arrays_hashing/TwoSum.jl")


@testset "two_sum" begin
    @test two_sum([2, 7, 11, 15], 9) == [1, 2]
    @test two_sum([3, 2, 4], 6) == [2, 3]
    @test two_sum([3, 3], 6) == [1, 2]

    @test two_sum([1, 2, 3, 4, 5], 9) == [4, 5]
    @test two_sum([5, 75, 25], 100) == [2, 3]
    @test two_sum([0, 4, 3, 0], 0) == [1, 4]
    @test two_sum([-3, 4, 3, 90], 0) == [1, 3]
    @test_throws ErrorException two_sum([1, 2, 3, 4, 5], 10)
end
