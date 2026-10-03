function numOfSubarrays(arr::Vector{Int}, window::Int, threshold::Int)::Int
    result = 0 # initialize a counter
    curr_sum = sum(arr[1:window]) # initialize the current sum up to index k

    # A length-window array still has one window; include the final start index.
    for L in 1:(length(arr) - window + 1)
        if L > 1
            # Advancing to L removes L - 1 and adds the new right endpoint.
            curr_sum = curr_sum - arr[L - 1] + arr[L + window - 1]
        end
        if curr_sum // window >= threshold
            result += 1
        end
    end

    return result
end
