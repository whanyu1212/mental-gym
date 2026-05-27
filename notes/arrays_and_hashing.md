---
title: Arrays & Hashing
description: Core patterns, data structures, and decision frameworks for the Arrays & Hashing topic in NeetCode 250.
category: Patterns
order: 1
---

# Arrays & Hashing

This note covers the patterns, data structures, and decision logic needed for the Arrays & Hashing section of NeetCode 250. Complexity analysis, Python built-ins, and prefix sums already have their own dedicated notes — this note focuses on the *hashing-specific strategy* and the problem patterns that compose this topic.

---

## Why Hashing Matters for Arrays

Raw array operations are O(n) for search and membership. The core trade-off of this entire topic is:

> **Spend O(n) extra space to build a hash structure → gain O(1) average-case lookup.**

This swap unlocks a wide class of problems that would otherwise require O(n²) brute force.

Python's `dict` and `set` are both hash tables under the hood. Knowing which to reach for, and what key to use, is the central skill.

---

## Hash Table Internals (What the Interview Asks)

Understanding how a hash table works at one level below Python's API matters when you're asked to **implement one from scratch** (LeetCode 705, 706).

### Hash Function

Maps a key to a bucket index:

```python
index = key % capacity  # simplest form
```

A good hash function distributes keys uniformly. Poor distribution causes many keys to land in the same bucket (collision).

### Collision Resolution: Separate Chaining

Each bucket holds a **list** of `(key, value)` pairs. On collision, you append to that list and search it linearly.

```python
self.hash_table = [[] for _ in range(capacity)]
# ^ CORRECT: n distinct lists

# [[]] * n is WRONG — all n slots point to the same list object
```

### HashSet vs HashMap

| | HashSet | HashMap |
|---|---|---|
| Stores | Keys only | Key-value pairs |
| `add` | Check key not in bucket, append key | Check if key exists → update value, else append pair |
| `get` | N/A | Iterate bucket, return matching value |
| `remove` | `del bucket[i]` | Same |

The only structural difference is that HashMap buckets store `(key, value)` tuples and must handle **updates** in `put`.

---

## Core Patterns

### 1. Complement Lookup (Two Sum family)

**Idea:** Instead of searching for a partner for each element (O(n²)), store what you *need* and check if you've already seen it.

```python
# Two Sum — O(n) time, O(n) space
seen = {}  # value → index
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
```

**Why dict over set here:** You need the *index*, not just the value's existence.

**Generalizes to:** Any problem asking "does a partner exist?" — reframe the question as "have I seen `target - x`?"

---

### 2. Frequency Counting

**Idea:** Count occurrences with a dict or `Counter`. Then reason about the counts.

```python
from collections import Counter
freq = Counter(nums)

# or manually:
freq = {}
for x in nums:
    freq[x] = freq.get(x, 0) + 1
```

**When counts are the answer:**
- Top K Frequent → build `(count, value)` pairs, sort or use a heap
- Valid Anagram → two strings are anagrams iff their frequency maps are equal
- Majority Element → element whose count exceeds `n // 2` or `n // 3`

**Bucket sort trick for Top K Frequent (O(n)):**
Instead of sorting by frequency (O(n log n)), create an array of buckets where `bucket[freq]` holds all numbers with that frequency. Scan from high to low:

```python
bucket = [[] for _ in range(len(nums) + 1)]
for num, count in freq.items():
    bucket[count].append(num)

result = []
for count in range(len(bucket) - 1, 0, -1):
    for num in bucket[count]:
        result.append(num)
        if len(result) == k:
            return result
```

---

### 3. Grouping by Canonical Key

**Idea:** Two items that belong together share a *canonical form*. Use that form as the hash key.

**Anagram grouping:**
All anagrams of a word contain the same characters in the same frequencies. Two canonical keys work:

| Key | How | Cost |
|---|---|---|
| Sorted string | `tuple(sorted(s))` | O(k log k) per string |
| Character count | `tuple([0]*26 counts)` | O(k) per string — faster |

```python
# Group Anagrams — character count key
result = defaultdict(list)
for s in strs:
    count = [0] * 26
    for char in s:
        count[ord(char) - ord('a')] += 1
    result[tuple(count)].append(s)
```

**Why `tuple` and not `list`:** Lists are mutable and therefore not hashable. Tuples are frozen and can be dict keys.

**The pattern:** Ask "what property do things in the same group share?" → that property becomes the key.

---

### 4. Set Membership for Sequence Problems

**Idea:** Convert array to a set for O(1) lookups. Then walk through the data with a controlled condition to avoid redundant work.

**Longest Consecutive Sequence:**
The key insight is: only *start* counting from a number `n` if `n-1` is **not** in the set. This ensures each sequence is counted exactly once — no matter how many numbers are in the array.

```python
nums_set = set(nums)
longest = 0

for num in nums_set:
    if num - 1 not in nums_set:      # this is the sequence start
        length = 1
        while num + length in nums_set:
            length += 1
        longest = max(longest, length)
```

Without the `num - 1 not in nums_set` guard, you'd restart counting from every element in the same sequence — making it O(n²) instead of O(n).

---

### 5. Multi-Constraint Hashing (Valid Sudoku)

**Idea:** A cell's value must be unique across three independent constraints simultaneously: its row, its column, and its 3×3 box. Model each constraint as a separate set and index them by their identifier.

```python
rowset    = defaultdict(set)   # row_index → seen digits
colset    = defaultdict(set)   # col_index → seen digits
squareset = defaultdict(set)   # (row//3, col//3) → seen digits

for i in range(9):
    for j in range(9):
        val = board[i][j]
        if val == '.': continue
        box_key = (i // 3, j // 3)
        if val in rowset[i] or val in colset[j] or val in squareset[box_key]:
            return False
        rowset[i].add(val)
        colset[j].add(val)
        squareset[box_key].add(val)
```

**Box key formula:** `(row // 3, col // 3)` maps the 9 rows into groups `{0,1,2}` and the 9 columns into groups `{0,1,2}`, producing 9 distinct tuples for the 9 boxes.

---

### 6. Prefix/Suffix Pass (Product Except Self)

This is covered in depth in the **Prefix Sum Pattern** note. The key idea here is avoiding division by making two passes:

```python
result = [1] * n
prefix = 1
for i in range(n):
    result[i] = prefix
    prefix *= nums[i]

postfix = 1
for i in range(n - 1, -1, -1):
    result[i] *= postfix
    postfix *= nums[i]
```

The left pass fills each slot with the product of everything to its left. The right pass multiplies in the product of everything to its right. No division, O(1) extra space (ignoring output array).

---

### 7. Boyer-Moore Voting

For **Majority Element** problems where you need O(1) space.

**Majority Element I** (appears > n/2 times — exactly one exists):

```python
candidate, count = None, 0
for num in nums:
    if count == 0:
        candidate = num
    count += 1 if num == candidate else -1
return candidate
```

**Why it works:** The majority element has more occurrences than all other elements *combined*. Every time you "cancel" a majority vote with a non-majority vote, the majority still wins. The surviving candidate after a full pass is the majority element.

**Majority Element II** (appears > n/3 times — at most 2 can exist):

Generalize with two candidates. Cancel groups of 3 *distinct* elements:

```python
c1, c2, count1, count2 = None, None, 0, 0
for num in nums:
    if num == c1:       count1 += 1
    elif num == c2:     count2 += 1
    elif count1 == 0:   c1, count1 = num, 1
    elif count2 == 0:   c2, count2 = num, 1
    else:               count1 -= 1; count2 -= 1

# Verification pass — candidates may not actually exceed n/3
threshold = len(nums) // 3
return [c for c in (c1, c2) if nums.count(c) > threshold]
```

The verification pass is required because the voting phase only eliminates non-candidates; it doesn't guarantee the survivors actually meet the threshold.

---

### 8. Length-Prefixed Encoding (Encode/Decode Strings)

**Problem:** Serialize a list of strings into one string, then deserialize back. A delimiter like `#` fails if strings contain `#`.

**Solution:** Prefix each string with its length, then the delimiter:

```
["neet", "co#de"]  →  "4#neet5#co#de"
```

During decode, read characters until you hit `#`, parse the length, then slice exactly that many characters — no ambiguity regardless of string content.

```python
def encode(strs):
    return ''.join(f"{len(s)}#{s}" for s in strs)

def decode(s):
    result, i = [], 0
    while i < len(s):
        j = s.index('#', i)
        length = int(s[i:j])
        i = j + 1
        result.append(s[i:i+length])
        i += length
    return result
```

---

### 9. Write Pointer (Remove Element)

**Idea:** When you need to remove values in-place without extra space, keep a `write` pointer that only advances when you find a value worth keeping. The `read` pointer scans everything.

```python
def removeElement(nums, val):
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write  # new length
```

`write` is always ≤ `read`, so you never overwrite an element before you've processed it. After the loop, `nums[:write]` contains the kept elements in their original relative order.

**Generalizes to:** Remove Duplicates from Sorted Array (keep when `nums[read] != nums[write-1]`), Move Zeroes (keep non-zeros, then fill tail with zeros).

---

### 10. Column-wise String Comparison (Longest Common Prefix)

**Idea:** Instead of comparing strings to each other pairwise, compare *character positions* across all strings at once. `zip(*strs)` transposes the list of strings into tuples of characters at each column:

```python
def longestCommonPrefix(strs):
    prefix = ""
    for col in zip(*strs):          # col = chars at position i across all strings
        if len(set(col)) == 1:      # all identical
            prefix += col[0]
        else:
            break
    return prefix
```

`zip` stops at the shortest string automatically — so you never index out of bounds. The `set` collapses all characters at that column; if its size is 1, every string agrees.

**Alternative — horizontal scan:** Start with `prefix = strs[0]`, then trim its tail until each subsequent string starts with it:

```python
prefix = strs[0]
for s in strs[1:]:
    while not s.startswith(prefix):
        prefix = prefix[:-1]
return prefix
```

Horizontal scan is simpler to explain in an interview; vertical scan with `zip` is more Pythonic.

---

### 11. Greedy Daily Profit (Best Time to Buy and Sell Stock II)

**Note:** Stock I (single transaction) is in the sliding window topic. Stock II allows *unlimited* transactions — different algorithm entirely.

**Idea:** You can buy and sell on consecutive days. The maximum profit equals the sum of every positive day-over-day price increase. Mathematically, this is equivalent to holding during every upswing:

```
profit = sum(max(0, prices[i] - prices[i-1]) for i in range(1, len(prices)))
```

**Why this is correct:** Any multi-day upswing `prices[a] → prices[b]` equals the sum of its daily increments. Collecting each positive daily increment is equivalent to timing the perfect entry and exit — but requires no lookahead.

```python
def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit
```

**Interview framing:** This is a greedy problem filed under arrays/hashing. The greedy choice — "collect every upward move" — is locally and globally optimal because transactions have no cost and can't overlap.

---

### 12. Index-as-Hash / Cyclic Sort (First Missing Positive)

This is the hardest problem in the topic. The constraint is O(n) time **and O(1) space**, which rules out a separate hash set.

**Key insight:** The answer must be in `[1, n+1]`. Values outside `[1, n]` are irrelevant. You can use the array *itself* as a hash table: value `v` (if in range) belongs at index `v - 1`.

**Phase 1 — place every value in its correct slot:**

```python
i = 0
while i < len(nums):
    j = nums[i] - 1                          # where nums[i] belongs
    if 1 <= nums[i] <= len(nums) and nums[i] != nums[j]:
        nums[i], nums[j] = nums[j], nums[i]  # swap into place
    else:
        i += 1                               # already correct or out of range
```

Do **not** increment `i` after a swap — the value just moved to `i` may itself need to be swapped somewhere.

**Phase 2 — scan for the first mismatch:**

```python
for i in range(len(nums)):
    if nums[i] != i + 1:
        return i + 1
return len(nums) + 1  # all of [1..n] present, answer is n+1
```

**Why it's still O(n):** Each swap moves at least one value to its final position. A value can be swapped at most once (the guard `nums[i] != nums[j]` prevents cycling on duplicates). Total swaps ≤ n.

---

## Sorting Algorithms (Sort an Array, Sort Colors)

This section appears in arrays & hashing as a "implement it yourself" problem.

### Counting Sort — O(n + k) time, O(k) space

Works when the value range `k = max - min` is reasonable. Not comparison-based, so it beats the O(n log n) lower bound for comparison sorts.

```python
min_val, max_val = min(nums), max(nums)
count = [0] * (max_val - min_val + 1)

for num in nums:
    count[num - min_val] += 1      # shift to 0-based index

i = 0
for val_offset, freq in enumerate(count):
    nums[i:i+freq] = [val_offset + min_val] * freq
    i += freq
```

### Dutch National Flag — O(n) time, O(1) space

For Sort Colors (0s, 1s, 2s only). Three-pointer, single pass:

```
Invariant: nums[0..low-1] = 0s | nums[low..mid-1] = 1s | nums[mid..high] = unknown | nums[high+1..n-1] = 2s
```

```python
low, mid, high = 0, 0, len(nums) - 1
while mid <= high:
    if nums[mid] == 0:
        nums[low], nums[mid] = nums[mid], nums[low]
        low += 1; mid += 1
    elif nums[mid] == 1:
        mid += 1
    else:
        nums[mid], nums[high] = nums[high], nums[mid]
        high -= 1
        # do NOT increment mid — swapped value from high is unexamined
```

The subtle point: after swapping with `high`, we decrement `high` but **do not** increment `mid` — the element just moved to `mid` came from the unprocessed region and hasn't been classified yet.

---

## Decision Guide: Which Structure?

| Situation | Reach for |
|---|---|
| "Does X exist?" | `set` — O(1) membership |
| "How many times does X appear?" | `dict` / `Counter` |
| "Where is X?" (need index) | `dict` mapping value → index |
| "Group things that share property P" | `defaultdict(list)` keyed by canonical form of P |
| "Track seen across multiple constraints" | One `defaultdict(set)` per constraint |
| "Need sorted output after counting" | Count with dict, sort, or bucket sort |

---

## Complexity Reference for This Topic

| Problem | Time | Space | Key Idea |
|---|---|---|---|
| Two Sum | O(n) | O(n) | Complement lookup |
| Valid Anagram | O(n) | O(1) | 26-bucket char count |
| Group Anagrams | O(n·k) | O(n·k) | Char-count tuple as key |
| Top K Frequent | O(n) | O(n) | Bucket sort by frequency |
| Product Except Self | O(n) | O(1)* | Prefix + postfix pass |
| Longest Consecutive | O(n) | O(n) | Set + start-of-sequence guard |
| Valid Sudoku | O(1) | O(1) | Fixed 9×9 board, 3 constraint sets |
| Encode/Decode Strings | O(n) | O(n) | Length-prefix encoding |
| Majority Element I | O(n) | O(1) | Boyer-Moore voting |
| Majority Element II | O(n) | O(1) | Boyer-Moore with 2 candidates |
| Sort Colors | O(n) | O(1) | Dutch National Flag |
| Sort an Array | O(n+k) | O(k) | Counting sort |
| Design HashSet / HashMap | O(n/k) avg | O(n+k) | Separate chaining |
| Remove Element | O(n) | O(1) | Write pointer |
| Longest Common Prefix | O(n·k) | O(1) | Column-wise comparison with `zip` |
| Best Time to Buy & Sell II | O(n) | O(1) | Greedy daily profit sum |
| First Missing Positive | O(n) | O(1) | Index-as-hash / cyclic sort |
| Subarray Sum Equals K | O(n) | O(n) | Running prefix sum + Counter (see Prefix Sum note) |
| Concatenation of Array | O(n) | O(n) | Direct index math |

*O(1) extra space ignoring the output array.
