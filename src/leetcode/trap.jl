function trap(height::Vector{Int})::Int
    L, R = 1, length(height)
    left_max, right_max = height[L], height[R]

    result = 0

    while L < R
        if left_max < right_max
            L += 1
            left_max = max(left_max, height[L])
            result += left_max - height[L]
        else
            R -= 1
            right_max = max(right_max, height[R])
            result += right_max - height[R]
        end
    end
    
    return result
end

# Example usage
if abspath(PROGRAM_FILE) == @__FILE__
    println(trap([0, 2, 0, 3, 1, 0, 1, 3, 2, 1]))
end