function encode(str::Vector{String})::String
    result = ""
    for s in str
        result = result * string(length(s)) * '#' * s
    end
    return result
end


function decode(s::String)::Vector{String}
    result = []
    i = 1 # julia's index starts from 1 

    # The advancement is not uniform, therefore
    # a while loop is better than for loop
    while i <= length(s) # inclusive of the end
        j = i
        while s[j] != '#'
            j += 1
        end
        length = parse(Int, s[i:j-1])
        i = j + 1
        j = i + length - 1
        push!(result, s[i:j])
        i = j + 1
    end
    return result

end


strs = ["neet", "code"]
encoded_str = encode(strs)
println("Encoded: ", encoded_str)

decoded_strs = decode(encoded_str)
println("Decoded: ", decoded_strs)