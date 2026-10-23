---
title: Julia Essentials
slug: julia-essentials
description: The functions, arrays, indexing, mutation, broadcasting, dispatch, iteration, and error-handling habits needed to begin solving problems in Julia.
category: Languages
order: -5
status: stable
kind: concept
tags:
  - julia
  - foundations
---

# Julia Essentials

Julia code often centers on generic functions that work across useful types.
Arrays are passed by sharing, loops are idiomatic, and dispatch can select a
method from the types of all a function's arguments.

Each example before **Practice** is standalone and uses Base or the standard
library. Run one from the repository root with `julia --project=. <file>`.

## Functions and control flow

A multi-line function ends with `end`. Julia returns the last evaluated
expression, but an explicit `return` is useful when it makes the exit clear.
`if` conditions must be `Bool`; integers do not stand in for true or false.

```julia
function summarize(values; minimum=0)
    total = 0
    accepted = 0
    for value in values
        if value < minimum
            continue
        end
        total += value
        accepted += 1
    end
    return (count=accepted, total=total)
end
@assert summarize([3, -2, 5]; minimum=0) == (count=2, total=8)
```

The semicolon separates keyword arguments at the call site. Short functions can
use assignment form, such as `square(x) = x * x`.

## Collections, one-based indexing, and ranges

Everyday collection choices include `Vector` for an ordered mutable sequence,
`Tuple` for a fixed immutable record, `Dict` for key-value lookup, and `Set` for
unique values. Ordinary Julia arrays use one-based indices. Range endpoints are
inclusive, so `2:3` contains both 2 and 3.

```julia
numbers = [10, 20, 30, 40]
attempts = Dict("ana" => 2, "bo" => 1)
visited = Set(["start", "finish"])
@assert numbers[1] == 10
@assert numbers[end] == 40
@assert numbers[2:3] == [20, 30]
@assert attempts["ana"] == 2
@assert "start" in visited
attempts["cy"] = get(attempts, "cy", 0) + 1
@assert attempts["cy"] == 1
@assert [n^2 for n in numbers if n >= 30] == [900, 1600]
```

An invalid array index raises `BoundsError`; a missing direct dictionary lookup
raises `KeyError`. `get(mapping, key, default)` makes an expected missing key
explicit.

## UTF-8 strings are not arrays of characters

Strings are iterable sequences of characters, but their indices address UTF-8
code-unit positions. One character can occupy several bytes, so not every number
between `1` and `lastindex(text)` is a valid character index. Iterate directly
when you need characters, or use `eachindex` when you also need valid indices.

```julia
text = "éx"
@assert length(text) == 2
@assert collect(text) == ['é', 'x']
@assert collect(eachindex(text)) == [1, 3]
invalid_index_caught = try
    text[2]
    false
catch error
    error isa StringIndexError
end
@assert invalid_index_caught
```

Do not loop over `1:length(text)` and index the string. Direct iteration also
expresses the intent more clearly.

## Mutation, aliasing, copies, and views

Assignment creates another binding to the same array. Mutation through either
binding is visible through both. By convention, a function ending in `!` mutates
at least one argument; the punctuation is a warning, not enforcement by the
language.

```julia
original = [3, 1, 2]
alias = original
sort!(alias)
@assert original == [1, 2, 3]
@assert alias === original
independent = copy(original)
push!(independent, 4)
@assert original == [1, 2, 3]
@assert independent == [1, 2, 3, 4]
# An ordinary slice copies; a view shares the parent's storage.
values = [10, 20, 30]
copied_slice = values[1:2]
copied_slice[1] = 99
@assert values == [10, 20, 30]
shared_view = @view values[1:2]
shared_view[1] = 99
@assert values == [99, 20, 30]
```

`copy` and an ordinary slice are shallow: nested mutable elements can still be
shared.

## Broadcasting applies scalar work element by element

Add a dot to a function call or operator to broadcast it over arrays. Dotted
expressions fuse, and dotted assignment writes into its destination.

```julia
square(x) = x * x
values = [1, 2, 3]
@assert square.(values) == [1, 4, 9]
@assert values .+ 10 == [11, 12, 13]
doubled = copy(values)
doubled .*= 2
@assert doubled == [2, 4, 6]
@assert values == [1, 2, 3]
```

Use a normal loop when it is clearer. Julia does not require vectorized syntax
for ordinary loops to be fast.

## Multiple dispatch

One function can have several methods. Julia selects the most specific applicable
method from the types of all arguments, not only the first one.

```julia
combine(x::Number, y::Number) = x + y
combine(x::AbstractString, y::AbstractString) = x * y
@assert combine(2, 3.5) == 5.5
@assert combine("mental", " gym") == "mental gym"
```

Type annotations on method arguments participate in dispatch. Add them when
they define real behavior, not merely to imitate a static type declaration. A
call with no applicable method raises `MethodError`.

## Iteration and `nothing`

Iterate directly over values when you only need values. For array positions,
`eachindex` respects the collection's valid indices. Generators are lazy and
feed reductions without first allocating an array.

```julia
values = [4, 7, 9]
seen = Pair{Int,Int}[]
for index in eachindex(values)
    push!(seen, index => values[index])
end
@assert seen == [1 => 4, 2 => 7, 3 => 9]
@assert sum(value for value in values if isodd(value)) == 16
```

`nothing` is a singleton used by convention when no useful value is returned;
some searches also use it for “not found.” Test identity with `===`.

```julia
function index_of_even(values)::Union{Int,Nothing}
    return findfirst(iseven, values)
end
@assert index_of_even([1, 4, 7]) == 2
@assert index_of_even([1, 3, 7]) === nothing
```

## Errors are part of the function contract

Use `throw(ArgumentError(...))` when an argument violates its contract. Catch a
specific error only when you can recover; unexpected errors should keep their
stack trace.

```julia
using Test

function mean_nonempty(values)
    isempty(values) && throw(ArgumentError("values must not be empty"))
    return sum(values) / length(values)
end
@assert mean_nonempty([2, 4, 6]) == 4
@test_throws ArgumentError mean_nonempty(Int[])
```

For automated tests, `using Test` provides `@test`, `@testset`, and
`@test_throws`.

## Practice

1. Write `positions_of_even(values)` using `eachindex` and a comprehension. It
   should return Julia's one-based positions.
2. Write mutating `clamp_negatives!(values)` and non-mutating
   `clamp_negatives(values)`. The second must leave its input unchanged.
3. Define `join_value(x, y)` methods that add two numbers and join two strings
   with `":"`. Let unsupported mixed inputs raise `MethodError`.

Use these checks when your implementations are ready:

```julia
using Test
@assert positions_of_even([7, 4, 8, 3]) == [2, 3]
source = [-2, 3, -1]
@assert clamp_negatives(source) == [0, 3, 0]
@assert source == [-2, 3, -1]
@assert clamp_negatives!(source) === source
@assert source == [0, 3, 0]
@assert join_value(2, 3.5) == 5.5
@assert join_value("mental", "gym") == "mental:gym"
@test_throws MethodError join_value(1, "one")
```

If a check fails, inspect whether you used `values[...]` or `.=` to mutate the
same array, whether an ordinary slice accidentally made a copy, and which method
signatures `methods(join_value)` reports.

Continue with the [Julia learning track](../../learn/julia/), then compare these
ideas with the repository's Julia algorithm ports from its practice pages.

## Official references

- [Julia functions and argument passing](https://docs.julialang.org/en/v1/manual/functions/)
- [Julia arrays and views](https://docs.julialang.org/en/v1/manual/arrays/)
- [Julia strings and valid UTF-8 indices](https://docs.julialang.org/en/v1/manual/strings/)
- [Julia methods and multiple dispatch](https://docs.julialang.org/en/v1/manual/methods/)
- [Julia control flow and exceptions](https://docs.julialang.org/en/v1/manual/control-flow/)
- [Noteworthy differences from Python](https://docs.julialang.org/en/v1/manual/noteworthy-differences/)
