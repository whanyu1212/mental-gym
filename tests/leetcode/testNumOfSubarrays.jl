using Test

include("../../src/leetcode/arrays_hashing/NumOfSubarrays.jl")

@testset "numOfSubarrays" begin
    @test numOfSubarrays([2,2,2,2,5,5,5,8], 3, 4) == 3
    @test numOfSubarrays([11,13,17,23,29,31,7,5,2,3], 3, 5) == 6

    # k = 1: every single-element window clears a threshold of 0.
    @test numOfSubarrays([1,1,1,1,1], 1, 0) == 5

    # Nothing qualifies. Catches comparing a window sum against the raw
    # average instead of the scaled target, which would pass everything.
    @test numOfSubarrays([1,1,1,1,1], 5, 5) == 0

    # Single window spanning the whole array, average landing exactly on the
    # threshold. Catches first/last-window off-by-ones and a `>` for `>=` slip.
    @test numOfSubarrays([1,2,3,4,5], 5, 3) == 1

    # Window longer than the array: no window fits.
    @test numOfSubarrays([1,2,3], 5, 0) == 0
end
