using Test

include("../../src/leetcode/arrays_hashing/NumOfSubarrays.jl")

@testset "numOfSubarrays" begin
    @test numOfSubarrays([2,2,2,2,5,5,5,8], 3, 4) == 3
    @test numOfSubarrays([11,13,17,23,29,31,7,5,2,3], 3, 5) == 6
end