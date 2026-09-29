---
title: Python Essentials
slug: python-essentials
description: The functions, collections, iteration, mutation, typing, and error-handling habits needed to begin solving problems in Python.
category: Languages
order: -7
status: stable
kind: concept
tags:
  - python
  - foundations
---

# Python Essentials

Python code usually reads best when data moves through small functions and loops
name the decision being made. The important hidden detail is that names refer to
objects. Two names can refer to the same mutable object, so a change through one
name can be visible through the other.

Each example before **Practice** is standalone on Python 3.10 or newer. Save one
in a scratch `.py` file and run it with `uv run python <file>` from the root.

## Functions and control flow

`def` creates a function. Indentation defines its body, and `return` sends a
value back to the caller. An `if` chooses a branch; a `for` loop consumes values
from any iterable. `continue` skips to the next value, while `break` stops the
nearest loop.

```python
def summarize(values: list[int], minimum: int = 0) -> dict[str, int]:
    total = 0
    accepted = 0
    for value in values:
        if value < minimum:
            continue
        total += value
        accepted += 1
    return {"count": accepted, "total": total}


assert summarize([3, -2, 5], minimum=0) == {"count": 2, "total": 8}
assert summarize([], minimum=10) == {"count": 0, "total": 0}
```

The annotations document expected inputs and help type checkers and editors.
Python itself does not enforce them at runtime. Defaults are evaluated once,
when the function is defined. Use an immutable default such as `None` when each
call needs a fresh mutable value:

```python
def add_label(label: str, labels: list[str] | None = None) -> list[str]:
    if labels is None:
        labels = []
    labels.append(label)
    return labels

assert add_label("new") == ["new"]
assert add_label("separate") == ["separate"]
shared: list[str] = []
assert add_label("a", shared) is shared
assert shared == ["a"]
```

Avoid `labels=[]` as the default: every call that omits it would reuse the same
list.

For scalar decisions, `/` always produces floating-point division while `//`
uses floor division. Zero, `None`, and empty collections are false in a Boolean
context. Use `==` to compare values and `is` for identity, especially `is None`.

## Collections and indexing

The four everyday collection types have different jobs:

- `list`: ordered, mutable sequence; duplicates allowed.
- `tuple`: ordered, immutable sequence; useful for fixed records and hashable
  compound keys when its elements are hashable.
- `dict`: mapping from unique hashable keys to values.
- `set`: unique hashable values with fast average-case membership checks.

Sequences use zero-based indices. A slice includes its start and excludes its
stop, and a negative index counts from the end.

```python
numbers = [10, 20, 30, 40]
point = (3, 4)
attempts = {"ana": 2, "bo": 1}
visited = {"start", "finish"}
assert numbers[0] == 10
assert numbers[-1] == 40
assert numbers[1:3] == [20, 30]
assert point[1] == 4
assert attempts["ana"] == 2
assert "start" in visited
attempts["cy"] = attempts.get("cy", 0) + 1
assert attempts["cy"] == 1
```

An invalid list index raises `IndexError`; a missing direct dictionary lookup
raises `KeyError`. Use `mapping.get(key, default)` only when a missing key is an
expected case.

## Mutation, assignment, and copies

Assignment binds another name; it does not copy the object. Lists, dictionaries,
and sets are mutable. Numbers, strings, and tuples are immutable.

```python
original = [3, 1, 2]
alias = original
alias.sort()
assert original == [1, 2, 3]
assert alias is original
independent = original.copy()
independent.append(4)
assert original == [1, 2, 3]
assert independent == [1, 2, 3, 4]
matrix = [[0], [1]]
shallow = matrix.copy()
shallow[0].append(9)
assert matrix == [[0, 9], [1]]
```

`list.copy()` copies the outer list, but nested mutable objects are still shared.
Build fresh inner objects or use `copy.deepcopy` only when a true recursive copy
matches the data's meaning. A function receives references to the same objects,
so mutating a list argument is visible to its caller; rebinding the local
parameter is not.

## Comprehensions and iteration

A comprehension builds a collection from an iterable. Keep it to one readable
transformation and, at most, a simple filter. Use a normal loop when the logic
needs several branches or side effects.

```python
values = [1, 2, 3, 4]
squares = [value * value for value in values]
even_squares = {value: value * value for value in values if value % 2 == 0}
remainders = {value % 3 for value in values}
assert squares == [1, 4, 9, 16]
assert even_squares == {2: 4, 4: 16}
assert remainders == {0, 1, 2}
```

Prefer direct iteration to manual indexing. Use `enumerate` when position
matters, `zip` for aligned inputs, and `.items()` for dictionary key-value pairs.

```python
letters = ["a", "b", "c"]
positions: list[tuple[int, str]] = []
for index, letter in enumerate(letters):
    positions.append((index, letter))

assert positions == [(0, "a"), (1, "b"), (2, "c")]
assert list(zip(["x", "y"], [10, 20])) == [("x", 10), ("y", 20)]
```

An iterable can produce an iterator. Calling `next()` advances the iterator and
eventually raises `StopIteration`; a `for` loop handles that signal for you.
Generator expressions produce values lazily instead of first building a list.

```python
iterator = iter([10, 20])
assert next(iterator) == 10
assert next(iterator) == 20
exhausted = False
try:
    next(iterator)
except StopIteration:
    exhausted = True

assert exhausted
assert sum(value * value for value in range(5)) == 30
```

Iterators are consumed as they are read. Create a new iterator or materialize it
with `list(...)` when you genuinely need multiple passes.

## Errors are part of the function contract

Raise an exception when a function cannot produce a meaningful result. Catch
only errors that you can handle locally, and catch the specific type. Preserve
the original cause when adding context.

```python
def parse_age(text: str) -> int:
    try:
        age = int(text)
    except ValueError as error:
        raise ValueError(f"invalid age: {text!r}") from error

    if age < 0:
        raise ValueError("age must be non-negative")
    return age


assert parse_age("42") == 42

caught = False
try:
    parse_age("old")
except ValueError as error:
    caught = "invalid age" in str(error)

assert caught
```

Do not use a broad `except Exception` merely to continue: it can hide programming
errors such as a misspelled variable or an invalid assumption.

## Practice

1. Write `positions_of_even(values)` with `enumerate` and a list comprehension.
   It should return the zero-based positions of even values.
2. Write `group_lengths(words)` returning a dictionary whose keys are word
   lengths and whose values are lists of words. Make sure each key gets its own
   list.
3. Write `first_positive(values)` returning the first positive number, or
   `None` if no positive value exists. Then call it twice on the same iterator
   and explain the second result.

Use these checks when your implementations are ready:

```python
assert positions_of_even([7, 4, 8, 3]) == [1, 2]
assert group_lengths(["a", "to", "be"]) == {1: ["a"], 2: ["to", "be"]}
assert first_positive([-2, 0, 5, 7]) == 5

stream = iter([-1, 3, 8])
assert first_positive(stream) == 3
assert first_positive(stream) == 8
```

If a check fails, print the actual value and inspect the first mismatch. For the
grouping exercise, watch for accidental aliasing between buckets. For the
iterator exercise, remember that the first call has already consumed values.

Continue with the [Python learning track](../../learn/python/). While solving
DSA problems, keep the [Python DSA Quick Reference](../python-dsa-toolkit/) open
for collection choices and standard-library helpers.

## Official references

- [Python tutorial: control flow and functions](https://docs.python.org/3/tutorial/controlflow.html)
- [Python tutorial: data structures and comprehensions](https://docs.python.org/3/tutorial/datastructures.html)
- [Python tutorial: errors and exceptions](https://docs.python.org/3/tutorial/errors.html)
- [Python `typing` documentation](https://docs.python.org/3/library/typing.html)
