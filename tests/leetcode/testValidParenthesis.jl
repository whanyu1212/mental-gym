using Test
include("../../src/leetcode/ValidParenthesis.jl")

@testset "valid parentheis" begin
    @test isValid("()") == true
    @test isValid("()[]{}") == true
    @test isValid("(]") == false
    @test isValid("([)]") == false
    @test isValid("{[]}") == true
    @test isValid("]") == false
    @test isValid("}") == false
end
