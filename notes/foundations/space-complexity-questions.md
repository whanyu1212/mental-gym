---
title: Space Complexity Questions for DSA Assessments
slug: space-complexity-questions
description: A collection of common space complexity interview questions, patterns, and Python-specific memory considerations.
category: Complexity
order: 5
status: stable
tags:
  - complexity
  - interview-prep
  - memory
---

# Space Complexity Questions for DSA Assessments

## Common Question Types

### 1. Auxiliary Space vs Total Space
- **What is the difference between auxiliary space and total space?**
  - Auxiliary space: Extra space used by the algorithm (excluding input)
  - Total space: Auxiliary space + space taken by input

### 2. Recursion Stack Space
- **What is the space complexity of a recursive function?**
  - Consider the maximum depth of the recursion call stack
  - Example: Recursive factorial → O(n) due to n stack frames
  - Example: Recursive binary search → O(log n) due to halving

### 3. In-Place Algorithms
- **What does "in-place" mean?**
  - Algorithm uses O(1) auxiliary space
  - Examples: Bubble sort, insertion sort, heap sort
  - Counter-examples: Merge sort (O(n)), standard quicksort (O(log n) to O(n) for call stack)

### 4. Data Structure Space

| Data Structure | Space Complexity |
|----------------|------------------|
| Array | O(n) |
| Linked List | O(n) |
| Hash Table | O(n) |
| Binary Tree | O(n) |
| Graph (Adjacency List) | O(V + E) |
| Graph (Adjacency Matrix) | O(V²) |
| Heap | O(n) |
| Trie | O(alphabet_size × key_length × n) |

### 5. Algorithm-Specific Questions

#### Sorting Algorithms
| Algorithm | Space Complexity | Notes |
|-----------|------------------|-------|
| Merge Sort | O(n) | Requires auxiliary array |
| Quick Sort | O(log n) to O(n) | Call stack depth |
| Heap Sort | O(1) | In-place |
| Counting Sort | O(k) | k = range of input |
| Radix Sort | O(n + k) | k = range of digits |

#### Tree/Graph Traversals
- BFS: O(w) where w = maximum width of tree, or O(V) for graphs
- DFS: O(h) where h = height of tree, or O(V) for graphs
- Iterative with explicit stack: Same as recursive space

### 6. Tricky Questions

**Q: What's the space complexity of creating a substring?**
- Language-dependent: Some languages share memory, others copy

**Q: What's the space complexity of int variables in a loop?**
- O(1) - variables are reused each iteration

**Q: Space complexity of storing all subsets of a set?**
- O(2^n × n) - 2^n subsets, each up to size n

**Q: Space for memoization in dynamic programming?**
- Usually O(n) for 1D, O(n×m) for 2D problems

### 7. Common Pitfalls

1. **Forgetting recursion stack space** - Always count call stack depth
2. **Ignoring input modification** - If you modify input, clarify if it counts
3. **Language-specific behaviors** - String immutability, garbage collection
4. **Hidden allocations** - Slicing arrays, string concatenation

### 8. Practice Problems

1. Reverse a linked list → O(1) iterative, O(n) recursive
2. Find duplicates in array → O(1) if modify input, O(n) with hash set
3. Level order traversal → O(w) where w = max width
4. DFS on graph → O(V) for visited set + O(V) for stack
5. Two-pointer technique → Usually O(1) auxiliary space

---

## Python-Focused Guide

*For developers coming from a Python background who aren't familiar with low-level memory concepts.*

### Mindset Shift

Python hides memory details, but the costs still exist. When you call `list.append()` or add to a dictionary, memory is allocated—you just don't see it.

**Key principle:** Don't think in bytes. Think about *what grows with input size*.

### Quick Reference: Python Operations

| What you're doing | Space Cost | Why |
|-------------------|------------|-----|
| Single variable (`x = 5`) | O(1) | Fixed size |
| Loop counter (`for i in range(n)`) | O(1) | Reused each iteration |
| New list of size n (`[0] * n`) | O(n) | n elements stored |
| Dictionary with n keys | O(n) | n key-value pairs |
| Set with n elements | O(n) | n elements stored |
| Recursive call | O(depth) | Each call adds a stack frame |
| List slicing (`arr[1:n]`) | O(n) | **Creates a copy!** |
| String concatenation in loop | O(n) per concat | Strings are immutable |

### Language-Specific Gotchas

The same everyday operations cost different amounts in each language. Switch tabs to compare: slicing copies in Python, Julia, and TypeScript, but Rust slices are borrowed views.

```python
# O(n) space - creates new list
new_list = [x * 2 for x in arr]

# O(1) space - generator, evaluates lazily
gen = (x * 2 for x in arr)

# O(n) space - slicing COPIES the data
half = arr[:len(arr)//2]

# O(1) space - just two integer pointers
left, right = 0, len(arr) - 1

# O(n) space - each concat creates new string
result = ""
for char in arr:
    result += char  # Bad! Use ''.join() instead

# O(n) space but efficient - single allocation
result = ''.join(arr)  # Good!
```
```julia
# O(n) space - comprehension builds a new array
new_list = [x * 2 for x in arr]

# O(1) space - generator, evaluates lazily
gen = (x * 2 for x in arr)

# O(n) space - slicing COPIES the data
half = arr[1:length(arr) ÷ 2]

# O(1) space - @view shares the parent's memory instead
half_view = @view arr[1:length(arr) ÷ 2]

# O(n) space - broadcasting allocates a new array...
doubled = arr .* 2
# O(1) extra space - ...unless you write into an existing one
arr .*= 2

# O(1) space - just two integer indices (Julia is 1-based)
left, right = 1, length(arr)

# O(n) space - each concat creates a new string
result = ""
for char in chars
    result *= char  # Bad! Use join(chars) or an IOBuffer instead
end

# O(n) space but efficient - single allocation
result = join(chars)  # Good!
```
```ts
// O(n) space - map builds a new array
const newList = arr.map((x) => x * 2);

// O(1) space - generator, evaluates lazily
function* doubledLazily(xs: number[]) {
  for (const x of xs) yield x * 2;
}
const gen = doubledLazily(arr);

// O(n) space - slice COPIES the data, and so does spread
const half = arr.slice(0, Math.floor(arr.length / 2));
const copy = [...arr];

// O(1) space - just two integer pointers
let left = 0;
let right = arr.length - 1;

// Usually fine: engines like V8 represent += results as "ropes", so a loop
// of concatenations doesn't copy the whole string each time
let result = "";
for (const char of chars) {
  result += char;
}

// O(n) space - one join at the end is the portable choice
const joined = chars.join("");
```
```rust
// O(n) space - collect builds a new Vec
let new_list: Vec<i32> = arr.iter().map(|x| x * 2).collect();

// O(1) space - iterators are lazy until something consumes them
let lazy = arr.iter().map(|x| x * 2);

// O(1) space - a slice BORROWS the data, no copy
let half = &arr[..arr.len() / 2];

// O(n) space - .to_vec() (or .clone()) is the explicit copy
let half_copy = arr[..arr.len() / 2].to_vec();

// O(1) space - just two integer indices
// (arr.len() - 1 underflows and panics on an empty slice: check first)
let (left, right) = (0, arr.len() - 1);

// Amortised O(1) per push: String is a growable buffer, not immutable
let mut result = String::new();
for &c in chars {
    result.push(c);
}

// O(n) space - one allocation, sized from the iterator
let result: String = chars.iter().collect();
```

### Questions to Ask Yourself

1. **Am I creating a new collection (list, dict, set)?** → Probably O(n)
2. **Am I using recursion?** → Add O(max depth) for the call stack
3. **Am I modifying the input in-place?** → Could be O(1) auxiliary
4. **Am I using a hash set/dict for lookups?** → O(n) space trade-off for O(1) time

### Common Patterns and Their Space

| Pattern | Typical Space | Python Example |
|---------|---------------|----------------|
| Two pointers | O(1) | `left, right = 0, len(arr)-1` |
| Hash map for lookup | O(n) | `seen = {}` or `seen = set()` |
| Recursion | O(depth) | Any recursive function |
| BFS with queue | O(width) | `from collections import deque` |
| DFS with stack | O(depth) | Explicit stack or recursion |
| DP memoization | O(states) | `@lru_cache` or manual dict |
| Building result | O(n) | `result = []` then append |

### The 90% Rule

For most DSA assessments, space complexity boils down to:

1. **O(1)** - You're only using a fixed number of variables
2. **O(n)** - You're using a hash map, set, or building a result list
3. **O(depth)** - You're using recursion (depth could be n, log n, etc.)

### Worked Examples

**Example 1: Two Sum**
```python
def two_sum(nums, target):
    seen = {}  # O(n) space - hash map
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
# Space: O(n) for the hash map
```
```julia
function two_sum(nums, target)
    seen = Dict{Int, Int}()  # O(n) space - hash map
    for (i, num) in enumerate(nums)
        if haskey(seen, target - num)
            return [seen[target - num], i]
        end
        seen[num] = i
    end
    return nothing
end
# Space: O(n) for the hash map (indices are 1-based)
```
```ts
function twoSum(nums: number[], target: number): number[] | undefined {
  const seen = new Map<number, number>();  // O(n) space - hash map
  for (let i = 0; i < nums.length; i++) {
    const j = seen.get(target - nums[i]);
    if (j !== undefined) {
      return [j, i];
    }
    seen.set(nums[i], i);
  }
  return undefined;
}
// Space: O(n) for the hash map
```
```rust
use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    let mut seen = HashMap::new();  // O(n) space - hash map
    for (i, &num) in nums.iter().enumerate() {
        if let Some(&j) = seen.get(&(target - num)) {
            return Some((j, i));
        }
        seen.insert(num, i);
    }
    None
}
// Space: O(n) for the hash map
```

**Example 2: Reverse List In-Place**
```python
def reverse_list(arr):
    left, right = 0, len(arr) - 1  # O(1)
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
# Space: O(1) - only using two pointers
```
```julia
function reverse_list!(arr)
    left, right = 1, length(arr)  # O(1)
    while left < right
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    end
end
# Space: O(1) - only using two pointers
```
```ts
function reverseList(arr: number[]): void {
  let left = 0;
  let right = arr.length - 1;  // O(1)
  while (left < right) {
    const tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
    left += 1;
    right -= 1;
  }
}
// Space: O(1) - only using two pointers
```
```rust
fn reverse_list(arr: &mut [i32]) {
    if arr.is_empty() {
        return;
    }
    let (mut left, mut right) = (0, arr.len() - 1);  // O(1)
    while left < right {
        arr.swap(left, right);
        left += 1;
        right -= 1;
    }
}
// Space: O(1) - only using two pointers
```

**Example 3: Binary Tree DFS**
```python
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
# Space: O(h) where h = height of tree (recursion stack)
# Worst case: O(n) for skewed tree
# Best case: O(log n) for balanced tree
```
```julia
function max_depth(root)
    if root === nothing
        return 0
    end
    return 1 + max(max_depth(root.left), max_depth(root.right))
end
# Space: O(h) where h = height of tree (recursion stack)
# Worst case: O(n) for skewed tree
# Best case: O(log n) for balanced tree
```
```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function maxDepth(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
// Space: O(h) where h = height of tree (recursion stack)
// Worst case: O(n) for skewed tree
// Best case: O(log n) for balanced tree
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
// Space: O(h) where h = height of tree (recursion stack)
// Worst case: O(n) for skewed tree
// Best case: O(log n) for balanced tree
```

---

## Key Takeaways

- Always clarify if question asks for auxiliary or total space
- Recursion depth = stack space
- Hash maps/sets add O(n) space
- In-place doesn't mean O(0), it means O(1) auxiliary
- Consider worst-case scenarios (unbalanced trees, bad pivot choices)
- In Python: watch out for slicing (copies data) and string concatenation (immutable)
- In other languages: Julia and TypeScript slices copy too (Julia's `@view` doesn't), while Rust slices are borrowed views and copying is always explicit (`.to_vec()`, `.clone()`)
