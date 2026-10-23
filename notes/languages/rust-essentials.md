---
title: Rust Essentials
slug: rust-essentials
description: Ownership, borrowing, slices, strings, explicit absence and errors, iterators, and collections in one runnable Rust example.
category: Languages
order: -1
status: stable
kind: concept
tags:
  - rust
  - foundations
---

# Rust Essentials

Rust asks you to make ownership and failure visible. Once you can answer “who owns this value, who is borrowing it, and what can fail?”, the rest of the syntax becomes much easier to read.

Use the scratch Cargo package from [Rust — Start Here](../rust-start-here/). Replace its `src/main.rs` with the complete example below, then run `cargo run` and `cargo test` from the directory containing the scratch `Cargo.toml`.

## Bindings, functions, and control flow

`let` creates an immutable binding by default. Add `mut` only when the binding's value will change. Rust often infers types, while a function's parameters and return type are written explicitly.

This first program is standalone. You can temporarily use it as `src/main.rs` and run `cargo run`:

```rust
fn adjusted_score(score: i32, add_bonus: bool) -> i32 {
    let mut result = score;
    if add_bonus {
        result += 2;
    }
    result
}

fn main() {
    let scores = [3, 5, 8];
    let mut total = 0;

    for score in scores {
        total += adjusted_score(score, score < 5);
    }

    assert_eq!(total, 18);
    println!("total: {total}");
}
```

The final `result` has no semicolon, so it is the function's return expression. `if` can also produce a value when every branch has the same type. `for` visits each array element. Use `while` for condition-driven repetition and `loop` for a loop that exits with `break`.

## A complete example

```rust
use std::collections::{HashMap, HashSet};

#[derive(Debug, PartialEq)]
struct Summary {
    total: i32,
    unique: usize,
}

fn parse_scores(input: &str) -> Result<Vec<i32>, String> {
    input
        .split(',')
        .map(str::trim)
        .map(|part| {
            part.parse::<i32>()
                .map_err(|_| format!("invalid score: {part}"))
        })
        .collect()
}

fn summarize(scores: &[i32]) -> Summary {
    let total = scores.iter().copied().sum();
    let unique = scores.iter().copied().collect::<HashSet<_>>().len();
    Summary { total, unique }
}

fn first_positive(scores: &[i32]) -> Option<i32> {
    scores.iter().copied().find(|score| *score > 0)
}

fn label_for(labels: &HashMap<i32, String>, score: i32) -> Option<&str> {
    labels.get(&score).map(String::as_str)
}

fn score_band(score: i32) -> &'static str {
    match score {
        10.. => "strong",
        1..=9 => "building",
        _ => "review",
    }
}

fn main() -> Result<(), String> {
    let input = String::from("10, 7, 10");
    let scores = parse_scores(&input)?;
    let summary = summarize(&scores);

    let mut labels = HashMap::new();
    labels.insert(10, String::from("strong"));

    if let Some(score) = first_positive(&scores) {
        println!("first positive: {score} ({})", score_band(score));
    }

    if let Some(label) = label_for(&labels, 10) {
        println!("label: {label}");
    }

    let word = String::from("café");
    assert_eq!(word.len(), 5);          // UTF-8 bytes
    assert_eq!(word.chars().count(), 4); // Unicode scalar values

    println!("summary: {summary:?}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{Summary, first_positive, parse_scores, summarize};

    #[test]
    fn parses_and_summarizes_scores() {
        let scores = parse_scores("10, 7, 10").expect("valid scores");
        assert_eq!(
            summarize(&scores),
            Summary {
                total: 27,
                unique: 2
            }
        );
        assert_eq!(first_positive(&scores), Some(10));
    }

    #[test]
    fn reports_invalid_input() {
        assert_eq!(parse_scores("10, nope").unwrap_err(), "invalid score: nope");
    }
}
```

Expected `cargo run` output:

```text
first positive: 10 (strong)
label: strong
summary: Summary { total: 27, unique: 2 }
```

`cargo test` should report `2 passed` and `0 failed`.

## Ownership comes first

Every value has an owner. When the owner leaves scope, Rust drops the value. Assignment or a by-value function call usually **moves** a non-`Copy` value such as `String`. The following helper is self-contained; paste it above `main` and call `check_move()` from `main` if you want its assertion to run:

```rust
fn check_move() {
    let first = String::from("warm-up");
    let second = first;
    assert_eq!(second, "warm-up");
    // println!("{first}"); // would not compile: ownership moved to second
}
```

Small scalar types such as `i32` implement `Copy`, so assigning them copies the bits rather than invalidating the original. For owned heap data, use `.clone()` only when you truly need another owned copy. Cloning merely to satisfy the compiler often hides a borrowing design that would be clearer.

The Rust Book's [ownership chapter](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html) explains how these rules provide memory safety without a garbage collector.

## Borrow with references

`&T` temporarily shares a value without taking ownership. `&mut T` permits mutation, but Rust allows only one active mutable borrow of a value at a time and will not combine it with active shared borrows.

In the example:

- `parse_scores(&input)` borrows the `String` as `&str`, so `main` still owns `input` afterward.
- `summarize(&scores)` borrows the vector as an integer slice.
- `label_for(&labels, 10)` borrows the map and returns a borrowed `&str` tied to the map's data.

Use borrowing in function parameters when the function only needs to read or briefly modify a caller-owned value. Use an owned parameter when the function should store, consume, or transform ownership of that value.

## Slices are borrowed views

`&[T]` is a borrowed view over zero or more contiguous `T` values. It accepts a `Vec<T>`, an array, or another slice without allocating. Paste both helpers above `main` and call `check_slices()` from `main` to run the assertions:

```rust
fn first(values: &[i32]) -> Option<i32> {
    values.first().copied()
}

fn check_slices() {
    let array = [4, 8, 15];
    let vector = vec![16, 23, 42];
    assert_eq!(first(&array), Some(4));
    assert_eq!(first(&vector[1..]), Some(23));
}
```

Prefer `&[T]` over `&Vec<T>` for read-only sequence parameters. The standard [slice reference](https://doc.rust-lang.org/reference/types/slice.html) describes slices as dynamically sized borrowed views with bounds-checked safe access.

## `String`, `&str`, and UTF-8

`String` owns a growable UTF-8 buffer. `&str` borrows UTF-8 text, whether from a `String`, a literal, or a substring. A function that only reads text usually accepts `&str`.

String indexing such as `word[0]` is forbidden because one user-perceived character can occupy multiple bytes and a byte index may land inside a UTF-8 encoding. Choose the unit you mean:

- `text.len()` counts bytes.
- `text.chars()` iterates Unicode scalar values.
- `text.bytes()` iterates raw bytes.
- `text.graphemes(...)` needs an external Unicode segmentation crate; it is not in `std`.

The official [`String` module](https://doc.rust-lang.org/std/string/) defines it as UTF-8 encoded and growable. The example's `"café"` has five bytes and four `char` values.

## `Option` and `Result` make branches explicit

Rust has no general-purpose null value. `Option<T>` represents `Some(T)` or `None`. Use it when absence is an expected outcome, as `first_positive` does.

`Result<T, E>` represents `Ok(T)` or `Err(E)`. Use it when an operation can fail and the caller needs the reason. `parse_scores` preserves a useful message instead of panicking.

Handle these enums with `match`, `if let`, methods such as `map`, or the `?` operator. In `main`, `parse_scores(&input)?` extracts the `Vec` on success and returns the `String` error from `main` on failure. The return type `Result<(), String>` makes that propagation legal.

Reserve `unwrap` and `expect` for tests, quick experiments, or cases where a violated invariant should stop the program. The official [error-handling chapter](https://doc.rust-lang.org/book/ch09-00-error-handling.html) distinguishes recoverable `Result` errors from unrecoverable panics.

## Iterators express a data pipeline

Calling `.iter()` borrows collection elements, and `.iter_mut()` mutably borrows them. Calling `.into_iter()` on an owned collection consumes it; calling it on a reference follows that reference's `IntoIterator` implementation and borrows instead. Iterator adapters are lazy until a consumer such as `collect`, `sum`, `find`, or a `for` loop drives them.

`parse_scores` is a pipeline:

1. `split` yields borrowed `&str` pieces.
2. `map(str::trim)` removes surrounding whitespace.
3. The second `map` parses each piece into a `Result<i32, String>`.
4. `collect` turns an iterator of results into one `Result<Vec<i32>, String>`, stopping at the first error.

Use a `for` loop when control flow or mutation is clearer. Use iterator chains when each stage is a simple transformation. The standard [`Iterator` documentation](https://doc.rust-lang.org/std/iter/trait.Iterator.html) lists adapters and consumers.

## Collections encode intent

The example uses three common standard collections:

- `Vec<T>`: ordered, growable sequence; also a stack with `push` and `pop`.
- `HashSet<T>`: unique membership, used to count distinct scores.
- `HashMap<K, V>`: key-to-value lookup; `get` returns `Option<&V>`.

Other useful choices include `VecDeque<T>` for a queue, `BTreeMap<K, V>` for sorted keys, and `BinaryHeap<T>` for a max-priority queue. The official [`std::collections` guide](https://doc.rust-lang.org/std/collections/) gives selection guidance.

## Practice

1. **Borrow instead of clone.** Write `average(values: &[i32]) -> Option<f64>`. Return `None` for an empty slice. Check an array and a vector. **Answer guidance:** use `is_empty`, sum borrowed elements, and divide by `values.len() as f64`; the caller should retain ownership.
2. **Parse with context.** Write `parse_port(text: &str) -> Result<u16, String>`. Check `"8080"`, `"nope"`, and `"70000"`. **Answer guidance:** `parse::<u16>()` rejects both invalid text and out-of-range values; convert its error with `map_err` and include the input in your message.
3. **Count integers.** Write `frequencies(values: &[i32]) -> HashMap<i32, usize>`. **Check:** repeated values increment the stored count. **Answer guidance:** loop over borrowed values, use `entry(*value).or_insert(0)`, then dereference the returned mutable count before adding one.
4. **Respect UTF-8.** Return the first `char` of `&str` as `Option<char>`. Check `"éclair"` and `""`. **Answer guidance:** `text.chars().next()` already has exactly that return type; byte indexing is the wrong tool.

Put the practice functions and `#[test]` cases in the scratch Cargo package. Run `cargo fmt`, `cargo test`, and `cargo check`. When they pass, compare your collection choices with the [Rust DSA toolkit](../rust-dsa-toolkit/), then return to the [Rust learning track](../../learn/rust/).

## Official references

- [The Rust Programming Language: Ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html)
- [The Rust Programming Language: Enums and `Option`](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html)
- [The Rust Programming Language: Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Standard library collections](https://doc.rust-lang.org/std/collections/)
- [Standard library iterators](https://doc.rust-lang.org/std/iter/)
