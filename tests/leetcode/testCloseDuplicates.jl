using Test
include("../../src/leetcode/CloseDuplicates.jl")

@testset "closeDuplicates" begin
    @test closeDuplicates([1, 2, 3, 1], 3) == true
    @test closeDuplicates([1, 0, 1, 1], 1) == true
    @test closeDuplicates([1, 2, 3, 1, 2, 3], 2) == false
end