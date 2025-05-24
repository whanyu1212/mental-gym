using DataStructures

function group_anagrams(strs::Vector{String})::Vector{Vector{String}}
    # The tuple can contain a variable number of elemtns of type Int
    # -> String[] default value factory
    result = DefaultDict{Tuple{Vararg{Int}},Vector{String}}(() -> String[])
    for s in strs
        # More idiomatic initialization in julia
        # Instead of using repeat
        count = zeros(Int, 26)
        for char in s
            # Julia is 1 based indexing
            index = Int(char) - Int('a') + 1
            if 1 <= index <= 26
                count[index] += 1
            else
                @warn "Character '$char' in string '$s' is not a lowercase English letter."
            end
        end
        key = Tuple(count)
        push!(result[key], s)
    end
    return collect(values(result))

end

if abspath(PROGRAM_FILE) == @__FILE__
    strs1 = ["eat", "tea", "tan", "ate", "nat", "bat"]
    println(group_anagrams(strs1))
end

# julia --project=<project path> <file path>
# project path can be empty if you cd into the project directory