# Rust built-ins for arrays, slices and Vecs

Cheat sheet mapping what `common_operations.rs` builds by hand to what the standard library already provides. Implement it yourself first, then use the built-in in real code.

## Types

| Type | Meaning |
| --- | --- |
| `[i32; N]` | fixed-size array, length is part of the type |
| `Vec<i32>` | owned, growable |
| `&[i32]` | read-only view (slice) |
| `&mut [i32]` | mutable view; can change elements, not length |

Most read/modify methods live on slices, so they work on arrays and `Vec`s alike. Only length-changing methods (`push`, `insert`, ...) are `Vec`-only.

## Create

```rust
let a = vec![0; 5];              // [0,0,0,0,0]   (your initialize_array)
let b = vec![1, 2, 3];
let c = [0; 5];                  // fixed array
let d: Vec<i32> = Vec::with_capacity(10); // empty, pre-allocated
let e: Vec<i32> = (1..=5).collect();      // [1,2,3,4,5]
```

## Length and access

| Call | Result |
| --- | --- |
| `v.len()`, `v.is_empty()` | size checks |
| `v[i]` | panics if out of bounds |
| `v.get(i)` | `Option<&T>`, safe |
| `v.first()`, `v.last()` | `Option<&T>` |
| `v.get(a..b)` | `Option<&[T]>` sub-slice |
| `&v[a..b]` | sub-slice, panics if invalid |

## Add and remove (Vec only)

| Call | Notes |
| --- | --- |
| `v.push(x)` / `v.pop()` | end; `pop` returns `Option<T>` |
| `v.insert(i, x)` | O(n) shift (your `insert`) |
| `v.remove(i)` | O(n) shift, returns the value (your `remove`) |
| `v.swap_remove(i)` | O(1), but does not keep order |
| `v.truncate(n)` / `v.clear()` | shrink |
| `v.resize(n, x)` | grow or shrink, filling with `x` (your `extend`) |
| `v.extend_from_slice(&other)` | append a slice |
| `v.append(&mut other)` | move everything out of `other` |
| `v.drain(a..b)` | remove a range, yields the removed items |
| `v.retain(\|&x\| x > 0)` | keep only matching elements |
| `v.dedup()` | drop consecutive duplicates |

## Search

| Call | Notes |
| --- | --- |
| `v.contains(&x)` | bool |
| `v.iter().position(\|&n\| n == x)` | `Option<usize>` (your `find`) |
| `v.iter().rposition(...)` | last match |
| `v.binary_search(&x)` | sorted input only; `Ok(i)` or `Err(insert_pos)` |
| `v.iter().any(...)` / `.all(...)` | predicates |

## Order and rearrange (work in place on slices)

```rust
v.sort();                        // ascending
v.sort_unstable();               // faster, equal items may reorder
v.sort_by(|a, b| b.cmp(a));      // descending
v.sort_by_key(|x| x.abs());
v.reverse();
v.swap(i, j);
v.rotate_left(k);
v.fill(0);
```

Floats do not implement `Ord`; use `sort_by(|a, b| a.partial_cmp(b).unwrap())`.

## Iterate

```rust
for x in &v { }                  // borrow, read
for x in &mut v { *x += 1; }     // borrow, modify
for x in v { }                   // consumes v
for (i, x) in v.iter().enumerate() { }
for w in v.windows(3) { }        // overlapping slices of size 3
for c in v.chunks(3) { }         // non-overlapping slices
for (a, b) in v.iter().zip(&w) { }
```

## Aggregates

```rust
v.iter().sum::<i32>();
v.iter().product::<i32>();
v.iter().max();                  // Option<&i32>
v.iter().min();
v.iter().copied().max_by_key(|x| x.abs());
v.iter().filter(|&&x| x > 0).count();
```

`max`/`min` return `None` for an empty slice, so handle that.

## Copy and convert

```rust
let owned = slice.to_vec();      // &[T] -> Vec<T>  (your `extend` starts this way)
let cloned = v.clone();
let s: &[i32] = &v;              // Vec -> slice (deref)
let joined = [a, b].concat();    // Vec<Vec<T>> or [[T]] -> Vec<T>
v.copy_from_slice(&other);       // same length required
let (left, right) = v.split_at(mid);
```

## Gotchas

- `v[i]` panics; prefer `get(i)` when the index is not guaranteed.
- Indexes are `usize`. An index that goes negative underflows and panics in debug builds, so use `checked_sub`.
- `iter()` yields `&T`. Use `.copied()` or `.cloned()` to get values, or pattern-match with `|&x|`.
- You cannot hold a borrow (`&v[0]`) while mutating the Vec (`v.push(..)`). The borrow checker rejects it.
- Removing or inserting in the middle is O(n). `swap_remove` and `push`/`pop` at the end are O(1).

## Docs

- Slice methods: <https://doc.rust-lang.org/std/primitive.slice.html>
- Vec methods: <https://doc.rust-lang.org/std/vec/struct.Vec.html>
- Iterator methods: <https://doc.rust-lang.org/std/iter/trait.Iterator.html>
