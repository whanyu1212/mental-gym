"""
    numOfSubarrays(arr::Vector{Int}, k::Int, threshold::Int)::Int

Count sub-arrays of size `k` whose average is >= `threshold`.

Arguments:
  arr       -- the vector of integers to search
  k         -- the fixed sub-array length
  threshold -- the minimum average a window must reach to count

Returns the number of length-k windows whose average is >= threshold.
"""
function numOfSubarrays(arr::Vector{Int}, k::Int, threshold::Int)::Int
    # Hint: comparing `window_sum / k >= threshold` drags floats (or, with
    # `//`, allocating Rationals) into the loop. Scale the threshold up once
    # instead so every comparison stays in Int.
    target = threshold * k

    window_sum = 0
    count = 0

    # `left` trails `right`; the live window is always arr[left:right], so its
    # size is `right - left + 1` -- no offset arithmetic to second-guess.
    left = 1

    for right in 1:length(arr)
        # Extend: every element enters the window exactly once.
        window_sum += arr[right]

        # Shrink: the window overgrew, so drop the trailing element. A
        # fixed-size window can only overshoot by one per step, so this is an
        # `if`; a variable-size window would need a `while` here instead.
        if right - left + 1 > k
            window_sum -= arr[left]
            left += 1
        end

        # Count: a sibling of the shrink, not nested inside it. The first full
        # window (right == k) is built entirely by extends with zero shrinks,
        # so gating this on the shrink would skip it -- counting happens on
        # n-k+1 iterations, shrinking on only n-k of them.
        if right - left + 1 == k && window_sum >= target
            count += 1
        end
    end

    return count
end


if abspath(PROGRAM_FILE) == @__FILE__
    # Expected: 3 (qualifying windows are [2,5,5]->4, [5,5,5]->5, [5,5,8]->6;
    # the four windows before them average 2 or 3, below the threshold of 4)
    println(numOfSubarrays([2, 2, 2, 2, 5, 5, 5, 8], 3, 4))

    # Expected: 6
    println(numOfSubarrays([11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5))

    # Expected: 5 (k=1, threshold=0 -> every single-element window passes)
    println(numOfSubarrays([1, 1, 1, 1, 1], 1, 0))

    # Expected: 0 (no window reaches the threshold)
    println(numOfSubarrays([1, 1, 1, 1, 1], 5, 5))

    # Expected: 1 (single window spanning the whole array, average exactly 3)
    println(numOfSubarrays([1, 2, 3, 4, 5], 5, 3))
end
