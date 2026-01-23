<div align="center">

# 🧠 Mental Gym <!-- omit in toc -->

### *Building mental resilience and discipline through deliberate practice*

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Julia](https://img.shields.io/badge/Julia-9558B2?style=for-the-badge&logo=julia&logoColor=white)
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)

![DSA](https://img.shields.io/badge/DSA_Implementations-9_Topics-blueviolet?style=flat)

</div>

---

## About <!-- omit in toc -->

Documenting my journey through various coding platforms including **LeetCode**, **Kattis**, and **HackerRank**. This repository also contains implementations of common data structures and algorithms (DSA) built from scratch to strengthen fundamental understanding.

> **Note:** All problem-solving and implementations are done independently. AI tools (Claude Code) are used minimally for repository organization and documentation structure only.

---

## Table of Contents <!-- omit in toc -->

- [Notes](#notes)
- [Basics](#basics)
- [DSA from Scratch](#dsa-from-scratch)
- [](#)
- [Boilerplate Code](#boilerplate-code)
  - [Arrays](#arrays)
- [LeetCode Questions](#leetcode-questions)
- [Kattis Problems](#kattis-problems)

---

## Notes

Study notes and reference materials for DSA concepts and complexity analysis.

| Topic | Description |
|-------|-------------|
| [Asymptotic Analysis](./notes/asymptotic-analysis.md) | Big O, Big Omega, Big Theta notation with worked examples |
| [Python Big O Cheatsheet](./notes/python-big-o-cheatsheet.md) | Time complexity of common Python operations |
| [Space Complexity Questions](./notes/space-complexity-questions.md) | Common space complexity interview questions with Python focus |

---

## Basics

Foundational concepts with runnable code demonstrations.

| File | Description |
|------|-------------|
| [Time-Space Tradeoff](./src/basics/time_space_tradeoff.py) | Examples showing when to trade space for time (Two Sum, Fibonacci, etc.) |
| [Space Complexity Demo](./src/basics/space_complexity_demo.py) | Demonstrations of O(1), O(n), recursion space, and Python gotchas |

---

## DSA from Scratch

<details open>
  <summary><b>Linear Data Structures</b></summary>
  <br>

| Structure | Variants | Time Complexity | Space | Link |
|-----------|----------|----------------|-------|------|
| Array | Basic operations | Access: O(1), Insert/Delete: O(n) | O(n) | [code](./src/dsa_from_scratch/python/arrays/common_operations.py) |
| Linked List | Singly | Insert/Delete: O(1), Search: O(n) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/singly_linked_list.py) |
| Linked List | Doubly | Insert/Delete: O(1), Search: O(n) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/doubly_linked_list.py) |
| Stack | Array-based | Push/Pop: O(1) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/stack_array.py) |
| Stack | Linked List-based | Push/Pop: O(1) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/stack_linked_list.py) |
| Queue | Array-based | Enqueue/Dequeue: O(1) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/queue_array.py) |
| Queue | Linked List-based | Enqueue/Dequeue: O(1) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/queue_linked_list.py) |
| Deque | Array-based | Insert/Delete both ends: O(1) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/deque_array.py) |
| Deque | Linked List-based | Insert/Delete both ends: O(1) | O(n) | [code](./src/dsa_from_scratch/python/list_adt/deque_linked_list.py) |

</details>

<details open>
  <summary><b>Trees & Heaps</b></summary>
  <br>

| Structure | Implementation | Time Complexity | Space | Link |
|-----------|---------------|----------------|-------|------|
| Binary Tree | Pointer-based | Insert/Delete/Search: O(n) | O(n) | [code](./src/dsa_from_scratch/python/tree/binary_tree.py) |
| Binary Tree | Array-based | Access: O(1), Insert/Delete: O(n) | O(n) | [code](./src/dsa_from_scratch/python/tree/array_representation_of_tree.py) |
| Binary Search Tree | — | Insert/Delete/Search: O(log n) avg, O(n) worst | O(n) | [code](./src/dsa_from_scratch/python/tree/binary_search_tree.py) |
| AVL Tree | Self-balancing BST | Insert/Delete/Search: O(log n) | O(n) | [code](./src/dsa_from_scratch/python/tree/avl.py) |
| Min Heap | Binary heap | Insert/Delete Min: O(log n), Get Min: O(1) | O(n) | [code](./src/dsa_from_scratch/python/binary_heap/min_heap_implementation.py) |
| Max Heap | Binary heap | Insert/Delete Max: O(log n), Get Max: O(1) | O(n) | [code](./src/dsa_from_scratch/python/binary_heap/max_heap_implementation.py) |
| Heap | Properties & operations | — | — | [code](./src/dsa_from_scratch/python/binary_heap/heap_properties.py) |

</details>

<details open>
  <summary><b>Hash Tables</b></summary>
  <br>

| Type | Description | Time Complexity | Space | Link |
|------|-------------|----------------|-------|------|
| Direct Addressing | Simplified hash table (key = index) | Insert/Delete/Search: O(1) | O(k) where k = key range | [code](./src/dsa_from_scratch/python/hash_map/direct_addressing_table.py) |
| Hash Map | Array-based implementation | Insert/Delete/Search: O(1) avg | O(n) | [code](./src/dsa_from_scratch/python/hash_map/array_hash_map.py) |
| Open Addressing | Linear probing collision resolution | Insert/Delete/Search: O(1) avg | O(n) | [code](./src/dsa_from_scratch/python/hash_map/open_addressing.py) |
| Separate Chaining | Linked list collision resolution | Insert/Delete/Search: O(1) avg | O(n + m) | [code](./src/dsa_from_scratch/python/hash_map/separate_chaining.py) |
| Common Operations | Basic hash table operations | — | — | [code](./src/dsa_from_scratch/python/hash_map/common_operations.py) |

</details>

<details open>
  <summary><b>Graphs</b></summary>
  <br>

| Category | Algorithm/Representation | Time Complexity | Space | Link |
|----------|-------------------------|----------------|-------|------|
| **Representation** | Adjacency Matrix | Space: O(V²), Edge check: O(1) | O(V²) | [code](./src/dsa_from_scratch/python/graph/adjacency_matrix.py) |
| **Representation** | Adjacency List | Space: O(V+E), Edge check: O(deg(v)) | O(V+E) | [code](./src/dsa_from_scratch/python/graph/adjacency_list.py) |
| **Traversal** | Depth-First Search (DFS) | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/graph_traversal_dfs.py) |
| **Traversal** | Breadth-First Search (BFS) | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/graph_traversal_bfs.py) |
| **Application** | Cycle Detection | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/cycle_detection.py) |
| **Application** | Topological Sort | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/toposort.py) |
| **Application** | Bipartite Check | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/check_bipartite.py) |
| **Shortest Path** | Bellman-Ford (negative weights) | O(VE) | O(V) | [code](./src/dsa_from_scratch/python/graph/bellman_ford.py) |
| **Shortest Path** | Dijkstra (non-negative weights) | O((V+E) log V) | O(V) | [code](./src/dsa_from_scratch/python/graph/dijkstra.py) |
| **Shortest Path** | BFS (unweighted) | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/bfs_sssp.py) |
| **Shortest Path** | DFS (weighted trees) | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/dfs_weighted_tree.py) |
| **Shortest Path** | DP on DAG | O(V+E) | O(V) | [code](./src/dsa_from_scratch/python/graph/dp_dag.py) |
| **Shortest Path** | Modified Dijkstra | O((V+E) log V) | O(V) | [code](./src/dsa_from_scratch/python/graph/modified_dijkstra.py) |

</details>

<details open>
  <summary><b>Sorting Algorithms</b></summary>
  <br>

| Algorithm | Time Complexity | Space | Type | Link |
|-----------|----------------|-------|------|------|
| Bubble Sort | O(n²) avg/worst, O(n) best | O(1) | Comparison | [code](./src/dsa_from_scratch/python/sorting/bubble_sort.py) |
| Insertion Sort | O(n²) avg/worst, O(n) best | O(1) | Comparison | [code](./src/dsa_from_scratch/python/sorting/insertion_sort.py) |
| Selection Sort | O(n²) | O(1) | Comparison | [code](./src/dsa_from_scratch/python/sorting/selection_sort.py) |
| Merge Sort | O(n log n) | O(n) | Comparison | [code](./src/dsa_from_scratch/python/sorting/merge_sort.py) |
| Quick Sort | O(n log n) avg, O(n²) worst | O(log n) | Comparison | [code](./src/dsa_from_scratch/python/sorting/quick_sort.py) |
| Random Quick Sort | O(n log n) avg, O(n²) worst | O(log n) | Comparison | [code](./src/dsa_from_scratch/python/sorting/random_quick_sort.py) |
| Counting Sort | O(n + k) where k = range | O(k) | Non-comparison | [code](./src/dsa_from_scratch/python/sorting/counting_sort.py) |
| Radix Sort | O(d(n + k)) where d = digits | O(n + k) | Non-comparison | [code](./src/dsa_from_scratch/python/sorting/radix_sort.py) |
| Bucket Sort | O(n + k) avg, O(n²) worst | O(n) | Non-comparison | [code](./src/dsa_from_scratch/python/sorting/bucket_sort.py) |

</details>
---

## Boilerplate Code

### Arrays

<details open>
<summary><b>Kadane's Algorithm</b></summary>
<br>

- [Calculating max sum subarray](./src/boilerplate/kadane.py)
</details>

<details open>
<summary><b>Sliding Window</b></summary>
<br>

- [Fixed size](./src/boilerplate/sliding_window_fixed.py)
- [Variable size](./src/boilerplate/sliding_window_variable.py)
</details>

<details open>
<summary><b>Prefix Sum</b></summary>
<br>

- [Range Sum Query](./src/boilerplate/prefix_sum.py)
</details>

<details open>
<summary><b>Two Pointers</b></summary>
<br>

- [3 different variations of two pointers](./src/boilerplate/two_pointers_variations.md)
</details>

---

## LeetCode Questions

> Gradually adding solutions in different languages: **Python**, **Julia**, and **C++**

<details open>
  <summary><b>Arrays & Hashing</b></summary>
  <br>

| # | Question | Description | Difficulty | Solution |
|---|----------|-------------|------------|----------|
| 1 | Two Sum | Find two indices in a vector such that the<br>numbers add up to a target value<br>💡 *Use HashMap for O(n) time* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/two_sum.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/TwoSum.jl) |
| 242 | Valid Anagram | Determine if two strings are anagrams of each other<br>💡 *HashMap/Counter for frequency comparison* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/is_anagram.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/IsAnagram.jl) |
| 217 | Contains Duplicate | Check if a vector contains any duplicates<br>💡 *HashSet for O(n) lookup* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/contains_duplicate.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/ContainsDuplicate.jl) |
| 36 | Valid Sudoku | Determine if a 9x9 Sudoku board is valid<br>💡 *HashSet for rows/cols/boxes* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/is_valid_sudoku.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/IsValidSudoku.jl) |
| 128 | Longest Consecutive Sequence | Find the length of the longest consecutive elements sequence<br>💡 *HashSet with O(n) streak checking* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/longest_consecutive.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/LongestConsecutive.jl) |
| 271 | Encode and Decode Strings | Encode a list of strings to a single string and decode it back<br>💡 *Use delimiter with length prefix* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/encode_decode_string.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/EncodeDecodeString.jl) |
| 49 | Group Anagrams | Group strings into anagrams<br>💡 *Sort strings as keys or count frequencies* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/group_anagram.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/GroupAnagrams.jl) |
| 219 | Close Duplicates | Check if a vector contains duplicates within a given range<br>💡 *Sliding window with HashSet* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/CloseDuplicates.jl) |
| 1343 | NumOfSubarrays | Count subarrays with average greater than or equal to a threshold<br>💡 *Fixed-size sliding window* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/NumOfSubarrays.jl) |
| 1929 | Concatenation of Array | Return array ans of length 2n where ans[i] == nums[i] and ans[i + n] == nums[i]<br>💡 *Simple array duplication* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/get_concatenation.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/arrays_hashing/GetConcatenation.jl) |
| 14 | Longest Common Prefix | Find the longest common prefix string amongst an array of strings<br>💡 *Compare characters vertically* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/longest_common_prefix.py) |
| 169 | Majority Element | Find the majority element that appears more than ⌊n/2⌋ times<br>💡 *Boyer-Moore voting or HashMap* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/arrays_hashing/majority_element.py) |
</details>

<details open>
  <summary><b>Two Pointers</b></summary>
  <br>

| # | Question | Description | Difficulty | Solution |
|---|----------|-------------|------------|----------|
| 125 | Valid Palindrome | Determine if a string is a palindrome, considering only alphanumeric characters and ignoring cases<br>💡 *Two pointers from both ends* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/two_pointers/ValidPalindrome.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/two_pointers/valid_palindrome.py) |
| 15 | Three Sum | Find all unique triplets in the array which gives the sum of zero<br>💡 *Sort + two pointers for each element* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/threeSum.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/two_pointers/three_sum.py) |
| 11 | Container With Most Water | Find two lines that together with the x-axis form a container, such that the container contains the most water<br>💡 *Move pointer with shorter height inward* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/two_pointers/MaxArea.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/two_pointers/max_area.py) |
| 167 | Two Sum Part 2 | Find two indices in a sorted array such that they add up to a specific target<br>💡 *Exploit sorted property with two pointers* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/TwoSumPart2.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/two_pointers/two_sum2.py) |
| 42 | Trapping Rain Water | Calculate how much water can be trapped after raining<br>💡 *Track max heights from both sides* | ![Hard](https://img.shields.io/badge/Hard-DC3545?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/trap.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/two_pointers/trap.py) |

</details>

<details open>
  <summary><b>Stack</b></summary>
  <br>

| # | Question | Description | Difficulty | Solution |
|---|----------|-------------|------------|----------|
| 20 | Valid Parenthesis | Determine if the input string has valid parentheses<br>💡 *Stack with matching pairs HashMap* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/stack/ValidParenthesis.jl) |
| 155 | Min Stack | Build a stack that supports push, pop, top, and retrieve the minimum in O(1) time<br>💡 *Auxiliary stack tracking minimums* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/stack/min_stack.py) |
| 150 | Evaluate RPN | Evaluate Reverse Polish Notation expression<br>💡 *Stack for operands, pop on operators* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/stack/eval_rpn.py) |

</details>

<details open>
  <summary><b>Sliding Window</b></summary>
  <br>

| # | Question | Description | Difficulty | Solution |
|---|----------|-------------|------------|----------|
| 121 | Best Time to Buy and Sell Stock | Find the maximum profit you can achieve from one transaction<br>💡 *Track min price, max profit in one pass* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/sliding_window/MaxProfit.jl) |
| 3 | Longest Substring Without Repeating Characters | Find the length of the longest substring without repeating characters<br>💡 *Expand window, shrink on duplicates* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/sliding_window/longest_substring.py) |
| 424 | Longest Repeating Character Replacement | Find the length of the longest substring containing the same letter you can get after performing k replacements<br>💡 *Track max frequency in window* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/stack/CharacterReplacement.jl) |
| 76 | Minimum Window Substring | Find the minimum window substring of `s` such that every character in `t` is included<br>💡 *Two pointers with character count matching* | ![Hard](https://img.shields.io/badge/Hard-DC3545?style=flat-square) | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/stack/MinWindow.jl) |
| 567 | Permutation in String | Check if one string is a permutation of a substring of another string<br>💡 *Fixed window with frequency comparison* | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/stack/permutation_in_string.py) |
| 239 | Sliding Window Maximum | Find the maximum value in each sliding window of a fixed size k<br>💡 *Monotonic deque for O(n) solution* | ![Hard](https://img.shields.io/badge/Hard-DC3545?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/stack/max_sliding_window.py) |

</details>

<details open>
  <summary><b>Linked List</b></summary>
  <br>

| # | Question | Description | Difficulty | Solution |
|---|----------|-------------|------------|----------|
| 21 | Merge Two Sorted Lists | Merge two sorted linked lists and return it as a new sorted list<br>💡 *Compare heads, link smaller node* | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/python/stack/merge_2_sorted_lists.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/julia/stack/Merge2SortedList.jl) |

</details>

---

## Kattis Problems

<details>
  <summary><b>View All Kattis Problems</b></summary>
  <br>

| # | Problem ID | Description | Difficulty | Type | Solution |
|---|------------|-------------|------------|------|----------|
| 1 | hip hip | Print "Hipp hipp hurra!" 20 times | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/hip_hip.py) |
| 2 | storafmaeli | Check if it's anniversary | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/storafmaeli.py) |
| 3 | fyrirtækjanafn | Filter out consonants from input | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/fyrirtækjanafn.py) |
| 4 | peningar | Calculate values accumulated from circular cells | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/peningar.py) |
| 5 | framvindustika | Print progress bar and % | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/framvindustika.py) |
| 6 | message | Extract letters from nested list to form a message | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/message.py) |
| 7 | bidendalausbid | Calculate waited time in minutes | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/bidendalausbid.py) |
| 8 | hlaupafmaeli | Check birthday for leap year | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/hlaupafmaeli.py) |
| 9 | lidaskipting2 | Find min and max number of competitive teams that can be formed | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/lidaskipting2.py) |
| 10 | fleytitala | Find min and max number of competitive teams that can be formed | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/fleytitala.py) |
| 11 | subaruba | Ubbi dubbi game | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Array | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/subaruba.py) |
| 12 | gangur | Count passing pairs of people | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Array | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/gangur.py) |
| 13 | taktsvedjur | Calculate scores with multipliers | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Array | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/python/taktsvedjur.py) |

</details>

