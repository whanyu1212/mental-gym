"""
    function_name(arg1::Type1, arg2::Type2; kwarg1::Type3=default_value) -> ReturnType

Brief summary of what the function does (one sentence).

More detailed explanation of the function's behavior, algorithms, or purpose.
This can span multiple paragraphs.

# Arguments
- `arg1::Type1`: Description of the first positional argument.
- `arg2::Type2`: Description of the second positional argument.

# Keywords
- `kwarg1::Type3`: Description of the keyword argument. Default: `default_value`.

# Returns
- `ReturnType`: Description of the value returned by the function. Specify if it can return `nothing` or other types via `Union`.

# Throws
- `ArgumentError`: Description of when an invalid argument is provided. (Optional)
- `DomainError`: Description of when an argument is outside the valid domain. (Optional)
- `OtherException`: Description of other specific exceptions thrown. (Optional)

# Examples
```julia
# Example 1: Basic usage
result1 = function_name(some_value1, some_value2)

# Example 2: With keyword arguments
result2 = function_name(some_value1, some_value2; kwarg1=another_value)

"""