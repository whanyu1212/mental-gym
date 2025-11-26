using Test  
include("../../src/leetcode/julia/sliding_window/MaxProfit.jl")

@testset "MaxProfit" begin
    @test MaxProfit([7,1,5,3,6,4]) == 5
    @test MaxProfit([7,6,4,3,1]) == 0
    @test MaxProfit([1,2]) == 1
    @test MaxProfit([2,1]) == 0
    @test MaxProfit([2,4,1]) == 2
    @test MaxProfit([3,2,6,5,0,3]) == 4
end