function closeDuplicates(nums::Vector{Int}, k::Int)::Bool

    window = Set{Int}() # Initialize a set to store the elements
    L = 1 # Initial left pointer

    for R in 1:length(nums) # Iterate over the array
        if R - L > k
            delete!(window, nums[L]) # Remove the element at the left pointer
            L += 1
        end
        if nums[R] in window
            return true
        end

        push!(window, nums[R]) # Add the element to the set
    end
    return false
end

# Example usage
if abspath(PROGRAM_FILE) == @__FILE__
    nums = [1,2,3,1]
    k = 3
    println(closeDuplicates(nums, k)) # true
end