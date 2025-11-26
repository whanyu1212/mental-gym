using Test
include("../../src/leetcode/julia/ValidParenthesis.jl")

@testset "valid parentheis" begin
    @test isValid("()") == true
    @test isValid("()[]{}") == true
    @test isValid("(]") == false
    @test isValid("([)]") == false
    @test isValid("{[]}") == true
    @test isValid("]") == false
    @test isValid("}") == false
end
