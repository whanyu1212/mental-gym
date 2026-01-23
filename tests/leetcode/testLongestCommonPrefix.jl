using Test

# Include the module
include("../../src/leetcode/julia/arrays_hashing/LongestCommonPrefix.jl")
using .LongestCommonPrefix

@testset "LongestCommonPrefix Tests" begin
    @testset "Basic cases" begin
        @test longestCommonPrefix(["flower", "flow", "flight"]) == "fl"
        @test longestCommonPrefix(["dog", "racecar", "car"]) == ""
    end
    
    @testset "Edge cases" begin
        @test longestCommonPrefix(String[]) == ""
        @test longestCommonPrefix(["single"]) == "single"
        @test longestCommonPrefix(["", "test"]) == ""
        @test longestCommonPrefix(["test", ""]) == ""
    end
    
    @testset "All identical" begin
        @test longestCommonPrefix(["test", "test", "test"]) == "test"
    end
    
    @testset "No common prefix" begin
        @test longestCommonPrefix(["abc", "def", "ghi"]) == ""
    end
    
    @testset "Different lengths" begin
        @test longestCommonPrefix(["prefix", "pre", "preschool"]) == "pre"
        @test longestCommonPrefix(["interspecies", "interstellar", "interstate"]) == "inters"
    end
end
