function threeSum(nums::Vector{Int})
    res = []
    sort!(nums) # sort the array in order to apply two pointers

    # check early termination
    if length(nums) < 3
        return res
    end

    for (i, a) in enumerate(nums)
        if a > 0
            break # the remaining elements are all positive, can no longer add up to 0
        end
    
    end

    l , r = i + 1, length(nums) # two pointers

    while l < r
        b, c = nums[l], nums[r]
        total = a + b + c

        if total == 0
            push!(res, [a, b, c])
            while l < r && nums[l] == b
                l += 1
            end
            while l < r && nums[r] == c
                r -= 1
            end
        elseif total < 0
            l += 1
        else
            r -= 1
        end
    end