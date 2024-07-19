"""
    isPalindrome(x::String)::Bool

Determines if the given string `x` is a palindrome, considering only alphanumeric characters and ignoring cases.

# Arguments
- `x`: A string to be checked for palindrome property.

# Returns
- `true` if `x` is a palindrome after filtering out non-alphanumeric characters and ignoring cases, otherwise `false`.
"""
function isPalindrome(x::String)::Bool
    output = ""
    for c in x
        if isdigit(c) || isletter(c)
            output = output * lowercase(c) # * is string concatenation operator in Julia
        end
    end
    
    return output == reverse(output)
end