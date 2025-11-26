using Test

include("../../src/leetcode/two_pointers/threeSum.jl")

@testset "Threesum" begin
    @test threeSum([-1, 0, 1, 2, -1, -4]) == [[-1, -1, 2], [-1, 0, 1]]
    @test threeSum(Int[]) == [] # explicitly declare the type of the array as Int if not it will throw an error
    @test threeSum([0]) == []
    @test threeSum([0, 0, 0]) == [[0, 0, 0]]
    @test threeSum([0, 0, 0, 0]) == [[0, 0, 0]]

end