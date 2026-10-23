function numOfSubarrays(arr::Vector{Int}, window::Int, threshold::Int)::Int
    # No window fits, so there is nothing to count. Without this the
    # arr[1:window] seed below would throw a BoundsError.
    if window > length(arr)
        return 0
    end

    # Compare sums directly against a scaled threshold. Dividing instead would
    # mean floats, or -- with Julia's `//` -- allocating a Rational every
    # iteration just to answer a yes/no question.
    target = threshold * window

    # Seed the first window explicitly, then count it before the loop starts.
    # This is the counterpart to the unified single-loop formulation in
    # sliding_window/subarrays_with_avg_geq_threshold.jl: pay for a prologue
    # here, and in exchange every loop iteration is a uniform slide.
    curr_sum = sum(arr[1:window])
    result = curr_sum >= target ? 1 : 0

    # L is the left edge of the current window, which spans L:(L + window - 1).
    # There are length(arr) - window + 1 windows in total and the first is
    # already counted, so the remaining left edges run from 2 to that bound.
    for L in 2:(length(arr) - window + 1)
        # Slide one step: the incoming element enters at the window's right
        # edge, the outgoing one just fell off the left.
        curr_sum += arr[L + window - 1] - arr[L - 1]
        if curr_sum >= target
            result += 1
        end
    end

    return result
end
