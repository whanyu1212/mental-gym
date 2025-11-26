using Test
include("../../src/leetcode/arrays_hashing/GroupAnagrams.jl")

@testset "group_anagrams" begin
    # Sort both inner and outer arrays for order-independent comparison
    result = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    result_sorted = sort([sort(group) for group in result])
    expected_sorted = sort([sort(["bat"]), sort(["nat","tan"]), sort(["ate","eat","tea"])])
    @test result_sorted == expected_sorted

    @test group_anagrams([""]) == [[""]]
    @test group_anagrams(["a"]) == [["a"]]
end