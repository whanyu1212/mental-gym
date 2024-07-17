using Test
include("../../src/leetcode/groupAnagrams.jl")

@testset "groupAnagrams" begin
    @test groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]) == [["bat"],["nat","tan"],["ate","eat","tea"]]
    @test groupAnagrams([""]) == [[""]]
    @test groupAnagrams(["a"]) == [["a"]]
end