using Test
include("../../src/leetcode/arrays_hashing/ContainsDuplicate.jl")

@testset "containsDuplicate" begin
    @test containsDuplicate([1, 2, 3, 1]) == true
    @test containsDuplicate([1, 2, 3, 4]) == false
    @test containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]) == true
end