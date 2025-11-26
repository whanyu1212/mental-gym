"""
    encode(strs::Vector{String})::String

Encodes a list of strings into a single string.

# Arguments
- `strs`: A vector of strings to be encoded.

# Returns
- A single string that encodes the input list of strings.
"""
function encode(strs::Vector{String})::String
    output = ""
    for c in strs
        output *= string(length(c)) * "#" * c
    end
    return output
end

"""
    decode(s::String)::Vector{String}

Decodes a single string back into a list of strings.

# Arguments
- `s`: A string that encodes a list of strings.

# Returns
- A vector of strings that were encoded in the input string.
"""
function decode(s::String)::Vector{String}
    output = []
    i = 1
    while i < length(s) + 1
        j = i
        while s[j] != '#'
            j += 1
        end
        len = parse(Int, s[i:j-1])
        push!(output, s[j+1:j+len])
        i = j + len + 1
    end
    return output
end