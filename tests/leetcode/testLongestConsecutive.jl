using Test 
include("../../src/leetcode/LongestConsecutive.jl")

@testset "longest consecutive sequence" begin
    @test longest_consecutive([100, 4, 200, 1, 3, 2]) == 4
    @test longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
    @test longest_consecutive([1, 2, 0, 1]) == 3
end