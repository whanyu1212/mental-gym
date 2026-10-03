using Test

include("../../src/leetcode/two_pointers/julia/ValidPalindrome.jl")

@testset "isPalindrome" begin
    @test isPalindrome("A man, a plan, a canal: Panama") == true
    @test isPalindrome(" ") == true
    @test isPalindrome("race a car") == false
end
