---
title: Space Complexity Questions for DSA Assessments
slug: space-complexity-questions
description: Graded space complexity drills with hidden answers — covering auxiliary vs. total space, recursion stacks, traversals, hidden allocations, and code trade-offs.
category: Complexity
order: 5
status: stable
tags:
  - complexity
  - interview-prep
  - memory
---

# Space Complexity Questions for DSA Assessments

Use this note to **drill space complexity** for interviews and coding assessments. For the full mental model, stack traces, and language memory guides, see [Space Complexity](../space-complexity/).

> **The 90% mental checklist:** Before answering any space question, ask three things:
> 1. *Am I allocating a collection that grows with $n$?* (list, hash map, set, DP table) $\to$ usually $O(n)$ or $O(nm)$.
> 2. *Am I recursing?* $\to$ add $O(\text{max call-stack depth})$.
> 3. *Am I only keeping a fixed number of variables/pointers?* $\to$ $O(1)$ auxiliary.

---

## Core Concept Drills

### Q1. What is the difference between auxiliary space and total space?

<details>
<summary>Show answer</summary>

- **Auxiliary space:** Extra memory allocated by the algorithm beyond the input (helper data structures, variables, call stack).
- **Total space:** Input space + auxiliary space.

In interviews, "space complexity" usually means **auxiliary space** — always clarify if unsure.

</details>

### Q2. What does "in-place" mean? Give examples and counter-examples.

<details>
<summary>Show answer</summary>

**In-place** means $O(1)$ **auxiliary** space (not zero total space — the input still takes $O(n)$).

- **In-place ($O(1)$ auxiliary):** bubble sort, insertion sort, heap sort, reversing an array with two pointers.
- **Not strictly $O(1)$:** merge sort ($O(n)$ merge buffer), standard recursive quicksort ($O(\log n)$ average / $O(n)$ worst call stack).

</details>

### Q3. What is the space complexity of declaring a scalar variable inside a `for` loop that runs $n$ times?

<details>
<summary>Show answer</summary>

**$O(1)$.** The variable is overwritten/reused on each iteration — it does not accumulate $n$ simultaneous copies in memory.

</details>

### Q4. When should the return value (output) count toward space complexity?

<details>
<summary>Show answer</summary>

If the problem requires returning a collection of size $k$ (e.g., all $n$ results or all $2^n$ subsets), interviewers often exclude the output from **auxiliary** space because any valid solution must allocate it. State both clearly: *"O(1) auxiliary space excluding the $O(n)$ output."*

</details>

---

## Recursion & Traversal Drills

### Q5. Compare the space complexity of recursive factorial vs. recursive binary search.

<details>
<summary>Show answer</summary>

- **Recursive factorial:** $O(n)$ — each call reduces $n$ by 1, so $n$ frames sit on the call stack simultaneously.
- **Recursive binary search:** $O(\log n)$ — each call halves the search range, so at most $\lfloor \log_2 n \rfloor + 1$ frames are live at once.

</details>

### Q6. Binary tree DFS space complexity

What is the auxiliary space complexity of `max_depth` on a binary tree of $n$ nodes?

```python
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```
```julia
function max_depth(root)
    root === nothing && return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
end
```
```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```
```rust
struct TreeNode {
    val: i32,
    left: Option<Box<TreeNode>>,
    right: Option<Box<TreeNode>>,
}

fn max_depth(root: Option<&TreeNode>) -> usize {
    match root {
        None => 0,
        Some(node) => 1 + max_depth(node.left.as_deref()).max(max_depth(node.right.as_deref())),
    }
}
```

<details>
<summary>Show answer</summary>

**$O(h)$** where $h$ is the tree height (call stack holds one root-to-leaf path at a time):
- **Balanced tree:** $h = O(\log n) \implies O(\log n)$ space.
- **Skewed tree (degenerate linked list):** $h = n \implies O(n)$ space.

</details>

### Q7. Compare BFS vs. DFS space complexity on trees and on general graphs.

<details>
<summary>Show answer</summary>

- **Trees:** BFS uses $O(w)$ where $w$ is the maximum width ($O(n)$ on a balanced binary tree, $O(1)$ on a chain). DFS uses $O(h)$ where $h$ is the height ($O(\log n)$ on a balanced tree, $O(n)$ on a chain).
- **Graphs:** Both use **$O(V)$** worst-case space (BFS for its queue + visited set; DFS for its recursion/explicit stack + visited set).

</details>

### Q8. What is the space complexity of generating and storing all subsets of an $n$-element set?

<details>
<summary>Show answer</summary>

- **Output storage:** $O(n \cdot 2^n)$ — there are $2^n$ subsets with an average size of $n/2$.
- **Auxiliary space (excluding output):** $O(n)$ for the backtracking call stack and current working subset.

</details>

---

## Hidden Allocations & Code Trade-Off Drills

### Q9. What is the space complexity of creating a substring or array slice?

<details>
<summary>Show answer</summary>

**Language-dependent:**
- **Python, Julia (`arr[a:b]`), TypeScript (`slice`):** $O(k)$ where $k$ is the slice length — they allocate and copy.
- **Rust (`&arr[a..b]`, `&s[a..b]`), Julia (`@view arr[a:b]`):** $O(1)$ — they borrow a view into the existing memory without copying.

Passing copies into recursive calls (e.g. `f(arr[1:])`) silently creates $O(n^2)$ total allocation overhead.

</details>

### Q10. What is the space complexity of DP memoisation, and when can you compress it?

<details>
<summary>Show answer</summary>

Typically $O(\text{number of states})$: $O(n)$ for 1D DP, $O(n \cdot m)$ for 2D DP. When each state only depends on the previous row (or previous 1–2 states, as in Fibonacci or 0/1 Knapsack), you can drop a dimension — turning $O(nm) \to O(m)$ or $O(n) \to O(1)$ with rolling arrays/variables.

</details>

### Q11. Code drill — Two Sum

What is the auxiliary space complexity of this solution, and what is the trade-off if you want $O(1)$ auxiliary space?

```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
```
```julia
function two_sum(nums, target)
    seen = Dict{Int, Int}()
    for (i, num) in enumerate(nums)
        if haskey(seen, target - num)
            return [seen[target - num], i]
        end
        seen[num] = i
    end
    return nothing
end
```
```ts
function twoSum(nums: number[], target: number): number[] | undefined {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const j = seen.get(target - nums[i]);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return undefined;
}
```
```rust
use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    let mut seen = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        if let Some(&j) = seen.get(&(target - num)) {
            return Some((j, i));
        }
        seen.insert(num, i);
    }
    None
}
```

<details>
<summary>Show answer</summary>

- **Hash map approach:** $O(n)$ auxiliary space for `seen`, buying $O(n)$ time.
- **$O(1)$ auxiliary space alternative:** Either brute-force pairs ($O(n^2)$ time), or—if returning values rather than original indices—sort in-place ($O(n \log n)$ time) and use two pointers.

</details>

### Q12. Code drill — Reverse list in-place vs. recursively

```python
def reverse_list(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```
```julia
function reverse_list!(arr)
    left, right = 1, length(arr)
    while left < right
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    end
end
```
```ts
function reverseList(arr: number[]): void {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
    left += 1;
    right -= 1;
  }
}
```
```rust
fn reverse_list(arr: &mut [i32]) {
    if arr.is_empty() { return; }
    let (mut left, mut right) = (0, arr.len() - 1);
    while left < right {
        arr.swap(left, right);
        left += 1;
        right -= 1;
    }
}
```

What is the auxiliary space here, and how does reversing a **linked list** iteratively vs. recursively compare?

<details>
<summary>Show answer</summary>

- **Array two-pointer swap:** $O(1)$ auxiliary space (only `left`, `right`, and a swap temp).
- **Linked list reversal:** Iterative pointer rewiring is $O(1)$ auxiliary space; recursive reversal uses $O(n)$ call-stack space.

</details>
