using Test
include("../../src/leetcode/stack/julia/MinWindow.jl")

@testset "minimum window substring" begin
    @test minWindow("ADOBECODEBANC", "ABC") == "BANC"
    @test minWindow("a", "a") == "a"
    @test minWindow("a", "aa") == ""
    @test minWindow("AAABBC", "AABC") == "AABBC"
    @test minWindow("ABC", "D") == ""
    @test minWindow("aA", "A") == "A"
    @test minWindow("", "A") == ""
    @test minWindow("ABC", "") == ""
end
