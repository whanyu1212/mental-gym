function productExceptSelf(nums::Vector{Int})::Vector{Int}
    result = repeat([1], length(nums))
    prefix, postfix = 1, 1
    for i in 1:length(nums)
        result[i] = prefix
        prefix *= nums[i]
    end

    for i in length(nums):-1:1
        result[i] *= postfix
        postfix *= nums[i]
    end

    return result
end


using Test

@testset "Product Except Self Tests" begin
    @test productExceptSelf([1, 2, 3, 4]) == [24, 12, 8, 6]
    @test productExceptSelf([-1, 1, 0, -3, 3]) == [0, 0, 9, 0, 0]
    @test productExceptSelf([1, 2, 0, 4]) == [0, 0, 8, 0]
    @test productExceptSelf([0, 0, 1, 2]) == [0, 0, 0, 0]
    @test productExceptSelf([1, 1, 1, 1]) == [1, 1, 1, 1]
    @test productExceptSelf([5, 2]) == [2, 5]
    @test productExceptSelf([10]) == [1] # Edge case: single element
    @test productExceptSelf(Int[]) == Int[] # Edge case: empty vector
    @test productExceptSelf([2, 3, 0, 0]) == [0, 0, 0, 0]
    @test productExceptSelf([-1, -2, -3, -4]) == [-24, -12, -8, -6]
    @test productExceptSelf([1, -1, 1, -1]) == [1, -1, 1, -1]
end

println("Running tests...")