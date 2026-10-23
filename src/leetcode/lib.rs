//! LeetCode Rust practice: one crate, grouped by algorithmic topic.
//!
//! Add each problem as a module in its topic's `rust/mod.rs`.
//! Keep unit tests beside the implementation in a `#[cfg(test)]` module.

#[path = "arrays_hashing/rust/mod.rs"]
pub mod arrays_hashing;
#[path = "sliding_window/rust/mod.rs"]
pub mod sliding_window;
#[path = "stack/rust/mod.rs"]
pub mod stack;
#[path = "two_pointers/rust/mod.rs"]
pub mod two_pointers;
