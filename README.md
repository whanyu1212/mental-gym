<div align="center">

# 🧠 Mental Gym <!-- omit in toc -->

### *Level up your coding skills, one problem at a time*

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Julia](https://img.shields.io/badge/Julia-9558B2?style=for-the-badge&logo=julia&logoColor=white)
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)

[![LeetCode](https://img.shields.io/badge/LeetCode-27_Solved-FFA116?style=flat&logo=leetcode)](https://leetcode.com)
[![Kattis](https://img.shields.io/badge/Kattis-13_Solved-00A6A6?style=flat)](https://open.kattis.com)
![DSA](https://img.shields.io/badge/DSA_Implementations-9_Topics-blueviolet?style=flat)

</div>

---

## About <!-- omit in toc -->

Documenting my journey through various coding platforms including **LeetCode**, **Kattis**, and **HackerRank**. This repository also contains implementations of common data structures and algorithms (DSA) built from scratch to strengthen fundamental understanding.

---

## Table of Contents <!-- omit in toc -->

- [DSA from Scratch](#dsa-from-scratch)
- [Boilerplate Code](#boilerplate-code)
  - [Arrays](#arrays)
- [LeetCode Questions](#leetcode-questions)
- [Kattis Problems](#kattis-problems)

---

## DSA from Scratch

<details>
  <summary><b>Sorting Algorithms</b></summary>
  <br>

| Category             | Algorithm         | Description                                                                 | Implementation Link                  |
|----------------------|-------------------|-----------------------------------------------------------------------------|--------------------------------------|
| Comparison-based     | Bubble Sort       | Simple comparison-based sorting                                             | [Bubble Sort](./src/dsa_from_scratch/sorting/bubble_sort.py) |
| Comparison-based     | Insertion Sort    | Builds the final sorted array one item at a time                            | [Insertion Sort](./src/dsa_from_scratch/sorting/insertion_sort.py) |
| Comparison-based     | Selection Sort    | Selects the smallest element from an unsorted list in each iteration and places that element at the beginning | [Selection Sort](./src/dsa_from_scratch/sorting/selection_sort.py) |
| Comparison-based     | Merge Sort        | Divides the array into halves, sorts them and merges them back together      | [Merge Sort](./src/dsa_from_scratch/sorting/merge_sort.py) |
| Comparison-based     | Quick Sort        | Divides the array into partitions and sorts them recursively                 | [Quick Sort](./src/dsa_from_scratch/sorting/quick_sort.py) |
| Comparison-based     | Random Quick Sort | Uses a random pivot to divide the array into partitions and sorts them recursively | [Random Quick Sort](./src/dsa_from_scratch/sorting/random_quick_sort.py) |
| Non-comparison-based | Bucket Sort       | Distributes elements into buckets and sorts each bucket individually         | [Bucket Sort](./src/dsa_from_scratch/sorting/bucket_sort.py) |
| Non-comparison-based | Counting Sort     | Counts the number of objects having distinct key values and uses arithmetic to determine the positions of each key | [Counting Sort](./src/dsa_from_scratch/sorting/counting_sort.py) |
| Non-comparison-based | Radix Sort        | Sorts numbers by processing individual digits                               | [Radix Sort](./src/dsa_from_scratch/sorting/radix_sort.py) |

</details>

<details>
  <summary><b>Arrays</b></summary>
  <br>

  - [Common Operations for Array](./src/dsa_from_scratch/arrays/common_operations.py)

</details>

<details>
  <summary><b>Linked List</b></summary>
  <br>

  - [Singly Linked List](./src/dsa_from_scratch/list_adt/singly_linked_list.py)
  - [Doubly Linked List](./src/dsa_from_scratch/list_adt/doubly_linked_list.py)

</details>

<details>
  <summary><b>Stack and Queue</b></summary>
  <br>

  - [Stack using Linked List](./src/dsa_from_scratch/list_adt/stack_linked_list.py)
  - [Stack using Array](./src/dsa_from_scratch/list_adt/stack_array.py)
  - [Queue using Linked List](./src/dsa_from_scratch/list_adt/queue_linked_list.py)
  - [Queue using Array](./src/dsa_from_scratch/list_adt/queue_array.py)
  - [Deque using Linked List](./src/dsa_from_scratch/list_adt/deque_linked_list.py)
  - [Deque using Array](./src/dsa_from_scratch/list_adt/deque_array.py)

</details>

<details>
  <summary><b>Binary Heap</b></summary>
  <br>

  - [Basic heap properties](./src/dsa_from_scratch/binary_heap/heap_properties.py)
  - [Min Heap implementation](./src/dsa_from_scratch/binary_heap/min_heap_implementation.py)
  - [Max Heap implementation](./src/dsa_from_scratch/binary_heap/max_heap_implementation.py)

</details>

<details>
  <summary><b>HashMap / Hash Table</b></summary>
  <br>

  - [Direct Addressing Table](./src/dsa_from_scratch/hash_map/direct_addressing_table.py) (simplified hash table)
  - [Common Operations](./src/dsa_from_scratch/hash_map/common_operations.py)
  - [Creating HashMap using Array](./src/dsa_from_scratch/hash_map/array_hash_map.py)
  - [Open Addressing](./src/dsa_from_scratch/hash_map/open_addressing.py)
  - [Separate Chaining](./src/dsa_from_scratch/hash_map/separate_chaining.py)

</details>

<details>
  <summary><b>Tree</b></summary>
  <br>

  - [Binary Tree](./src/dsa_from_scratch/tree/binary_tree.py)
  - [Array Representation of Tree](./src/dsa_from_scratch/tree/array_representation_of_tree.py)
  - [Binary Search Tree](./src/dsa_from_scratch/tree/binary_search_tree.py)
  - [AVL](./src/dsa_from_scratch/tree/avl.py)

</details>

<details>
  <summary><b>Graph</b></summary>
  <br>

  - [Adjacency Matrix](./src/dsa_from_scratch/graph/adjacency_matrix.py)
  - [Adjacency List](./src/dsa_from_scratch/graph/adjacency_list.py)
  - [Graph Traversal DFS](./src/dsa_from_scratch/graph/graph_traversal_dfs.py)
  - [Graph Traversal BFS](./src/dsa_from_scratch/graph/graph_traversal_bfs.py)
  - [Application: Detect Cycle](./src/dsa_from_scratch/graph/cycle_detection.py)
  - [Application: Topological Sort](./src/dsa_from_scratch/graph/toposort.py)
  - [Application: Check Bipartite](./src/dsa_from_scratch/graph/check_bipartite.py)
  - [Single-Source Shortest Path: Bellman Ford](./src/dsa_from_scratch/graph/bellman_ford.py)
  - [Single-Source Shortest Path: Dijkstra](./src/dsa_from_scratch/graph/dijkstra.py)
  - [Single-Source Shortest Path: BFS on unweighted graph](./src/dsa_from_scratch/graph/bfs_sssp.py)
  - [Single-Source Shortest Path: Modified Dijkstra](./src/dsa_from_scratch/graph/modified_dijkstra.py)
  - [Single-Source Shortest Path: DFS on weighted trees](./src/dsa_from_scratch/graph/dfs_weighted_tree.py)
  - [Single-Source Shortest Path: DP on DAG](./src/dsa_from_scratch/graph/dp_dag.py)

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

| # | Question | Description | Difficulty | Type | Solution |
|---|----------|-------------|------------|------|----------|
| 1 | Two Sum | Find two indices in a vector such that the<br>numbers add up to a target value | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Arrays, Hashing | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/two_sum.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/TwoSum.jl) |
| 242 | Valid Anagram | Determine if two strings are<br>anagrams of each other | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Hashing | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/is_anagram.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/IsAnagram.jl) |
| 217 | Contains Duplicate | Check if a vector contains<br>any duplicates | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Arrays, Hashing | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/contains_duplicate.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/ContainsDuplicate.jl) |
| 36 | Valid Sudoku | Determine if a 9x9 Sudoku<br>board is valid | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Arrays, Hashing | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/is_valid_sudoku.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/IsValidSudoku.jl) |
| 128 | Longest Consecutive Sequence | Find the length of the longest<br>consecutive elements sequence | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Arrays, Hashing | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/longest_consecutive.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/LongestConsecutive.jl) |
| 271 | Encode and Decode Strings | Encode a list of strings to a<br>single string and decode it back to the list | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Arrays, String Manipulation | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/encode_decode_string.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/EncodeDecodeString.jl) |
| 49 | Group Anagrams | Group strings into<br>anagrams | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Hashing, Sorting | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/group_anagram.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/GroupAnagrams.jl) |
| 219 | Close Duplicates | Check if a vector contains<br>duplicates within a given range | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/CloseDuplicates.jl) |
| 1343 | NumOfSubarrays | Count subarrays with average greater<br>than or equal to a threshold | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/NumOfSubarrays.jl) |
| 1929 | Concatenation of Array | Return array ans of length 2n where<br>ans[i] == nums[i] and ans[i + n] == nums[i] | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Arrays | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/get_concatenation.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/arrays_hashing/GetConcatenation.jl) |
| 14 | Longest Common Prefix | Find the longest common prefix string amongst an array of strings | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Arrays, String Manipulation | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/longest_common_prefix.py) |
| 169 | Majority Element | Find the majority element that appears more than ⌊n/2⌋ times | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Arrays, Hashing | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/arrays_hashing/majority_element.py) |

</details>

<details open>
  <summary><b>Two Pointers</b></summary>
  <br>

| # | Question | Description | Difficulty | Type | Solution |
|---|----------|-------------|------------|------|----------|
| 125 | Valid Palindrome | Determine if a string is a palindrome, considering only alphanumeric characters and ignoring cases | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Two Pointers | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/ValidPalindrome.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/two_pointers/valid_palindrome.py) |
| 15 | Three Sum | Find all unique triplets in the array which gives the sum of zero | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Two Pointers | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/threeSum.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/two_pointers/three_sum.py) |
| 11 | Container With Most Water | Find two lines that together with the x-axis form a container, such that the container contains the most water | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Two Pointers | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/MaxArea.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/two_pointers/max_area.py) |
| 167 | Two Sum Part 2 | Find two indices in a sorted array such that they add up to a specific target | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/TwoSumPart2.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/two_pointers/two_sum2.py) |
| 42 | Trapping Rain Water | Calculate how much water can be trapped after raining | ![Hard](https://img.shields.io/badge/Hard-DC3545?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/two_pointers/trap.jl) [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/two_pointers/trap.py) |

</details>

<details open>
  <summary><b>Stack</b></summary>
  <br>

| # | Question | Description | Difficulty | Type | Solution |
|---|----------|-------------|------------|------|----------|
| 20 | Valid Parenthesis | Determine if the input string has valid parentheses | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Stack | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/ValidParenthesis.jl) |
| 155 | Min Stack | Build a stack that supports push, pop, top, and retrieve the minimum in O(1) time | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Stack | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/min_stack.py) |
| 150 | Evaluate RPN | Evaluate Reverse Polish Notation expression | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Stack | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/eval_rpn.py) |

</details>

<details open>
  <summary><b>Sliding Window</b></summary>
  <br>

| # | Question | Description | Difficulty | Type | Solution |
|---|----------|-------------|------------|------|----------|
| 121 | Best Time to Buy and Sell Stock | Find the maximum profit you can achieve from one transaction | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/MaxProfit.jl) |
| 3 | Longest Substring Without Repeating Characters | Find the length of the longest substring without repeating characters | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/longestSubstringWithoutRepeatingCharacters.jl) |
| 424 | Longest Repeating Character Replacement | Find the length of the longest substring containing the same letter you can get after performing k replacements | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/longestRepeatingCharacterReplacement.jl) |
| 76 | Minimum Window Substring | Find the minimum window substring of `s` such that every character in `t` is included | ![Hard](https://img.shields.io/badge/Hard-DC3545?style=flat-square) | Sliding Window | [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/MinWindow.jl) |
| 567 | Permutation in String | Check if one string is a permutation of a substring of another string | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Sliding Window | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/permutation_in_string.py) |
| 239 | Sliding Window Maximum | Find the maximum value in each sliding window of a fixed size k | ![Hard](https://img.shields.io/badge/Hard-DC3545?style=flat-square) | Sliding Window | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/max_sliding_window.py) |

</details>

<details open>
  <summary><b>Linked List</b></summary>
  <br>

| # | Question | Description | Difficulty | Type | Solution |
|---|----------|-------------|------------|------|----------|
| 21 | Merge Two Sorted Lists | Merge two sorted linked lists and return it as a new sorted list | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Linked List | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/leetcode/merge_2_sorted_lists.py) [![Julia](https://img.shields.io/badge/Julia-9558B2?style=flat-square&logo=julia&logoColor=white)](/src/leetcode/Merge2SortedList.jl) |

</details>

---

## Kattis Problems

<details>
  <summary><b>View All Kattis Problems</b></summary>
  <br>

| # | Problem ID | Description | Difficulty | Type | Solution |
|---|------------|-------------|------------|------|----------|
| 1 | hip hip | Print "Hipp hipp hurra!" 20 times | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/hip_hip.py) |
| 2 | storafmaeli | Check if it's anniversary | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/storafmaeli.py) |
| 3 | fyrirtækjanafn | Filter out consonants from input | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/fyrirtækjanafn.py) |
| 4 | peningar | Calculate values accumulated from circular cells | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/peningar.py) |
| 5 | framvindustika | Print progress bar and % | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/framvindustika.py) |
| 6 | message | Extract letters from nested list to form a message | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/message.py) |
| 7 | bidendalausbid | Calculate waited time in minutes | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/bidendalausbid.py) |
| 8 | hlaupafmaeli | Check birthday for leap year | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/hlaupafmaeli.py) |
| 9 | lidaskipting2 | Find min and max number of competitive teams that can be formed | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/lidaskipting2.py) |
| 10 | fleytitala | Find min and max number of competitive teams that can be formed | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Easy Coding Challenges | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/fleytitala.py) |
| 11 | subaruba | Ubbi dubbi game | ![Medium](https://img.shields.io/badge/Medium-FFA500?style=flat-square) | Array | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/subaruba.py) |
| 12 | gangur | Count passing pairs of people | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Array | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/gangur.py) |
| 13 | taktsvedjur | Calculate scores with multipliers | ![Easy](https://img.shields.io/badge/Easy-5CB85C?style=flat-square) | Array | [![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](/src/kattis/taktsvedjur.py) |

</details>

