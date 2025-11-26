function characterReplacement(s::String, k::Int)::Int
    ## initialize the variables
    char_count = Dict{Char, Int}() # A Dict to store the count of each character in the window
    L = 1 # Left pointer of the window
    max_count = 0 # The count of the most frequent character in the window
    max_length = 0 # The length of the longest substring with the same character

    ## Loop through the string
    for R in eachindex(s)
        char = s[R]
        if haskey(char_count, char)
            char_count[char] += 1
        else
            char_count[char] = 1
        end
        # update the max count character in the window
        max_count = max(max_count, char_count[char])

        current_length = R - L + 1

        if current_length - max_count > k
            char_count[s[L]] -=1
            L += 1 # shrink the substring by moving the left pointer to right
        else
            max_length = max(max_length, current_length)
        end

    end
    return max_length
end


if abspath(PROGRAM_FILE) == @__FILE__
    println(characterReplacement("ABAB", 2))  # Expected output: 4
    println(characterReplacement("AABABBA", 1)) # Expected output: 4
end