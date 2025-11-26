using Test
include("../../src/leetcode/two_pointers/MaxArea.jl")

@testset "Container with Most Water" begin
    @test MaxArea([1,8,6,2,5,4,8,3,7]) == 49
    @test MaxArea([1,1]) == 1
    @test MaxArea([4,3,2,1,4]) == 16
    @test MaxArea([1,2,1]) == 2
end