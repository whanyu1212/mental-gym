# Hashing in Rust: from scratch

Index of what is built here, how it compares with the standard library, and what each operation costs. The explanation of each idea lives in the comment at the top of its source file. For the std types themselves, see [`builtin_hash_functions.md`](builtin_hash_functions.md).

Run the tests from the repository root:

```sh
cargo test --locked --manifest-path src/dsa_from_scratch/Cargo.toml hash_map
```

## The progression

Each file fixes the limitation of the one before it. Read them in this order.

| Step | File | Idea | Limitation it runs into |
| --- | --- | --- | --- |
| 1 | `direct_address_table.rs` | The key is the array index. | Memory is O(key range); keys must be small, dense, non-negative integers. |
| 2 | `hash_functions.rs` | Compress any key into `0..capacity` with a hash. | Different keys can now map to the same index (a collision). |
| 3 | `array_hash_map.rs` | One pair per bucket, ignoring collisions. | Colliding keys evict each other, and the data is lost. |
| 4 | `separate_chaining.rs` | Each bucket holds a list of the pairs that share it. | Extra allocation per bucket; chains can grow long. |
| 5 | `open_addressing.rs` | Store pairs in the slot array and probe for a free slot. | Deletion needs tombstones; clustering slows probing. |
| 6 | `hash_set.rs` | A map that keeps only the keys. | |

## What is here

| File | Built from scratch | Std equivalent | Difference to remember |
| --- | --- | --- | --- |
| `hash_functions.rs` | `mod_hash`, `hash_uppercase`, `polynomial_hash`, `fnv1a_64`, `multiplicative_hash` | `Hash` trait, `DefaultHasher` (SipHash) | Std hashes any `Hash` type with a randomized, attack-resistant hasher. These are fixed and predictable. |
| `direct_address_table.rs` | `DirectAddressTable` | `Vec<Option<V>>` | Same thing; std has no dedicated type. |
| `array_hash_map.rs` | `ArrayHashMap` (100 buckets, no collision handling) | none | A teaching version. `put` returns the displaced pair so you can see the loss. |
| `separate_chaining.rs` | `HashMapChaining` | none (std is open addressing) | Buckets are `Vec`s; resize at load factor 2/3. |
| `open_addressing.rs` | `HashMapOpenAddressing` with `Probing::{Linear, Quadratic, DoubleHashing}` | `HashMap` (SwissTable, via `hashbrown`) | Same family. Std probes groups of slots with SIMD and allows a load factor up to 7/8. |
| `hash_set.rs` | `HashSet`: insert, contains, remove, union, intersection, difference | `HashSet<T>` | Built on `HashMapChaining`. Std set operations return lazy iterators. |

Both map types mirror `std::HashMap`'s API where it matters: `put` returns `Option<i32>` (the old value, like `insert`), `get` and `remove` return `Option`, and `remove` returns the removed value.

## Cost of each operation

`n` is the number of stored pairs (`m` the size of a second set), and `L` is the key length.

| Operation | Average | Worst case | Note |
| --- | --- | --- | --- |
| `mod_hash` | O(1) | O(1) | |
| `hash_uppercase`, `polynomial_hash`, `fnv1a_64` | O(L) | O(L) | Reads every byte. |
| direct address table, any operation | O(1) | O(1) | `len` is O(size) because nothing tracks the count. |
| array hash map, any operation | O(1) | O(1) | Wrong under collisions, since it loses data. |
| chaining `get` / `put` / `remove` | O(1) | O(n) | Worst case: every key lands in one bucket. |
| chaining `put` including resizes | O(1) amortized | O(n) on the resizing call | Capacity doubles, the same argument as the dynamic array. |
| open addressing `get` / `put` / `remove` | O(1) | O(n) | Depends on the load factor staying at or below 2/3. |
| open addressing rebuild | O(capacity) | O(capacity) | Triggered by live pairs plus tombstones; drops all tombstones. |
| set `insert` / `contains` / `remove` | O(1) | O(n) | Same as chaining. |
| set `union` / `difference` | O(n + m) | | |
| set `intersection` | O(min(n, m)) | | Iterates the smaller set and probes the larger. |

Memory: chaining keeps one `Vec` per bucket (each has its own allocation). Open addressing keeps one flat array, which is friendlier to the cache but needs the load factor kept low.

## Design choices worth knowing

- **Load factor.** Both resizing tables grow when one more pair would push `size / capacity` above 2/3. Doubling the capacity makes resizing amortized O(1).
- **Tombstones count toward the load.** A probe ends at the first Empty slot, so one must always exist. The rebuild doubles the table only when live pairs fill a third of it, and otherwise rebuilds at the same size. Without that rule, a workload that inserts and deletes repeatedly would grow the table forever (there is a test for this).
- **Power-of-two capacity.** Required so that triangular (quadratic) probing and odd-stride double hashing visit every slot.
- **`rem_euclid`, not `%`.** Rust's `%` keeps the sign of the dividend, so `-1 % 5` is `-1`. `rem_euclid` always returns a non-negative result, which is a valid index.
- **`put` and `remove` return the old value.** Same as `std`, and it avoids a separate lookup.
- **Tests compare against `std::HashMap`.** Chaining and all three probing modes run thousands of random put / get / remove operations with negative keys, checked against the real thing.
- **`i32` keys and values only.** Keeps the code easy to read. Making the maps generic over `K: Hash + Eq` is a good follow-up exercise.

## Not covered here

- Resizing down when the table gets sparse.
- Robin Hood hashing, cuckoo hashing and SwissTable-style group probing.
- A generic key type with a pluggable hasher (`BuildHasher`).
- Hash-based patterns such as frequency counting, two-sum and grouping anagrams. These live in the `leetcode` crate under `arrays_hashing/`.
