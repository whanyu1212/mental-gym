# Arrays in Python: from scratch

These files teach storage, shifting, growth, and multidimensional layout—not a
replacement for Python's built-in containers or NumPy.

## Start here

1. [common_operations.py](common_operations.py): manual fixed-capacity insertion
   and removal, plus basic access, search, traversal, and copying.
2. [dynamic_array.py](dynamic_array.py): size versus capacity, geometric growth,
   and manual shifting. No built-in list append/insert/pop does the work.
3. [matrix.py](matrix.py): row-major storage, coordinate transforms, and
   row/column dot products.

Run the tests from the repository root:

```sh
uv run --locked pytest tests/dsa_from_scratch/test_arrays.py tests/dsa_from_scratch/test_matrix.py
```

Tests import through `arrays.python` using the topic root on pytest's
`pythonpath`, avoiding the identically named hashing `common_operations.py`.

## Fixed capacity: size is not capacity

For `insert(buffer, value, index, size)` and `remove(buffer, index, size)`:

- `len(buffer)` is capacity, and `size` counts the live prefix.
- The caller maintains size; both functions return its new value.
- Unused slots contain `None`; removal clears the newly unused slot.
- Insertion into full storage raises `OverflowError`, never discards data.
- Invalid size raises `ValueError`; invalid index raises `IndexError`.
- Indices are nonnegative; insertion accepts `size` to insert at the end.

```python
from arrays.python.common_operations import initialize_array, insert, remove

buffer = initialize_array(3)         # [None, None, None]
size = 0
size = insert(buffer, 10, 0, size)   # [10, None, None], size = 1
size = insert(buffer, 20, 1, size)   # [10, 20, None], size = 2
size = remove(buffer, 0, size)      # [20, None, None], size = 1
```

For these examples in a standalone shell, set
`PYTHONPATH=src/dsa_from_scratch` before running Python.

The other helpers take ordinary lists of live values. Do not pass unused slots
to numeric traversal; `buffer[:size]` extracts the live values but makes a copy.
`extend(nums, enlarge)` returns a new list padded with zeros: it is a copying
demonstration, not Python's iterable-appending `list.extend` and not automatic
capacity management. `random_access` picks a random index (requires nonempty
input); array “random access” normally means O(1) access to any chosen index,
not random-number generation. Most legacy helpers print their demonstration;
insert/remove return size without printing.

## Dynamic array

```python
from arrays.python.dynamic_array import DynamicArray

items = DynamicArray[str]()
items.append("a")       # size 1, capacity 1
items.append("c")       # size 2, capacity 2
items.insert(1, "b")    # size 3, capacity 4
assert items.get(1) == "b"
items.set(1, "B")
assert items.remove(1) == "B"
assert items.pop() == "c"
assert len(items) == 1
assert items.capacity == 4
```

Capacity doubles when full; zero capacity grows to one. Copies across repeated
appends form a geometric series, so n appends take O(n) total time.
That means **amortized** O(1), not that every append takes constant time.

This class accepts arbitrary values, including `None`. Size determines which
slots are live, not the stored value. It intentionally omits negative indexing,
slicing, and automatic shrinking. Index errors (including empty pop) raise
`IndexError`. Pop/remove return the removed value and clear the vacated reference.

## Matrix: turning coordinates into array offsets

A matrix adds a different lesson from a dynamic array: **shape and layout**.
`Matrix` uses one flat list in row-major order. For an R-by-C matrix:

```text
[[1, 2, 3],       flat storage: [1, 2, 3, 4, 5, 6]
 [4, 5, 6]]      offset(row, col) = row * C + col

(1, 2) -> 1 * 3 + 2 = 5 -> value 6
```

Rows access adjacent slots; columns step by C slots. This introduces strides
and why traversal order matters in numerical computing. Python lists contain
object references, not packed numbers, so this is a layout demonstration—not
an assertion of NumPy-like performance or contiguous numeric payloads.

```python
from arrays.python.matrix import Matrix

matrix = Matrix.from_rows([[1, 2, 3], [4, 5, 6]])
assert matrix.get(1, 2) == 6
assert matrix.row(0) == [1, 2, 3]
assert matrix.column(1) == [2, 5]

transposed = matrix.transpose()         # [[1, 4], [2, 5], [3, 6]]
rotated = matrix.rotate_clockwise()     # [[4, 1], [5, 2], [6, 3]]
assert (transposed.rows, transposed.cols) == (3, 2)
assert rotated.row(0) == [4, 1]

product = matrix.multiply(transposed)   # [[14, 32], [32, 77]]
assert product.row(0) == [14, 32]
matrix.set(0, 0, 9)                    # Changes only matrix
```

The implementation makes each mapping explicit:

- **Transpose:** `(r, c)` becomes `(c, r)`.
- **Clockwise rotation:** `(r, c)` becomes `(c, R - 1 - r)`.
- **Multiplication:** R-by-K times K-by-C produces R-by-C. Each output cell is
  a dot product: `sum(left[r, k] * right[k, c])` over k. This is not elementwise
  multiplication; it is the basic operation behind many ML linear layers.

`Matrix(rows, cols, fill=0)` creates fixed-shape numeric storage. `from_rows`
copies rectangular nested lists. `row` and `column` return copies, and transforms
and multiplication return independent matrices—not NumPy-style views.
Dimensions are read-only properties; cell values can change through `set`.

Negative dimensions, ragged rows, and incompatible multiplication shapes raise
`ValueError`. Invalid coordinates raise `IndexError`; negative indexing and
slicing are deliberately omitted. Inputs are assumed to contain numbers.
Zero dimensions are supported: `from_rows([])` is 0-by-0, while `Matrix(0, 3)`
preserves a 0-by-3 shape. A product with zero inner dimension is zero-filled.

## Costs

Here n is logical size; C is capacity. In matrix rows below, R, K, and C are
positive matrix dimensions (C denotes columns, not capacity).

| Operation | Time | Extra space |
| --- | --- | --- |
| get / set / length / capacity | O(1) | O(1) |
| append | amortized O(1), worst-case O(n) | O(1), O(n) during growth |
| pop | O(1) | O(1) |
| insert | O(n) worst case | O(1), O(n) during dynamic growth |
| remove | O(n) worst case | O(1) |
| find / traverse | O(n) | O(1) |
| initialize capacity C | O(C) | O(C) |
| extend by k | O(n + k) | O(n + k) |
| matrix get / set | O(1) | O(1) |
| matrix row copy / column copy | O(C) / O(R) | O(C) / O(R) |
| matrix construction / transpose / rotation | O(RC) | O(RC) |
| matrix multiplication, R-by-K times K-by-C | O(RKC) | O(RC) |

Dynamic storage uses O(C) space. Growth temporarily holds both old and new
buffers. Pop/remove retain capacity, so storage need not be O(current size)
after many deletions. Matrix space costs include returned storage. A zero-inner-
dimension product still initializes its R-by-C output, taking O(RC) time.

## Python list versus array.array

- **list**: a dynamic array of object references; mixed types are allowed.
  Its growth is managed automatically. CPython's growth policy is not this
  example's simple doubling policy.
- **array.array**: a standard-library typed numeric array, with a type code and
  packed machine values rather than arbitrary object references. It also grows;
  “typed array” does not mean fixed capacity.
- **DynamicArray here**: uses a preallocated list as a teaching buffer. We manage
  logical size, growth, and shifts ourselves, but Python still manages the actual
  memory. This is not raw-memory allocation.

## Related topics (do not duplicate here)

- [Prefix sum pattern](../../../../notes/patterns/prefix_sum_pattern.md):
  1D, 2D, and 3D construction and range queries using inclusion–exclusion.

- [1D prefix sums](../../../leetcode/arrays_hashing/python/range_sum_query_immutable.py)
  and [2D prefix sums](../../../leetcode/arrays_hashing/python/range_query_sum_2d_immutable.py)
- [Array rotation](../../../leetcode/two_pointers/python/rotate_array.py)
  and [sorted-array merging](../../../leetcode/two_pointers/python/merge_sorted_array.py)
- [Two-pointer templates](../../two_pointers/python/two_pointer_patterns.py)
- [Sorting](../../sorting/python/)
- [Array-backed stack](../../list_adt/python/stack_array.py),
  [queue](../../list_adt/python/queue_array.py),
  and [deque](../../list_adt/python/deque_array.py)
- [Rust array implementations](../rust/README.md)
