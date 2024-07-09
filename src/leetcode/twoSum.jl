function twoSum(nums::Vector{Int}, target::Int)
    dict = Dict{Int, Int}()
    for (i, num) in enumerate(nums)
        if haskey(dict, target - num)
            return [dict[target - num], i]
        end
        dict[num] = i
    end
end