---
title: Rust — Start Here
slug: rust-start-here
description: Install Rust, create a separate Cargo scratch project, and run a small program with a passing unit test.
category: Languages
order: -2
status: stable
kind: concept
tags:
  - rust
  - foundations
---

# Rust — Start Here

Rust compiles ahead of time and uses ownership rules to prevent many memory errors. Cargo is the standard tool for creating, building, running, and testing Rust packages.

Mental Gym does **not** currently have a Cargo project at the repository root. Keep the first Cargo package outside the clone so a nested package, build output, and lockfile cannot be added to the repository by accident.

## Install and verify Rust

Use the [official Rust installer](https://www.rust-lang.org/tools/install). For most developers, the recommended `rustup` installer provides `rustc`, `cargo`, and the toolchain manager together. The Rust Book's [installation chapter](https://doc.rust-lang.org/book/ch01-01-installation.html) also covers linker prerequisites and `PATH` troubleshooting.

From any terminal, verify both tools:

```sh
rustc --version
cargo --version
```

This repository was validated with `rustc 1.93.0` and `cargo 1.93.0`. A newer stable release should also work.

## Keep the repository and scratch project distinct

At the Mental Gym root, `pwd` should show the clone, but there is no root `Cargo.toml`. Do not run Cargo project commands there.

Create a standalone package in a temporary location instead. These commands use `/tmp` on macOS and Linux; on Windows, choose a directory outside the clone.

```sh
cd /tmp
cargo new --vcs none mental-gym-rust-start
cd mental-gym-rust-start
```

If that directory already exists, choose a new scratch name. Cargo creates this layout:

```text
mental-gym-rust-start/
├── Cargo.toml
└── src/
    └── main.rs
```

`Cargo.toml` is the package manifest. `src/main.rs` is the binary entry point. `--vcs none` avoids initializing another Git repository.

## Write a program and a test

Replace `src/main.rs` with:

```rust
fn checked_double(value: i32) -> Option<i32> {
    value.checked_mul(2)
}

fn main() {
    match checked_double(21) {
        Some(answer) => println!("Double: {answer}"),
        None => println!("The result does not fit in i32"),
    }
}

#[cfg(test)]
mod tests {
    use super::checked_double;

    #[test]
    fn doubles_a_small_value() {
        assert_eq!(checked_double(21), Some(42));
    }
}
```

Run these commands **inside `/tmp/mental-gym-rust-start`**, the directory containing this scratch `Cargo.toml`:

```sh
cargo run
cargo test
```

Expected program output:

```text
Double: 42
```

The test summary should include:

```text
test result: ok. 1 passed; 0 failed
```

Cargo may print build status and executable paths around those lines. The official [Hello, Cargo! chapter](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html) explains `cargo new`, `build`, `run`, and `check`; the [Cargo testing guide](https://doc.rust-lang.org/cargo/guide/tests.html) explains unit and integration test locations.

## Read the first Rust syntax

- `fn checked_double(value: i32) -> Option<i32>` declares a function from a signed 32-bit integer to either `Some(i32)` or `None`.
- `checked_mul` reports overflow as `None` instead of wrapping or panicking.
- `match` must cover both `Option` variants.
- `println!` and `assert_eq!` are macros; the `!` is part of their names.
- `#[cfg(test)]` compiles the test module only for test builds.
- `use super::checked_double` brings the parent module's private function into the test module.

Rust's [official `Option` documentation](https://doc.rust-lang.org/std/option/) lists its variants and helpers. You do not need to memorize them yet; notice that absence is visible in the type and control flow.

## Useful Cargo commands

Run these from a Cargo package directory:

```sh
cargo check   # type-check and borrow-check without producing the final executable
cargo run     # build and run the binary
cargo test    # build and run tests
cargo fmt     # format Rust source
```

`cargo check` is the fast feedback loop while editing. Run `cargo test` before you call an exercise complete.

## Troubleshooting

**`cargo: command not found` or `rustc: command not found`** — Restart the terminal after installing. `rustup` normally places tools in `.cargo/bin` under your user directory and adds that directory to `PATH`; follow the official install page if the change did not take effect.

**`could not find Cargo.toml`** — You are in the wrong directory. Change into `/tmp/mental-gym-rust-start`, not the Mental Gym root.

**`destination already exists` from `cargo new`** — Choose a different scratch directory name, or continue in the existing one only if it contains this exercise.

**A linker error appears** — Rust itself is installed, but native linker tools are missing. Follow the platform-specific prerequisites in the Rust Book installation chapter; macOS commonly needs the Xcode command-line tools, Linux a GCC or Clang toolchain, and Windows the requested Visual Studio C++ tools.

**The test says `0 passed`** — Check that `#[test]` is directly above the function and that the test is inside the `#[cfg(test)] mod tests` block.

## Where this fits in Mental Gym

The scratch Cargo package is local practice; it does not feed the Astro site. Mental Gym currently has a Rust learning track and reference notes, but its problem pages have no Rust solution tabs. Do not expect this exercise to appear on the site.

Next, read [Rust Essentials](../rust-essentials/) for ownership, borrowing, slices, strings, enums, iterators, and collections. Return to the [Rust learning track](../../learn/rust/) at any time, or use the [Rust DSA toolkit](../rust-dsa-toolkit/) after the foundations feel familiar.
