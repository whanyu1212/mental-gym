# Arrays in Rust: from scratch

Index of what is built here, how it compares with the standard library, and what each operation costs. The explanation of each idea lives in the comment at the top of its source file. For the std functions themselves, see [`builtin_array_functions.md`](builtin_array_functions.md).

Run the tests from the repository root:

```sh
cargo test --locked --manifest-path src/dsa_from_scratch/Cargo.toml arrays
```

## What is here

| File | Built from scratch | Std equivalent | Difference to remember |
| --- | --- | --- | --- |
| `common_operations.rs` | initialize, random access, insert, remove, traverse, find, extend | `vec!`, `Vec::insert`, `Vec::remove`, `iter().position`, `Vec::resize` | Done on `Vec<i32>` with manual shifting. |
| `dynamic_array.rs` | `DynamicArray`: push, pop, insert, remove, get, set, shrink_to_fit | `Vec<T>` | Stores `i32` only and uses safe `Box<[i32]>`. `Vec` manages raw memory and is generic. |
| `array_stack.rs` | `ArrayStack` | `Vec` used with `push`/`pop` | Fixed capacity. `push` returns `Err(value)` when full. |
| `circular_buffer.rs` | `CircularBuffer`: a FIFO queue or a deque | `VecDeque<T>` | Same ring layout, but fixed capacity. `VecDeque` grows. |
| `matrix.rs` | `Matrix`: transpose, rotate, multiply | `Vec<Vec<T>>`, or the `ndarray` crate | One flat buffer, so rows sit next to each other in memory. |
| `algorithms.rs` | reverse, rotate, merge, bounds, binary search, Dutch flag | see below | Written by hand with explicit invariants. |

Std equivalents for `algorithms.rs`:

| Here | Std |
| --- | --- |
| `reverse` | `slice::reverse` |
| `rotate_left`, `rotate_right` | `slice::rotate_left`, `slice::rotate_right` |
| `lower_bound` | `slice::partition_point(\|&x\| x < target)` |
| `binary_search` | `slice::binary_search`, which returns `Result<usize, usize>` and may return any matching index |
| `merge_sorted` | none; the closest is concatenate and sort |
| `partition_three_way` | none in stable std |

## Cost of each operation

`n` is the current length, `k` the rotation amount, `m` the second input length.

| Operation | Time | Extra space | Note |
| --- | --- | --- | --- |
| index / `get` / `set` | O(1) | O(1) | |
| `push` (dynamic array) | O(1) amortized, O(n) when it grows | O(1) amortized | Capacity doubles, so copying averages out. |
| `pop` (any) | O(1) | O(1) | |
| `insert` / `remove` in the middle | O(n) | O(1) | Shifts the elements after the index. |
| `insert` / `remove` at the front | O(n) | O(1) | Worst case of the shifting. |
| `shrink_to_fit` | O(n) | O(n) during the copy | |
| stack `push` / `pop` / `peek` | O(1) | O(1) | |
| circular buffer, either end | O(1) | O(1) | Modulo wraps the index. |
| matrix `get` / `set` / `row` | O(1) | O(1) | `row` borrows a slice. |
| matrix `column` | O(rows) | O(rows) | Columns are not contiguous, so it copies. |
| matrix `transpose` / `rotate_clockwise` | O(rows * cols) | O(rows * cols) | Returns a new matrix. |
| matrix `multiply` | O(rows * cols * other.cols) | O(rows * other.cols) | |
| `reverse` / `rotate_*` | O(n) | O(1) | Three reversals, no extra buffer. |
| `merge_sorted` | O(n + m) | O(n + m) | |
| `lower_bound` / `upper_bound` / `binary_search` | O(log n) | O(1) | Input must be sorted. |
| `partition_three_way` | O(n) | O(1) | One pass, in place. |

## Design choices worth knowing

- **Panics vs `Option`.** Reads that may legitimately miss (`get`, `pop`, `find`) return `Option`. Writes with an invalid index (`set`, `insert`, `remove`) panic, like `Vec`.
- **Full containers return the value.** `ArrayStack::push` and `CircularBuffer::push_*` return `Err(value)`, so the caller keeps ownership of what did not fit.
- **Half-open ranges.** The binary search bounds use `[lo, hi)`, which avoids `usize` underflow at index 0 and makes empty input work with no special case.
- **`len` instead of a tail index.** The circular buffer tracks its length, so "full" and "empty" are never confused.
- **`i32` only.** Keeps the code easy to read. Making a structure generic over `T` is a good follow-up exercise.

## Not covered here

These are array-backed but belong in their own topic folders: sorting algorithms, heap, and Fenwick / segment trees. Sliding-window and prefix-sum patterns live in the `leetcode` crate.
