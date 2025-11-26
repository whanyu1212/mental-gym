using Test 
include("../../src/leetcode/arrays_hashing/LongestConsecutive.jl")

@testset "longest consecutive sequence" begin
    @test longestConsecutive([100, 4, 200, 1, 3, 2]) == 4
    @test longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
    @test longestConsecutive([1, 2, 0, 1]) == 3
end