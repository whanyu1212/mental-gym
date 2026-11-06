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

## Properties: expose state without exposing its calculation

`@property` lets callers read a method's result using attribute syntax. It
hides how a value is obtained behind a stable interface: **encapsulation, not
secrecy**. The source is still visible; callers simply do not need to depend
on its implementation.

For example, our dynamic array exposes capacity as derived state:

```python
class CapacityExample:
    def __init__(self, capacity: int) -> None:
        self._data: list[object] = [None] * capacity

    @property
    def capacity(self) -> int:
        return len(self._data)

array = CapacityExample(5)
assert array.capacity == 5  # Attribute access calls the getter.

try:
    array.capacity = 100  # No setter: assignment raises AttributeError.
except AttributeError:
    pass
else:
    raise AssertionError("capacity should be read-only")
```

The caller asks “what is the capacity?” without knowing whether it is stored
or calculated. Deriving it from the backing storage avoids maintaining two
values that might disagree after a resize. With no setter, callers cannot
assign a misleading capacity through the public interface. This is not total
mutation protection: `_data` remains accessible, but the underscore marks it
as an implementation detail.

### Validating assignment with a setter

A setter is useful when assignment is natural but must preserve an invariant:

```python
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius  # Uses the setter, including its validation.

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value  # Separate backing attribute avoids recursion.

temperature = Temperature(20)
temperature.celsius = 25
assert temperature.celsius == 25

try:
    temperature.celsius = -300
except ValueError:
    pass
else:
    raise AssertionError("Invalid temperature should be rejected")
assert temperature.celsius == 25
```

### When to use which interface

| Interface | Use it for | Example |
| --- | --- | --- |
| Ordinary attribute | Plain data with no special behavior | `user.name` |
| Property | Cheap derived state or controlled access | `array.capacity` |
| Method | Actions, expensive work, I/O, or operations needing arguments | `array.append(value)`, `account.fetch_transactions()` |

Do not wrap every attribute in a getter and setter without a reason. Avoid
hiding network requests, database queries, or surprising mutations behind
attribute reads: the syntax suggests cheap, unsurprising access.

**A property does not cache its result.** Its getter runs on every access.
For container size, prefer Python's existing `len(array)` protocol via
`__len__`; capacity is a separate concept that fits a property.

## Other common decorators

A decorator wraps, modifies, or registers a function or class. For a single
function decorator, `@decorate` above `def function(...)` roughly means
`function = decorate(function)` after the definition. Some decorators take
configuration first, such as `@lru_cache(maxsize=128)`.

### `@classmethod` and `@staticmethod`

An ordinary method receives the instance as `self`. A class method receives
the class as `cls`; a static method receives neither automatically.

```python
class User:
    def __init__(self, name: str) -> None:
        self.name = name

    @classmethod
    def from_dict(cls, data: dict[str, str]) -> "User":
        return cls(data["name"])

    @staticmethod
    def normalize_name(name: str) -> str:
        return name.strip()

user = User.from_dict({"name": "Alice"})
assert user.name == "Alice"
assert User.normalize_name(" Alice ") == "Alice"
```

- **Class method:** useful for alternative constructors such as `from_dict`
  or `from_config`. Calling `cls(...)` rather than hard-coding `User(...)`
  allows a subclass with a compatible constructor to inherit this behavior
  and produce its own instances.
- **Static method:** useful for a related utility needing no instance or class
  state. A module-level function is often equally good; do not create a class
  just to hold static methods.

### `@dataclass`: structured data without boilerplate

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

point = Point(2.0, 3.0)
assert point == Point(2.0, 3.0)
assert repr(point) == "Point(x=2.0, y=3.0)"
```

Dataclasses generate methods such as `__init__`, `__repr__`, and `__eq__`.
Use them for configuration objects, structured results, and domain records.
They do not validate field types at runtime. `@dataclass(frozen=True)` blocks
ordinary field reassignment, but does not freeze nested mutable objects.
For per-instance mutable defaults, use `field(default_factory=list)` rather
than sharing a single list.

### `@cache` and `@lru_cache`: reuse function results

```python
from functools import cache, lru_cache

@cache
def fibonacci(n: int) -> int:
    # Assumes n is a nonnegative integer.
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

@lru_cache(maxsize=128)
def parse_fields(header: str) -> tuple[str, ...]:
    return tuple(field.strip() for field in header.split(","))

assert fibonacci(10) == 55
assert parse_fields("name, age") == ("name", "age")
assert parse_fields("name, age") == ("name", "age")  # Cached result.
assert parse_fields.cache_info().hits == 1
```

Use caching for memoized recursion or repeated deterministic computations.
`@cache` is unbounded; `@lru_cache` limits the number of entries and evicts the
least recently used. Arguments must be hashable, so lists and dictionaries
cannot be passed directly as cache keys.

Caches retain arguments and results. Avoid caching functions whose purpose is
side effects, whose results must reflect changing external state, or whose
callers need a fresh mutable result. Use `.cache_clear()` to explicitly clear
a cache; neither decorator provides automatic time-based expiry.

### `@cached_property`: compute once per instance

```python
from functools import cached_property

class Dataset:
    def __init__(self, values: tuple[float, ...]) -> None:
        self.values = values

    @cached_property
    def mean(self) -> float:
        # Assumes a non-empty dataset.
        return sum(self.values) / len(self.values)

dataset = Dataset((1.0, 2.0, 3.0))
assert dataset.mean == 2.0  # Calculates and stores the result.
assert dataset.mean == 2.0  # Reads the stored result.
dataset.values = (10.0, 20.0)
assert dataset.mean == 2.0  # Changing inputs does not invalidate it.
del dataset.mean
assert dataset.mean == 15.0  # Recomputes after explicit invalidation.
```

Use this for expensive derived state on mostly immutable objects. Unlike
`@property`, it caches the value and normally allows assignment to the cached
attribute. It requires an instance with a writable `__dict__`, so it does not
work with ordinary slots-only classes.

Our dynamic array's capacity should use **`@property`**, not
`@cached_property`: capacity changes during growth, and calculating it is cheap.

### `@wraps`: preserve metadata in custom decorators

```python
from functools import wraps

def log_call(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        print(f"Calling {function.__name__}")
        return function(*args, **kwargs)
    return wrapper

@log_call
def greet(name: str) -> str:
    """Return a greeting."""
    return f"Hello, {name}"

assert greet("Alice") == "Hello, Alice"
assert greet.__name__ == "greet"
assert greet.__doc__ == "Return a greeting."
```

Use `@wraps` when building logging, timing, retry, or authorization decorators.
It preserves metadata such as the original name and docstring and exposes the
wrapped function through `__wrapped__`. It does not itself implement logging
or preserve the wrapper's static typing; this example omits wrapper annotations
for clarity.

### Other decorators you will encounter

| Decorator | Engineering use case | Important detail |
| --- | --- | --- |
| `@contextlib.contextmanager` | Implement resource setup and cleanup for a `with` block | Yield once; put cleanup in `finally` so exceptions also trigger it |
| `@abc.abstractmethod` | Require subclasses to implement an interface | Use with `ABC` or `ABCMeta`; incomplete concrete subclasses cannot be instantiated |
| `@pytest.fixture` | Reuse test dependencies, setup, and cleanup | Tests request fixtures by parameter name; yield fixtures support teardown |
| `@pytest.mark.parametrize` | Run a test against several input cases | Each parameter set becomes a separate test case |
| `@app.get("/users")` | Register an HTTP GET handler in frameworks such as FastAPI | Framework-specific registration, not a Python built-in |

For this repository, prioritize class methods, static methods, dataclasses,
and caching. The array tests already demonstrate `pytest.mark.parametrize`.

## Typing reusable code: `TypeVar`, `Generic`, and `cast`

These tools help editors and type checkers such as mypy and Pyright. They do
not enforce types at runtime. You can write plenty of Python without them;
they become useful when building reusable infrastructure or integrating dynamic
code with typed code.

| Tool | Mental model | Engineering use cases |
| --- | --- | --- |
| `TypeVar` | Connect input and output types | Collection helpers, retry wrappers, factories |
| `Generic` | Give a class a type parameter | Caches, repositories, queues, paginated responses |
| `cast` | Ask the checker to trust a type claim | Dynamic registries, gaps in third-party typing |

### `TypeVar`: preserve a type relationship

A type variable is a placeholder for a type, not an ordinary runtime value.
Here, the return type follows the input element type:

```python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

name = first(["Alice", "Bob"])  # checker infers str
count = first([10, 20])        # checker infers int
assert name.upper() == "ALICE"
assert count + 1 == 11
# count.upper() would be a type-checking error (and fail at runtime).
```

This helper requires a non-empty list. With `list[Any] -> Any` instead, the
checker loses the input/output relationship and would allow `count.upper()`.
`Any` effectively opts out of checking; `TypeVar` preserves information.

In engineering code, a retry helper can similarly accept `Callable[[], T]`
and return `T`: retrying a function that returns `User` still produces `User`,
without writing a separate retry helper for each result type.

### `Generic`: choose the type a container holds

`Generic[T]` lets the caller specialize a reusable class, just as `list[int]`
specializes a list:

```python
from typing import Generic, TypeVar

T = TypeVar("T")

class Cache(Generic[T]):
    def __init__(self) -> None:
        self._data: dict[str, T] = {}

    def put(self, key: str, value: T) -> None:
        self._data[key] = value

    def get(self, key: str) -> T | None:
        return self._data.get(key)

counts = Cache[int]()
counts.put("active_users", 42)
count = counts.get("active_users")  # int | None
assert count == 42
assert counts.get("missing") is None
# counts.put("active_users", "forty-two") would be a checker error.
```

The same implementation could serve as `Cache[User]`. Other common examples
are `Repository[Order]`, `Queue[EmailJob]`, and `Page[Product]`. The type
parameter connects methods and stored values across the class. It does not
prevent incorrectly typed values from being inserted if you ignore the checker.

### `cast`: a claim, not a conversion or validation

Use `cast(TargetType, value)` when you have evidence about a type that the
checker cannot infer. It returns the original object unchanged.

A dependency-injection registry may store several kinds of service as `object`:

```python
from typing import cast

class Mailer:
    def send(self, message: str) -> str:
        return f"Sent: {message}"

services: dict[str, object] = {"mailer": Mailer()}

# Application setup establishes that this key contains a Mailer.
mailer = cast(Mailer, services["mailer"])
assert mailer.send("Hello") == "Sent: Hello"
assert mailer is services["mailer"]

value = cast(int, "123")  # checker sees int; runtime value is still str
assert isinstance(value, str)
assert int("123") == 123  # int(), unlike cast(), actually converts
```

If the registry can contain an unexpected value, check it instead. An
`isinstance(value, Mailer)` check both validates the runtime type and lets the
checker narrow the type within the matching branch.

Likewise, `cast(UserPayload, response.json())` does **not** check JSON fields.
Validate external data with explicit checks or a schema library such as
Pydantic. Do not use a cast merely to silence an error you have not understood.

### When to reach for these

- Start with concrete types such as `str`, `User`, or `list[int]`.
- Use `TypeVar` when reusable code must preserve a type relationship.
- Use `Generic` when that relationship spans a class's state and methods.
- Use `cast` sparingly, when you can explain why the type claim is safe.

Python 3.12+ also supports type-parameter syntax: `def first[T](...)` and
`class Cache[T]:`. This often replaces explicit `TypeVar` and `Generic`
declarations; the concepts are unchanged. The examples above use the older,
still-supported syntax to remain compatible with Python 3.10+.

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
