function getConcatenation(nums::Vector{Int})
    n = length(nums)
    result = Vector{Int}(undef, 2n)  # Pre-allocate for better performance
    # using undef creates uninitialized memory, which is faster than using zeros
    
    for i in 1:n
        result[i] = nums[i]        # First half
        result[i + n] = nums[i]    # Second half
    end
    
    return result
end

if abspath(PROGRAM_FILE) == @__FILE__
    println(getConcatenation([1, 2, 1]))  # Expected output: [1, 2, 1, 1, 2, 1]
    println(getConcatenation([1, 3, 2, 1])) # Expected output: [1, 3, 2, 1, 1, 3, 2, 1]
end