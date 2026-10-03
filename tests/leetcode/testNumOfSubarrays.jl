using Test
using Random

include("../../src/leetcode/arrays_hashing/julia/NumOfSubarrays.jl")

@testset "numOfSubarrays" begin
    @test numOfSubarrays([2,2,2,2,5,5,5,8], 3, 4) == 3
    @test numOfSubarrays([11,13,17,23,29,31,7,5,2,3], 3, 5) == 6
    @test numOfSubarrays([5], 1, 5) == 1
    @test numOfSubarrays([1], 1, 5) == 0
    @test numOfSubarrays([2, 4], 2, 3) == 1
    @test numOfSubarrays([1, 1, 5], 2, 3) == 1
    @test numOfSubarrays([1, 1, 5, 1], 2, 3) == 2
    @test numOfSubarrays([5, 5, 5], 1, 5) == 3
end

@testset "numOfSubarrays agrees with a direct window scan" begin
    rng = MersenneTwister(1343)
    for n in 1:12, window in 1:n, trial in 1:10
        arr = rand(rng, 1:20, n)
        threshold = rand(rng, 1:20)
        expected = count(
            start -> sum(arr[start:(start + window - 1)]) >= threshold * window,
            1:(n - window + 1),
        )
        @test numOfSubarrays(arr, window, threshold) == expected
    end
end
