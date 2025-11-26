"""
    isPalindrome(x::String)::Bool

Determines if the given string `x` is a palindrome, considering only alphanumeric characters and ignoring cases.

# Arguments
- `x`: A string to be checked for palindrome property.

# Returns
- `true` if `x` is a palindrome after filtering out non-alphanumeric characters and ignoring cases, otherwise `false`.
"""
function isPalindrome(x::String)::Bool
    L, R = 1, length(x)
    while L < R
        while L < R && !(isletter(x[L]) || isdigit(x[L]))
            L += 1
        end
        while L < R && !(isletter(x[R]) || isdigit(x[R]))
            R -= 1
        end

        if lowercase(x[L]) != lowercase(x[R])
            return false
        end

        L += 1
        R -= 1
    end
    return true
end