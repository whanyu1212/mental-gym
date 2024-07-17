"""
    isAnagram(s::String, t::String) -> Bool

Determines if two strings `s` and `t` are anagrams of each other.

# Arguments
- `s::String`: The first string.
- `t::String`: The second string.

# Returns
- `Bool`: `true` if `s` and `t` are anagrams, `false` otherwise.

# Example
```julia
isAnagram("listen", "silent") # returns true
isAnagram("hello", "world")   # returns false
```
"""

function isAnagram(s::String, t::String)::Bool
    s_dict = Dict{Char, Int}()
    t_dict = Dict{Char, Int}()

    for char in s
        s_dict[char] = get(s_dict, char, 0) + 1
    end

    for char in t
        t_dict[char] = get(t_dict, char, 0) + 1
    end

    return s_dict == t_dict
end