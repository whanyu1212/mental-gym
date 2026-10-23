---
title: Rust Standard Library for DSA
slug: rust-standard-library
description: A type-by-type reference for the Rust standard-library APIs you use in DSA problems, with return types, panics, and Python equivalents.
category: Languages
order: 8
status: stable
tags:
  - rust
  - dsa
  - standard-library
  - reference
---

# Rust Standard Library for DSA

Use this note when you know which Rust type you need and want its methods, what they return, and when they panic.

> **Choose your reference**
>
> - Choosing a tool → [Rust DSA Quick Reference](../rust-dsa-toolkit/)
> - Looking up syntax and APIs → **Rust Standard Library for DSA** (this note)
> - Checking operation costs → [Rust Big O Cheatsheet](../rust-big-o-cheatsheet/)

Baseline: Rust 1.93, edition 2021, `std` only. Most collection types need a `use` line:

```rust
use std::cmp::{Ordering, Reverse};
use std::collections::{BTreeMap, BTreeSet, BinaryHeap, HashMap, HashSet, VecDeque};
```

`Vec`, `String` and `Option` are always in scope.

---

## Vec and Slices

`Vec<T>` is Python's `list`. A slice `&[T]` is a borrowed view into part of a `Vec` (or an array), and most read-only methods live on slices.

### Building

```rust
let a: Vec<i32> = Vec::new();
let b = vec![0; 5];                          // [0, 0, 0, 0, 0]
let c: Vec<i32> = (1..=4).collect();         // [1, 2, 3, 4]
let grid = vec![vec!['.'; 3]; 2];            // 2 rows × 3 cols, rows are independent
let mut d = Vec::with_capacity(100);         // reserve space up front
d.push(1);
```

### Adding and removing

| Method | Returns | Notes |
|---|---|---|
| `v.push(x)` | `()` | Append to the end |
| `v.pop()` | `Option<T>` | `None` if empty |
| `v.insert(i, x)` | `()` | Shifts everything after `i` right; panics if `i > len` |
| `v.remove(i)` | `T` | Shifts left; panics if out of range |
| `v.swap_remove(i)` | `T` | Moves the last element into `i`; fast but changes order |
| `v.truncate(n)` | `()` | Keep the first `n` |
| `v.clear()` | `()` | Remove everything |
| `v.extend(iter)` | `()` | Python's `extend` |
| `v.append(&mut other)` | `()` | Moves every element out of `other`, leaving it empty |
| `v.retain(\|x\| pred)` | `()` | Keep only the matches, in place |
| `v.dedup()` | `()` | Removes *consecutive* duplicates; sort first to remove all |
| `v.drain(a..b)` | iterator | Removes and yields a range |

### Reading (slice methods)

| Method | Returns | Notes |
|---|---|---|
| `v[i]` | `T` (or `&T`) | Panics if out of range |
| `v.get(i)` | `Option<&T>` | Safe indexing |
| `v.first()` / `v.last()` | `Option<&T>` | Python's `v[0]` / `v[-1]`, without the panic |
| `v.len()` / `v.is_empty()` | `usize` / `bool` | |
| `v.contains(&x)` | `bool` | Linear scan |
| `v.iter().position(\|&y\| y == x)` | `Option<usize>` | Python's `v.index(x)` |
| `&v[a..b]` | `&[T]` | A view, not a copy. `.to_vec()` makes a copy |
| `v.split_at(i)` | `(&[T], &[T])` | `[0, i)` and `[i, len)` |
| `v.concat()` | `Vec<T>` | Flattens a `Vec<Vec<T>>` |
| `v.swap(i, j)` / `v.reverse()` | `()` | In place |
| `v.fill(x)` | `()` | Overwrite every element |
| `v.iter().rev()` | iterator | Python's `reversed(v)` |
| `v.rotate_left(k)` | `()` | In place |

Ranges follow Python's slice rules for the half-open part: `a..b` is `[a, b)`, `..b` starts at `0`, and `a..` runs to the end. `a..=b` includes `b`. There is no negative indexing and no step inside the brackets. Use `.iter().step_by(k)` for a step.

### Check yourself

1. Predict the output:

   ```rust
   let mut v = vec![10, 20, 30, 40];
   let x = v.swap_remove(0);
   println!("{x} {:?}", v);
   ```

2. What does `vec![3, 3, 1, 3].dedup()` leave in the vector?
3. `v` might be empty. Write a line that reads the last element without panicking and falls back to `0`.

<details>
<summary>Answer</summary>

1. `10 [40, 20, 30]`. The last element moves into the gap at index 0.
2. `[3, 1, 3]`. Only *consecutive* duplicates are removed.
3. `let last = v.last().copied().unwrap_or(0);`

</details>

---

## Strings and Characters

A `String` is an owned, growable, UTF-8 buffer. A `&str` is a borrowed view of one. Every string literal is a `&str`. `len()` counts **bytes**, and you can't write `s[i]`.

### Pick how you'll walk the string

```rust
let s = String::from("leet");

for c in s.chars() { /* c: char, a Unicode scalar value */ }
for b in s.bytes() { /* b: u8, one byte; the right pick for ASCII-only input */ }

let bytes = s.as_bytes();            // &[u8]: O(1) random access for ASCII
assert_eq!(bytes[0], b'l');

let cs: Vec<char> = s.chars().collect(); // random access for any Unicode
assert_eq!(cs[1], 'e');
```

LeetCode inputs are usually ASCII, so `as_bytes()` is the cheap way to get Python-style `s[i]`.

### Letter arithmetic

```rust
let c = 'c';
let idx = (c as u8 - b'a') as usize;       // 2: ord(c) - ord('a')
let back = (b'a' + 2) as char;             // 'c': chr(ord('a') + 2)
let digit = '7'.to_digit(10);              // Some(7)
let ch = char::from_digit(7, 10);          // Some('7')
```

`b'a'` is a byte literal (`u8` value 97). `'a'` is a `char`.

### Common methods

| Rust | Python | Returns |
|---|---|---|
| `s.len()` | `len(s.encode())` | bytes, not characters |
| `s.chars().count()` | `len(s)` | characters (walks the string) |
| `s.push(c)` / `s.push_str("ab")` | `s += c` | `()` |
| `s.pop()` | `c = s[-1]; s = s[:-1]` | `Option<char>` |
| `&s[a..b]` | `s[a:b]` | `&str`; byte indices; panics mid-character |
| `s.split(',')` / `s.split_whitespace()` | `s.split(",")` / `s.split()` | iterator of `&str` |
| `s.trim()` | `s.strip()` | `&str` |
| `s.contains("ab")` / `s.starts_with("a")` | `"ab" in s` / `startswith` | `bool` |
| `s.find("ab")` | `s.find("ab")` | `Option<usize>` (byte index) |
| `s.replace("a", "b")` | `s.replace("a", "b")` | new `String` |
| `s.to_lowercase()` / `s.to_uppercase()` | `lower()` / `upper()` | new `String` |
| `s.repeat(3)` | `s * 3` | new `String` |
| `s.chars().rev().collect::<String>()` | `s[::-1]` | new `String` |
| `"42".parse::<i32>()` | `int("42")` | `Result<i32, _>` |
| `x.to_string()` | `str(x)` | `String` |
| `parts.join(" ")` | `" ".join(parts)` | `String` |
| `c.is_ascii_digit()` / `c.is_alphanumeric()` / `c.is_ascii_lowercase()` | `isdigit()` / `isalnum()` / `islower()` | `bool` |
| `c.to_ascii_lowercase()` | `c.lower()` | `char` |

Build strings by pushing into one `String` (`s.push(c)`, `s.push_str(t)`, or `s += t`). Each push only appends, so the total cost stays linear.

`format!("{a}-{b}")` works like an f-string and returns a `String`. `{:?}` prints debug output such as vectors and tuples, and `{:.2}` prints two decimal places.

### Check yourself

1. What is `"héllo".len()`? What is `"héllo".chars().count()`?
2. Why doesn't `let first = s[0];` compile for a `String`, and what do you write instead for ASCII input?
3. Predict: `((b'z' - b'a' + 1) % 26 + b'a') as char`

<details>
<summary>Answer</summary>

1. `6` and `5`. `é` takes two bytes in UTF-8.
2. `String` doesn't implement integer indexing, because a byte position might land in the middle of a character. Use `s.as_bytes()[0]` (a `u8`), or `s.chars().next()` for an `Option<char>`.
3. `'a'`. `'z'` shifted by one wraps back to the start of the alphabet.

</details>

---

## HashMap and HashSet

`HashMap<K, V>` is Python's `dict` and `HashSet<T>` is `set`. Keys need `Hash + Eq`. Integers, `char`, `String`, `&str`, tuples, `Vec` and arrays all qualify; `f64` doesn't.

```rust
let mut m: HashMap<&str, i32> = HashMap::new();
m.insert("a", 1);                        // returns Option<V>: the old value, if any
let old = m.insert("a", 5);              // Some(1)
let v = m.get("a");                      // Option<&i32>
let n = m.get("zzz").copied().unwrap_or(0); // dict.get(k, 0)
let has = m.contains_key("a");
let removed = m.remove("a");             // Option<V>
```

The `entry` API does insert-or-update with a single hash lookup:

```rust
let mut count: HashMap<char, usize> = HashMap::new();
for c in "hello".chars() {
    *count.entry(c).or_insert(0) += 1;          // Counter
}

let mut adj: HashMap<i32, Vec<i32>> = HashMap::new();
adj.entry(1).or_default().push(2);              // defaultdict(list)
adj.entry(1).or_insert_with(Vec::new).push(3);  // same thing, written out
```

Iterate with `for (k, v) in &m`, `m.keys()`, `m.values()` or `m.values_mut()`. The order is arbitrary and changes from run to run.

Sets:

```rust
let mut s: HashSet<i32> = [1, 2, 3].into_iter().collect();
let fresh = s.insert(4);      // true: 4 was new
let again = s.insert(4);      // false: already there
s.remove(&1);                 // bool: whether it was present
let t: HashSet<i32> = [2, 3, 9].into_iter().collect();

let both: HashSet<i32> = s.intersection(&t).copied().collect(); // s & t
let either: HashSet<i32> = s.union(&t).copied().collect();      // s | t
let only_s: HashSet<i32> = s.difference(&t).copied().collect(); // s - t
```

---

## VecDeque and BinaryHeap

`VecDeque<T>` is `collections.deque`: a ring buffer with fast operations at both ends.

```rust
let mut dq: VecDeque<i32> = VecDeque::new();
dq.push_back(1);
dq.push_front(0);
let front = dq.front();       // Option<&i32>
let back = dq.back();
let x = dq.pop_front();       // Option<i32>
let y = dq.pop_back();
let third = dq.get(2);        // indexing works too, and it's O(1)
```

`BinaryHeap<T>` is a max-heap. Wrap items in `Reverse` for min-heap behaviour.

| Method | Returns | Notes |
|---|---|---|
| `BinaryHeap::from(vec)` | heap | Builds the heap in linear time (Python's `heapify`) |
| `h.push(x)` | `()` | |
| `h.pop()` | `Option<T>` | Largest first |
| `h.peek()` | `Option<&T>` | Look without removing |
| `h.len()` / `h.is_empty()` | | |
| `h.into_sorted_vec()` | `Vec<T>` | Ascending order |
| `h.into_vec()` / `h.iter()` | | Arbitrary order, **not** sorted |

```rust
let mut h = BinaryHeap::new();
h.push(Reverse((5, "e")));
h.push(Reverse((1, "a")));
let Some(Reverse((pri, name))) = h.pop() else { panic!("empty") };
// pri == 1, name == "a"
```

---

## BTreeMap and BTreeSet

These are sorted versions of `HashMap` and `HashSet`. Use them when you need ordered iteration, the smallest or largest key, or a floor or ceiling query. Python has no equivalent in its standard library; `sortedcontainers` is the usual stand-in.

```rust
let mut set: BTreeSet<i32> = [10, 20, 30].into_iter().collect();

let smallest = set.first();                    // Some(&10)
let largest = set.last();                      // Some(&30)
let ceiling = set.range(15..).next();          // Some(&20): smallest value >= 15
let floor = set.range(..=15).next_back();      // Some(&10): largest value <= 15
let strictly_below = set.range(..20).next_back(); // Some(&10)
set.pop_first();                               // Some(10), and removes it

let mut map: BTreeMap<i32, &str> = BTreeMap::new();
map.insert(3, "c");
map.insert(1, "a");
for (k, v) in &map { /* keys come out in sorted order: 1, then 3 */ }
let (k, v) = map.first_key_value().unwrap();   // (&1, &"a")
let in_range: Vec<_> = map.range(2..=5).collect(); // [(&3, &"c")]
```

`BTreeSet` keeps one copy of each value. To keep a sorted multiset, use a `BTreeMap<i32, usize>` of counts and remove a key when its count reaches zero.

### Check yourself

1. Predict: `m.insert("k", 1); let r = m.insert("k", 2);` What is `r`, and what does `m["k"]` hold now?
2. A `BTreeSet<i32>` holds `{2, 5, 9}`. Write the expression for the smallest value that is at least `6`, and give its result.
3. You `println!` the contents of a `HashMap` and a test fails because the order differs from the expected output. What are two fixes?

<details>
<summary>Answer</summary>

1. `r` is `Some(1)`, the old value, and `m["k"]` is `2`.
2. `set.range(6..).next()` gives `Some(&9)`.
3. Collect the entries into a `Vec` and sort it before printing, or use a `BTreeMap`, which iterates in key order.

</details>

---

## Sorting and Searching

Sorting methods sort in place and return `()`, so `let v2 = v.sort();` gives you `()`, not a vector.

| Method | Stable? | Use it for |
|---|---|---|
| `v.sort()` | yes | Default ascending order |
| `v.sort_unstable()` | no | Faster, doesn't allocate; fine unless equal elements must keep their order |
| `v.sort_by(\|a, b\| b.cmp(a))` | yes | Custom comparator (descending here) |
| `v.sort_by_key(\|x\| x.1)` | yes | Sort by a key you compute (Python's `key=`) |
| `v.sort_by_key(\|&x\| Reverse(x))` | yes | Descending by key |
| `v.sort_by_cached_key(\|s\| s.to_lowercase())` | yes | Key is expensive to compute |
| `v.sort_by(\|a, b\| a.total_cmp(b))` | yes | `f64` values |
| `v.select_nth_unstable(k)` | no | Put the k-th smallest at index `k` in linear time |

Chain comparisons with `Ordering::then`:

```rust
let mut people = vec![("bo", 30), ("al", 25), ("cy", 30)];
// Age descending, then name ascending
people.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));
assert_eq!(people, vec![("bo", 30), ("cy", 30), ("al", 25)]);
```

Searching in a sorted slice:

```rust
let v = vec![1, 3, 3, 5];
v.binary_search(&3);              // Ok(1) or Ok(2): any matching index
v.binary_search(&4);              // Err(3): where 4 would go
v.partition_point(|&x| x < 3);    // 1: bisect_left
v.partition_point(|&x| x <= 3);   // 3: bisect_right
```

To insert while keeping the order, use `let i = v.partition_point(|&x| x < val); v.insert(i, val);`. That's the same as Python's `insort`.

---

## Iterators

Three ways to iterate a collection:

| Call | Yields | Collection afterwards |
|---|---|---|
| `v.iter()` or `for x in &v` | `&T` | still usable |
| `v.iter_mut()` or `for x in &mut v` | `&mut T` | modified in place |
| `v.into_iter()` or `for x in v` | `T` | moved, gone |

Adapters are lazy. They build a pipeline that a consumer then runs:

```rust
let nums = vec![3, 1, 4, 1, 5, 9];

let evens_squared: Vec<i32> = nums.iter().filter(|&&x| x % 2 == 0).map(|&x| x * x).collect();
let total: i32 = nums.iter().sum();                  // needs a type annotation
let big_total: i64 = nums.iter().map(|&x| x as i64).sum();
let product: i64 = nums.iter().map(|&x| x as i64).product();
let max = nums.iter().max();                         // Option<&i32>
let argmax = nums.iter().enumerate().max_by_key(|&(_, &x)| x).map(|(i, _)| i);
let any_big = nums.iter().any(|&x| x > 8);           // any()
let all_pos = nums.iter().all(|&x| x > 0);           // all()
let ones = nums.iter().filter(|&&x| x == 1).count();
let running = nums.iter().fold(0, |acc, &x| acc + x); // reduce()
```

| Adapter | Python equivalent |
|---|---|
| `enumerate()` | `enumerate()` |
| `zip(other)` | `zip()` |
| `rev()` | `reversed()` |
| `skip(n)` / `take(n)` | `xs[n:]` / `xs[:n]` (lazily) |
| `step_by(k)` | `xs[::k]` |
| `chain(other)` | `itertools.chain` |
| `flat_map(f)` / `flatten()` | nested comprehension |
| `take_while(p)` / `skip_while(p)` | `itertools.takewhile` / `dropwhile` |
| `scan(init, f)` | `itertools.accumulate` |
| `peekable()` | look at the next item without consuming it |
| slice `windows(k)` | `itertools.pairwise` when `k = 2`; every run of `k` |
| slice `chunks(k)` | `batched(xs, k)` (Python 3.12) |

`collect()` builds whatever type you ask for: `Vec<_>`, `HashSet<_>`, `HashMap<_, _>` from pairs, `String` from `char`s, or `Result<Vec<_>, _>` to stop at the first error.

`max_by_key` returns the **last** of several equal maxima, and `min_by_key` returns the **first** of several equal minima.

### Check yourself

1. Predict: `vec![2, 9, 9, 1].iter().enumerate().max_by_key(|&(_, &x)| x).unwrap().0`
2. What is `v.partition_point(|&x| x < 4)` for `v = [1, 3, 3, 5]`?
3. `let total: i32 = nums.iter().sum();` panics on a large input. Rewrite it so it doesn't.

<details>
<summary>Answer</summary>

1. `2`. The two 9s tie, and `max_by_key` returns the later one, at index 2.
2. `3`. Three values are less than 4.
3. `let total: i64 = nums.iter().map(|&x| x as i64).sum();`

</details>

---

## Integers and Math

| Type | Range | Typical use |
|---|---|---|
| `i32` | about ±2.1 × 10⁹ | LeetCode inputs and outputs |
| `i64` | about ±9.2 × 10¹⁸ | Sums, products, distances |
| `u64` / `u128` | non-negative | Hashing, huge counts |
| `usize` | non-negative, pointer-sized | Indices and lengths |
| `f64` | floating point | Averages, geometry |

```rust
let a: i32 = 7;
let b = a as i64 * 1_000_000;     // widen before multiplying
let m = i32::MAX;                 // also i32::MIN, i64::MAX, usize::MAX
let p = 2i64.pow(10);             // 1024; the exponent is a u32
let r = (a as f64).sqrt();
let d = 3i32.abs_diff(-4);        // 7, returned as u32
let lo = a.min(3);                // 3: methods, not free functions
let hi = a.max(3);                // 7

a.checked_add(i32::MAX);          // None instead of overflowing
a.saturating_sub(100);            // stops at i32::MIN rather than wrapping
a.wrapping_mul(1 << 30);          // wraps silently, like C
(-7i32).rem_euclid(3);            // 2: Python's -7 % 3
(-7i32).div_euclid(2);            // -4: Python's -7 // 2
```

`as` never panics. It truncates or wraps: `300i32 as u8` is `44`, `-1i32 as usize` is `usize::MAX`, and `3.9f64 as i32` is `3`.

There's no `gcd` in `std`. Write it:

```rust
fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 { a } else { gcd(b, a % b) }
}
```

Bit tricks work on every integer type: `& | ^ ! << >>`. Note that bitwise NOT is `!`, not `~`. Useful helpers include `x.count_ones()`, `x.trailing_zeros()`, `x.leading_zeros()` and `x.is_power_of_two()` (the last one is for unsigned types).

---

## Option and Result

Every "maybe missing" value is an `Option<T>`, and every "might fail" value is a `Result<T, E>`.

```rust
let v = vec![4, 8];
let first: Option<&i32> = v.first();

if let Some(&x) = first { /* use x */ }
let x = v.get(5).copied().unwrap_or(-1);        // default
let doubled = v.first().map(|&x| x * 2);        // Some(8)
let Some(&last) = v.last() else { return };     // early exit if empty

let n: i32 = "12".parse().unwrap();             // panics on bad input
let bad = "x".parse::<i32>().is_err();          // true
let maybe = "x".parse::<i32>().ok();            // None
```

| Method | Does |
|---|---|
| `unwrap()` | Gets the value, panics on `None` / `Err` |
| `expect("msg")` | Same, with your message |
| `unwrap_or(d)` / `unwrap_or_default()` | Fallback value |
| `copied()` | `Option<&T>` → `Option<T>` for `Copy` types |
| `map(f)` / `and_then(f)` | Transform / chain |
| `is_some()` / `is_none()` / `is_some_and(p)` | Tests |
| `take()` | Moves the value out and leaves `None` (linked lists) |
| `?` | In a function returning `Option`/`Result`, returns early on `None`/`Err` |

### Check yourself

1. Predict: `300i32 as u8`, `(-7i32).rem_euclid(3)`, `5u32.checked_sub(7)`
2. What does `3i32.abs_diff(-4)` return, and what type is it?
3. Rewrite `let x = v.get(i).unwrap();` so an out-of-range `i` gives `0` instead of a panic, assuming `v: Vec<i32>`.

<details>
<summary>Answer</summary>

1. `44`, `2`, `None`
2. `7`, as a `u32`. The unsigned result can hold any difference without overflowing.
3. `let x = v.get(i).copied().unwrap_or(0);`

</details>

---

## Reading Input and Running a File

LeetCode calls your method directly. For Kattis, Codeforces and other judges that use stdin, read everything at once and split it:

```rust
use std::io::{self, BufWriter, Read, Write};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut it = input.split_ascii_whitespace().map(|t| t.parse::<i64>().unwrap());

    let n = it.next().unwrap() as usize;
    let nums: Vec<i64> = (0..n).map(|_| it.next().unwrap()).collect();

    let mut out = BufWriter::new(io::stdout().lock()); // one flush instead of one per line
    writeln!(out, "{}", nums.iter().sum::<i64>()).unwrap();
}
```

To run a single file locally, mimic LeetCode's shape with an empty `Solution` struct:

```rust
struct Solution;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen = std::collections::HashMap::new();
        for (i, &x) in nums.iter().enumerate() {
            if let Some(&j) = seen.get(&(target - x)) {
                return vec![j as i32, i as i32];
            }
            seen.insert(x, i);
        }
        vec![]
    }
}

fn main() {
    // Expected: [0, 1]
    println!("{:?}", Solution::two_sum(vec![2, 7, 11, 15], 9));
}
```

```bash
rustc --edition 2021 two_sum.rs -o /tmp/two_sum && /tmp/two_sum
```

Debug builds (the default for `rustc` without `-O`) panic on integer overflow, which is what you want while practising.

---

## See Also

- [Rust DSA Quick Reference](../rust-dsa-toolkit/): task-to-tool decisions and compact idioms
- [Rust Big O Cheatsheet](../rust-big-o-cheatsheet/): what each operation costs
- [Python Standard Library for DSA](../python_builtins_for_leetcode/): the same reference for Python
- [TypeScript Standard Library for DSA](../typescript-standard-library/): the same reference for TypeScript
