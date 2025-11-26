function threeSum(nums::Vector{Int})::Vector{Vector{Int}}

    res = Vector{Vector{Int}}()
    sort!(nums) # sort the array in order to apply two pointers

    # check early termination
    if length(nums) < 3
        return res
    end

    for (i, a) in enumerate(nums)
        if a > 0
            break # the remaining elements are all positive, can no longer add up to 0
        end

        if i > 1 && a == nums[i - 1]
            continue # skip duplicates
        end
    

        l , r = i + 1, length(nums) # Julia's index starts from 1, so its length instead of length - 1

        while l < r
            threesum = a + nums[l] + nums[r]

            if threesum > 0 
                r -= 1
            elseif threesum < 0
                l += 1
            else 
                push!(res,[a, nums[l], nums[r]])
                l += 1
                r -= 1
                while nums[l] == nums[l - 1] && l < r # julia uses && instead of and
                    l += 1
                end
            end
        end
        end
    return res
end