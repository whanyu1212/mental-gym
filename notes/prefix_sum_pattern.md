---
title: Prefix Sum Pattern
description: A guide to the Prefix Sum pattern for efficient range sum queries in 1D, 2D, and 3D arrays.
category: Patterns
---

# Prefix Sum Pattern

The **Prefix Sum** pattern is an incredibly powerful technique in algorithmic problem solving, particularly for array and matrix questions involving range queries.

At its core, a prefix sum array is a new array where the element at index `i` stores the sum of all elements in the original array from index `0` up to `i`.

## Why is it useful?
The primary advantage of the prefix sum is that it allows you to calculate the sum of elements in any contiguous subarray (or submatrix) in **$O(1)$ constant time**, after an initial $O(N)$ preprocessing step.

Without a prefix sum, finding the sum of elements between indices `i` and `j` would require a loop, taking $O(K)$ time where $K$ is the length of the subarray. If you have many queries, this becomes highly inefficient.

---

## 1D Prefix Sum

### Concept
Given an array `A` of size `N`:
`PrefixSum[i] = A[0] + A[1] + ... + A[i]`

### Construction
You can build the prefix sum array iteratively:
```python
def build_prefix_sum(arr):
    n = len(arr)
    if n == 0: return []

    prefix = [0] * n
    prefix[0] = arr[0]

    for i in range(1, n):
        prefix[i] = prefix[i-1] + arr[i]

    return prefix
```

*Note: Often, it's convenient to make the prefix sum array size `N + 1` and set `prefix[0] = 0`. This simplifies range sum queries because you don't need to handle `i=0` as a special edge case.*

```python
def build_prefix_sum_padded(arr):
    n = len(arr)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i+1] = prefix[i] + arr[i]
    return prefix
```

### Range Query
To find the sum of elements from index `L` to `R` (inclusive) using the padded prefix array:
`Sum(L, R) = PrefixSum[R + 1] - PrefixSum[L]`

**Example:**
`A = [1, 2, 3, 4, 5]`
`Prefix = [0, 1, 3, 6, 10, 15]`

Sum from index 1 to 3 (`[2, 3, 4]`, expected sum = 9):
`Sum(1, 3) = Prefix[4] - Prefix[1] = 10 - 1 = 9`

---

## 2D Prefix Sum (Prefix Matrix)

The concept extends to two dimensions, which is incredibly useful for finding the sum of elements in any rectangular subgrid of a matrix.

### Concept
Given a matrix `M`, the 2D prefix sum matrix `P` at `P[i][j]` stores the sum of all elements in the submatrix bounded by `(0, 0)` at the top-left and `(i, j)` at the bottom-right.

### Construction
To build `P[i][j]`, we use the principle of inclusion-exclusion:
1. Add the current element `M[i][j]`.
2. Add the prefix sum of the area above: `P[i-1][j]`.
3. Add the prefix sum of the area to the left: `P[i][j-1]`.
4. The overlap area `P[i-1][j-1]` was added twice (once in step 2, once in step 3), so we must **subtract** it.

**Formula:**
`P[i][j] = M[i][j] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]`

**Visualization:**
```text
Original Matrix M        Prefix Sum Matrix P
[1] [2] [3]              [ 1] [ 3] [ 6]
[4] [5] [6]      --->    [ 5] [12] [21]
[7] [8] [9]              [12] [27] [45]

How to calculate P[1][1] (which is 12):
P[1][1] = M[1][1] + P[0][1] + P[1][0] - P[0][0]
   12   =    5    +    3    +    5    -    1

Visualizing the inclusion-exclusion for P[1][1]:
+---+---+        +---+---+      +---+---+      +---+---+
| 1 | 2 |        | 1 | 3 |      | 1 | 2 |      | 1 | x |
+---+---+   =    +---+---+  +   +---+---+  -   +---+---+  +  [5] (M[1][1])
| 4 | 5 |        | x | x |      | 5 | x |      | x | x |
+---+---+        +---+---+      +---+---+      +---+---+
 P[1][1]          P[0][1]        P[1][0]        P[0][0]
```

*(Just like the 1D case, padding the matrix with an extra row of 0s at the top and an extra column of 0s on the left significantly simplifies the code by avoiding out-of-bounds checks.)*

```python
def build_2d_prefix_sum(matrix):
    rows, cols = len(matrix), len(matrix[0])
    # Pad with an extra row and column of zeros
    P = [[0] * (cols + 1) for _ in range(rows + 1)]

    for r in range(rows):
        for c in range(cols):
            P[r+1][c+1] = (
                matrix[r][c]
                + P[r][c+1]
                + P[r+1][c]
                - P[r][c]
            )

    return P
```

### Range Query
To find the sum of elements inside the rectangle defined by top-left `(r1, c1)` and bottom-right `(r2, c2)`, we again use inclusion-exclusion.

Start with the sum of the large rectangle from `(0, 0)` to `(r2, c2)`. Then, subtract the area above the target rectangle, subtract the area to the left of the target rectangle, and add back the overlapping top-left corner that was subtracted twice.

**Formula (using the padded matrix `P`):**
`Sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]`

**Visualization:**
```text
Query sum of submatrix from (1,1) to (2,2) in Original M:
(We want the sum of elements: M[1][1], M[1][2], M[2][1], M[2][2])

M = [1] [2] [3]
    [4] [5] [6]  <-- top-left (1,1)
    [7] [8] [9]  <-- bottom-right (2,2)
Expected Sum = 5 + 6 + 8 + 9 = 28

Using the unpadded Prefix Matrix P from the previous example:
P = [ 1] [ 3] [ 6]
    [ 5] [12] [21]
    [12] [27] [45]

Sum = P[2][2] - P[0][2] - P[2][0] + P[0][0]
    =   45    -    6    -   12    +    1
    = 28

Visualizing the query for P[2][2] - P[0][2] - P[2][0] + P[0][0]:
+----+----+----+    +----+----+----+    +----+----+----+    +----+----+----+
|  1 |  3 |  6 |    |  1 |  3 |  6 |    |  1 |  x |  x |    |  1 |  x |  x |
+----+----+----+    +----+----+----+    +----+----+----+    +----+----+----+
|  5 | 12 | 21 | -  |  x |  x |  x | -  |  5 |  x |  x | +  |  x |  x |  x |
+----+----+----+    +----+----+----+    +----+----+----+    +----+----+----+
| 12 | 27 | 45 |    |  x |  x |  x |    | 12 |  x |  x |    |  x |  x |  x |
+----+----+----+    +----+----+----+    +----+----+----+    +----+----+----+
    P[2][2]             P[0][2]             P[2][0]             P[0][0]
 (Whole area)       (Top area to       (Left area to      (Top-left corner
                     subtract)          subtract)          added back)
```

---

## 3D Prefix Sum (Prefix Cube)

While rarely seen in standard interviews, the concept extends to 3 dimensions. It operates on a 3D grid (a cube) and is often found in advanced competitive programming.

### Concept
Given a 3D grid `M`, the prefix cube `P` at `P[i][j][k]` stores the sum of all elements in the sub-cube bounded by `(0, 0, 0)` and `(i, j, k)`.

### Construction
Because this is 3D, the inclusion-exclusion principle requires $2^3 = 8$ terms to calculate the volume. You add the three intersecting "faces", subtract the three overlapping "edges" that were added twice, and finally add back the single "corner" that was subtracted out entirely.

**Formula (using padded matrix):**
```python
P[i+1][j+1][k+1] = (
    M[i][j][k]
    + P[i][j+1][k+1] + P[i+1][j][k+1] + P[i+1][j+1][k]  # Add 3 faces
    - P[i][j][k+1] - P[i][j+1][k] - P[i+1][j][k]        # Subtract 3 edges
    + P[i][j][k]                                        # Add 1 corner
)
```

### Range Query
To find the sum of elements inside a 3D bounding box defined by `(x1, y1, z1)` and `(x2, y2, z2)`, you again use the 8 terms of inclusion-exclusion.

**Formula (using padded matrix P):**
```python
Sum = (
    P[x2+1][y2+1][z2+1]
    - P[x1][y2+1][z2+1] - P[x2+1][y1][z2+1] - P[x2+1][y2+1][z1]
    + P[x1][y1][z2+1] + P[x1][y2+1][z1] + P[x2+1][y1][z1]
    - P[x1][y1][z1]
)
```

---

## Variations and Related Patterns

1.  **Product of Array Except Self (LeetCode 238):** While not strictly a sum, computing "prefix products" and "suffix products" is a direct application of this pattern. By precomputing products from the left (prefix) and from the right (suffix), you can find the product of all elements except the current one in $O(1)$ time per element, strictly avoiding division.
2.  **Subarray Sum Equals K (LeetCode 560):** You can use a hash map alongside a running prefix sum to efficiently count the number of subarrays that sum to exactly `k` in $O(N)$ time. Instead of nested loops, you check if `current_prefix_sum - k` exists in your frequency hash map.
3.  **Difference Array (e.g., LeetCode 370 - Range Addition):** The inverse of a prefix sum. It's used when you need to apply multiple range updates (e.g., "add X to all elements between index L and R") efficiently. Instead of updating every element, you add $X$ at index $L$ and subtract $X$ at $R+1$. After all updates, computing the prefix sum of the difference array yields the final updated array.
4.  **Continuous Subarray Sum / Modulo Arithmetic (LeetCode 523):** Similar to Subarray Sum Equals K, but tracking the prefix sum modulo $K$. If the same modulo result is seen twice at least two indices apart, a valid subarray exists.
5.  **Matrix Block Sum (LeetCode 1074):** A direct application of the 2D prefix sum. Given a matrix, return a new matrix where each element is the sum of a block bounded by a distance `k` from the element.
