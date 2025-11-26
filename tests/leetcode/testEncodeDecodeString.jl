using Test
include("../../src/leetcode/julia/arrays_hashing/EncodeDecodeString.jl")

@testset "EncodeDecodeString" begin
    @test encode(["abc", "def"]) == "3#abc3#def"
    @test decode("3#abc3#def") == ["abc", "def"]
end