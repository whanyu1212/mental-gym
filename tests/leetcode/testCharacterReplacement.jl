using Test

include("../../src/leetcode/CharacterReplacement.jl")

@testset "CharacterReplacement" begin
    @test characterReplacement("ABAB", 2) == 4
    @test characterReplacement("AABABBA", 1) == 4
end