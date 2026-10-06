//! LeetCode 1929. Concatenation of Array
//!
//! Given `nums` of length `n`, return `ans` of length `2n` where
//! `ans[i] == nums[i]` and `ans[i + n] == nums[i]`.
//!
//! # Notes: `Vec<i32>` vs `[i32; N]` vs `&[i32]`
//!
//! - `Vec<i32>`: owned, growable, on the heap. Like a Python `list`.
//!   Make one with `vec![1, 2, 3]` or `vec![0; n]`.
//! - `[i32; 3]`: owned, fixed-size array. The length is part of the type.
//! - `&[i32]`: a borrowed *slice*, a read-only view into a Vec or array,
//!   e.g. `&v` or `&v[1..]`. A bare `[i32]` can only be used behind `&`.
//!
//! LeetCode passes `Vec<i32>` so the function *owns* the input, and returns
//! `Vec<i32>` because a function can't return a reference to its own local
//! data. A function that only reads would normally take `&[i32]`.
//!
//! Indexes and lengths are `usize`. Variables are immutable unless `mut`.
//! `v[i]` past the end panics, and there are no negative indexes.
//!
//! # Idiomatic Rust
//!
//! - Use the standard library over hand-written loops: `nums.repeat(2)`
//!   says *what* you want, not *how* to do it.
//! - Prefer iterators and slice methods to `v[i]` indexing. They can't go
//!   out of bounds and they skip per-element bounds checks.
//! - If you own a value and are done with it, reuse it instead of copying.
//! - If you build a Vec yourself and know its size, use `Vec::with_capacity`
//!   so it never has to reallocate.
//!
//! `get_concatenation` is the one to submit on LeetCode. Variants 1-4 go
//! from Python-style to most Rust-like. All are O(n) time and space.

pub struct Solution;

impl Solution {
    /// Most idiomatic: one standard-library call. `repeat` lives on slices,
    /// and `Vec` derefs (converts automatically) to a slice.
    pub fn get_concatenation(nums: Vec<i32>) -> Vec<i32> {
        nums.repeat(2)
    }

    /// 1. Index loop (Python-style). Works, but zero-fills `2n` slots only
    ///    to overwrite them, and every `v[i]` is a bounds-checked access.
    ///    Clippy (`cargo clippy`, Rust's linter) flags this loop as
    ///    `manual_memcpy`. It's kept here on purpose for comparison.
    #[allow(clippy::manual_memcpy)]
    pub fn concat_index_loop(nums: Vec<i32>) -> Vec<i32> {
        let n = nums.len();
        let mut v = vec![0; 2 * n];
        for i in 0..n {
            v[i] = nums[i];
            v[i + n] = nums[i];
        }
        v
    }

    /// 2. Reserve space, then copy whole slices. `with_capacity` sets aside
    ///    room without filling it (`len() == 0` until you add elements).
    pub fn concat_with_capacity(nums: Vec<i32>) -> Vec<i32> {
        let mut v = Vec::with_capacity(2 * nums.len());
        v.extend_from_slice(&nums);
        v.extend_from_slice(&nums);
        v
    }

    /// 3. Iterator chain, like `list(itertools.chain(nums, nums))` in Python.
    ///    `copied()` turns `&i32` items into `i32`, and `collect()` builds
    ///    the Vec (Rust infers the type from the return type).
    pub fn concat_iterator(nums: Vec<i32>) -> Vec<i32> {
        nums.iter().chain(&nums).copied().collect()
    }

    /// 4. Reuse the input's buffer. We own `nums`, so we can append a copy
    ///    of it onto itself instead of allocating a second Vec. `mut` on the
    ///    parameter makes it mutable, and `..` means "the whole range".
    pub fn concat_in_place(mut nums: Vec<i32>) -> Vec<i32> {
        nums.extend_from_within(..);
        nums
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A type alias, i.e. a short name for a longer type. `fn(..) -> ..` is a
    /// function-pointer type: any function with that signature fits.
    type Variant = (&'static str, fn(Vec<i32>) -> Vec<i32>);

    /// Every variant, so each test checks all of them.
    const VARIANTS: [Variant; 5] = [
        ("repeat", Solution::get_concatenation),
        ("index_loop", Solution::concat_index_loop),
        ("with_capacity", Solution::concat_with_capacity),
        ("iterator", Solution::concat_iterator),
        ("in_place", Solution::concat_in_place),
    ];

    /// Runs every variant on `nums` and compares with `expected`. The
    /// variant name is printed if one fails.
    fn check(nums: Vec<i32>, expected: Vec<i32>) {
        for (name, f) in VARIANTS {
            // `.clone()` because each call takes ownership of its input.
            assert_eq!(f(nums.clone()), expected, "variant: {name}");
        }
    }

    #[test]
    fn example_1() {
        check(vec![1, 2, 1], vec![1, 2, 1, 1, 2, 1]);
    }

    #[test]
    fn example_2() {
        check(vec![1, 3, 2, 1], vec![1, 3, 2, 1, 1, 3, 2, 1]);
    }

    #[test]
    fn single_element() {
        check(vec![7], vec![7, 7]);
    }

    #[test]
    fn halves_match_input() {
        let nums = vec![5, 4, 3, 2, 1];
        let n = nums.len();
        for (name, f) in VARIANTS {
            let ans = f(nums.clone());
            // Slices let us compare each half against the original.
            assert_eq!(&ans[..n], &nums[..], "variant: {name}");
            assert_eq!(&ans[n..], &nums[..], "variant: {name}");
        }
    }
}
