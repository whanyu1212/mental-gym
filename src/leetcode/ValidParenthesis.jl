function isValid(s::String)::Bool
    parenthesis = Dict{Char, Char}('(' => ')', '[' => ']', '{' => '}')
    stack = Char[]
    
    if length(s) == 1
        return false
    end

    for c in s
        # if c is an opening parenthesis
        if c in keys(parenthesis)
            push!(stack, c)
        else
            # if c is a closing parenthesis,
            # check if it matches the last opening parenthesis
            try
                last_left = pop!(stack)
                if parenthesis[last_left] != c
                    return false
                end
            catch
                return false
            end
        end
    end
    
    return isempty(stack)
end
            