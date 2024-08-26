function numOfSubarrays(arr::Vector{Int}, window::Int, threshold::Int)::Int
    result = 0 # initialize a counter
    curr_sum = sum(arr[1:window]) # initialize the current sum up to index k

    for L in 1:(length(arr) - window)
        if L > 1
            curr_sum = curr_sum - arr[L - 1] + arr[L + window] # update the current sum
        end
        if curr_sum // window >= threshold
            result += 1
        end
    end

    return result
end