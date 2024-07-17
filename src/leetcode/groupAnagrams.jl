"""
    groupAnagrams(strs::Vector{String})::Vector{Vector{String}}

Groups anagrams from a list of strings. Anagrams are strings that can be formed by rearranging the letters of another string.

# Arguments
- `strs`: A vector of strings.

# Returns
- A vector of vectors, where each inner vector contains strings that are anagrams of each other.
"""
function groupAnagrams(strs::Vector{String})
    anagrams = Dict{String, Vector{String}}()
    for str in strs
        key = join(sort(collect(str)))
        if !haskey(anagrams, key)
            anagrams[key] = []
        end
        push!(anagrams[key], str)
    end
    sorted_anagrams = sort(collect(values(anagrams)), by=length)
    # sort by the length of the inner lists in ascending order
    # and then sort by the strings inside the inner lists
    return map(sort, sorted_anagrams)
end