using Test
include("../../src/leetcode/arrays_hashing/IsAnagram.jl")

@testset "isAnagram" begin
    @test isAnagram("anagram", "nagaram") == true
    @test isAnagram("rat", "car") == false
    @test isAnagram("a", "ab") == false
    @test isAnagram("ab", "a") == false
    @test isAnagram("a", "a") == true
    @test isAnagram("a", "b") == false
end