# Rust built-ins for hashing: HashMap, HashSet and friends

Cheat sheet mapping what this folder builds by hand to what the standard library provides. Implement it yourself first, then use the built-in in real code.

```rust
use std::collections::{HashMap, HashSet, BTreeMap, BTreeSet};
```

## Which collection

| Need | Use |
| --- | --- |
| key -> value lookup, order does not matter | `HashMap<K, V>` |
| "seen before?", remove duplicates | `HashSet<T>` |
| key -> value, iterate in sorted key order; range queries; min / max key | `BTreeMap<K, V>` |
| sorted unique values | `BTreeSet<T>` |
| keys are small integers in a known range | a plain `Vec` or array indexed by the key (a direct addressing table) |

`HashMap` and `HashSet` are average O(1) per operation. `BTreeMap` and `BTreeSet` are O(log n) but keep keys sorted.

## HashMap

```rust
let mut m: HashMap<i32, i32> = HashMap::new();
let m2 = HashMap::from([(1, 10), (2, 20)]);        // from an array of pairs
let m3: HashMap<_, _> = pairs.into_iter().collect(); // from an iterator
let m4: HashMap<i32, i32> = HashMap::with_capacity(100);
```

| Call | Result |
| --- | --- |
| `m.insert(k, v)` | `Option<V>`: the old value if the key existed (your `put`) |
| `m.get(&k)` | `Option<&V>` (your `get`) |
| `m.get_mut(&k)` | `Option<&mut V>` |
| `m.contains_key(&k)` | `bool` |
| `m.remove(&k)` | `Option<V>` (your `remove`) |
| `m.remove_entry(&k)` | `Option<(K, V)>` |
| `m[&k]` | the value, but **panics** if the key is missing |
| `m.len()`, `m.is_empty()` | size checks |
| `m.retain(\|k, v\| *v > 0)` | keep only matching pairs |
| `m.extend(other)` | add many pairs |
| `m.clear()` | remove everything |

Arguments to `get` / `remove` / `contains_key` are references (`&k`). For `HashMap<String, V>` you can look up with a `&str`: `m.get("abc")`.

## The entry API (the idiom to learn)

`entry(k)` looks the key up once and lets you act on "present" or "absent" without a second lookup.

```rust
// Count occurrences
let mut counts: HashMap<i32, usize> = HashMap::new();
for &n in &nums {
    *counts.entry(n).or_insert(0) += 1;
}

// Group values under a key
let mut groups: HashMap<String, Vec<String>> = HashMap::new();
for word in words {
    groups.entry(sorted_key(&word)).or_default().push(word);
}

// Update if present, else insert
m.entry(k).and_modify(|v| *v += 1).or_insert(1);

// Compute the default lazily
m.entry(k).or_insert_with(|| expensive());
```

`or_insert(x)` returns `&mut V`, which is why `*... += 1` works. `or_default()` uses `V::default()` (0, empty `Vec`, empty `String`).

## Iterate

```rust
for (k, v) in &m { }             // borrow both
for (k, v) in &mut m { *v += 1; } // mutate values
for k in m.keys() { }
for v in m.values() { }
for v in m.values_mut() { *v *= 2; }
for (k, v) in m { }              // consumes the map

let mut keys: Vec<_> = m.keys().copied().collect();
keys.sort();                     // HashMap order is arbitrary; sort when you need order
```

## HashSet

```rust
let mut s: HashSet<i32> = HashSet::new();
let s2: HashSet<i32> = nums.iter().copied().collect(); // dedup a slice
```

| Call | Result |
| --- | --- |
| `s.insert(x)` | `bool`: `true` if it was new (your `insert`) |
| `s.contains(&x)` | `bool` |
| `s.remove(&x)` | `bool`: `true` if it was present |
| `s.len()`, `s.is_empty()` | size checks |

Set operations return iterators, so collect them:

```rust
let both: HashSet<_> = a.intersection(&b).copied().collect();
let either: HashSet<_> = a.union(&b).copied().collect();
let only_a: HashSet<_> = a.difference(&b).copied().collect();
let one_side: HashSet<_> = a.symmetric_difference(&b).copied().collect();
a.is_subset(&b);
a.is_disjoint(&b);
let both = &a & &b;              // operators give a new HashSet (needs T: Clone)
```

The one-pass duplicate check: `if !seen.insert(x) { /* x is a duplicate */ }`.

## BTreeMap / BTreeSet (sorted)

```rust
let mut t: BTreeMap<i32, &str> = BTreeMap::new();
t.insert(3, "c");
t.first_key_value();             // Option<(&K, &V)> smallest key
t.last_key_value();              // largest key
t.range(2..5);                   // keys in [2, 5), in order
for (k, v) in &t { }             // ascending key order
```

Reach for these when you need ordered keys, nearest-key lookups, or deterministic iteration. Keys must be `Ord`.

## What can be a key

A key type must implement `Eq + Hash`.

- Works: integers, `bool`, `char`, `String`, `&str`, tuples like `(i32, i32)`, arrays, `Vec<T>` when `T` does.
- Does not work: `f64` / `f32` (NaN breaks equality). Use an integer, a `u64` from `to_bits()`, or a wrapper type.
- Your own type: `#[derive(PartialEq, Eq, Hash)]`.
- The contract: if `a == b` then `hash(a) == hash(b)`. The reverse does not hold, since different values may collide.

## How std differs from what you built

- **Different collision strategy.** Std `HashMap` is the `hashbrown` SwissTable: open addressing with SIMD-assisted probing of small groups, and a load factor up to 7/8. It is not separate chaining.
- **Different hasher.** The default is SipHash 1-3 with random per-map keys. It resists hash-flooding attacks and is slower than FNV or a multiplicative hash. For speed on trusted input, crates like `rustc-hash` (`FxHashMap`) swap in a faster hasher through the `BuildHasher` trait.
- **Random iteration order.** Order changes between runs. Never depend on it; sort the keys, or use `BTreeMap`.
- **Generic over `K` and `V`.** Yours is `i32` to `i32`.

## Gotchas

- `m[&k]` panics on a missing key; prefer `get`.
- `insert` overwrites silently. Check the returned `Option` if that matters.
- You cannot insert or remove while iterating the same map. Collect the keys first, or use `retain`.
- A reference from `get` keeps the map borrowed. Copy the value out (`.copied()`) before mutating the map.
- `entry()` holds a mutable borrow of the map until you are done with the entry.
- Hashing a `String` key reads the whole string, so each operation is O(key length), not O(1).

## Docs

- HashMap: <https://doc.rust-lang.org/std/collections/struct.HashMap.html>
- HashSet: <https://doc.rust-lang.org/std/collections/struct.HashSet.html>
- Entry API: <https://doc.rust-lang.org/std/collections/hash_map/enum.Entry.html>
- BTreeMap: <https://doc.rust-lang.org/std/collections/struct.BTreeMap.html>
- Hash trait: <https://doc.rust-lang.org/std/hash/trait.Hash.html>
