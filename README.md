# Mental Gym
Documenting practices on various coding platforms such as LeetCode, Kattis, HackerRank, etc. Additionally, adding code snippets to show how to implement certain data structures and algorithms (DSA) from scratch.

## DSA from scratch

<details>
  <summary>Sorting</summary>

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
  <summary>Arrays</summary>
  
  [Common Operations for Array](./src/dsa_from_scratch/arrays/common_operations.py)

</details>



<details>
  <summary>Linked List</summary>

  [Singly Linked List](./src/dsa_from_scratch/list_adt/singly_linked_list.py)
  
  [Doubly Linked List](./src/dsa_from_scratch/list_adt/doubly_linked_list.py)
  
</details>

<details>
  <summary>Stack and Queue</summary>

  [Stack using Linked List](./src/dsa_from_scratch/list_adt/stack_linked_list.py)

  [Stack using Array](./src/dsa_from_scratch/list_adt/stack_array.py)

  [Queue using Linked List](./src/dsa_from_scratch/list_adt/queue_linked_list.py)

  [Queue using Array](./src/dsa_from_scratch/list_adt/queue_array.py)

  [Deque using Linked List](./src/dsa_from_scratch/list_adt/deque_linked_list.py)

  [Deque using Array](./src/dsa_from_scratch/list_adt/deque_array.py)
  
</details>

<details>
  <summary>Binary Heap</summary>

  [Basic heap properties](./src/dsa_from_scratch/binary_heap/heap_properties.py)

  [Min Heap implementation](./src/dsa_from_scratch/binary_heap/min_heap_implementation.py)

  [Max Heap implementation](./src/dsa_from_scratch/binary_heap/max_heap_implementation.py)
  
</details>


<details>
  <summary>HashMap / Hash Table</summary>

  [Direct Addressing Table](./src/dsa_from_scratch/hash_map/direct_addressing_table.py) (simplified hash table)

  [Common Operations](./src/dsa_from_scratch/hash_map/common_operations.py)

  [Creating HashMap using Array](./src/dsa_from_scratch/hash_map/array_hash_map.py)

  [Open Addressing](./src/dsa_from_scratch/hash_map/open_addressing.py)

  [Separate Chaining](./src/dsa_from_scratch/hash_map/separate_chaining.py)
  
</details>

<details>
  <summary>Tree</summary>

  [Binary Tree](./src/dsa_from_scratch/tree/binary_tree.py)

  [Array Representation of Tree](./src/dsa_from_scratch/tree/array_representation_of_tree.py)

  [Binary Search Tree](./src/dsa_from_scratch/tree/binary_search_tree.py)

  [AVL](./src/dsa_from_scratch/tree/avl.py)
  
</details>


<details>
  <summary>Graph</summary>

  [Adjacency Matrix](./src/dsa_from_scratch/graph/adjacency_matrix.py)

  [Adjacency List](./src/dsa_from_scratch/graph/adjacency_list.py)

  [Graph Traversal DFS](./src/dsa_from_scratch/graph/graph_traversal_dfs.py)

  [Graph Traversal BFS](./src/dsa_from_scratch/graph/graph_traversal_bfs.py)

  [Application: Detect Cycle](./src/dsa_from_scratch/graph/cycle_detection.py)

  [Application: Topological Sort](./src/dsa_from_scratch/graph/toposort.py)

  [Application: Check Bipartite](./src/dsa_from_scratch/graph/check_bipartite.py)

  [Single-Source Shortest Path: Bellman Ford](./src/dsa_from_scratch/graph/bellman_ford.py)

  [Single-Source Shortest Path: Dijkstra](./src/dsa_from_scratch/graph/dijkstra.py)

  [Single-Source Shortest Path: BFS on unweighted graph](./src/dsa_from_scratch/graph/bfs_sssp.py)

  [Single-Source Shortest Path: Modified Dijkstra](./src/dsa_from_scratch/graph/modified_dijkstra.py)

  [Single-Source Shortest Path: DFS on weighted trees](./src/dsa_from_scratch/graph/dfs_weighted_tree.py)

  [Single-Source Shortest Path: DP on DAG](./src/dsa_from_scratch/graph/dp_dag.py)

  
</details>

## Boilerplate Code

#### Arrays:

<details open>
<summary>Kadane's Algorithm</summary>

- [Calculating max sum subarray](./src/boilerplate/kadane.py)
</details>

<details open>
<summary>Sliding Window</summary>

- [Fixed size](./src/boilerplate/sliding_window_fixed.py)
- [Variable size](./src/boilerplate/sliding_window_variable.py)
</details>


<details open>
<summary>Prefix Sum</summary>

- [Range Sum Query](./src/boilerplate/prefix_sum.py)
</details>

<details open>
<summary>Two Pointers</summary>

- [3 different variations of two pointers](./src/boilerplate/two_pointers_variations.md)
</details>

#### Linked List:


## LeetCode Questions
Gradually adding the questions in different languages (Python, Julia & C++)


<details open>
  <summary>Arrays & Hashing</summary>

| Question | Description | Difficulty | Type | Solution |
|----------|-------------|------------|------|----------|
| 1. Two Sum | Find two indices in a vector such that the<br>numbers add up to a target value | Easy | Arrays, Hashing | <a href="/src/leetcode/two_sum.py"><img src="/imgs/python-programming-language.webp" alt="two sum" width="40" height="40"></a> <a href="/src/leetcode/twoSum.jl"><img src="/imgs/unnamed.png" alt="two sum" width="40" height="40"></a> |
| 242. IsAnagram | Determine if two strings are<br>anagrams of each other | Easy | Hashing | <a href="/src/leetcode/is_anagram.py"><img src="/imgs/python-programming-language.webp" alt="is anagram" width="40" height="40"></a> <a href="/src/leetcode/isAnagram.jl"><img src="/imgs/unnamed.png" alt="is anagram" width="40" height="40"></a> |
| 217. Contains Duplicate | Check if a vector contains<br>any duplicates | Easy | Arrays, Hashing | <a href="/src/leetcode/contains_duplicate.py"><img src="/imgs/python-programming-language.webp" alt="contains duplicate" width="40" height="40"></a> <a href="/src/leetcode/containsDuplicate.jl"><img src="/imgs/unnamed.png" alt="contains duplicate" width="40" height="40"></a> |
| 36. Valid Sudoku | Determine if a 9x9 Sudoku<br>board is valid | Medium | Arrays, Hashing | <a href="/src/leetcode/valid_sudoku.py"><img src="/imgs/python-programming-language.webp" alt="valid sudoku" width="40" height="40"></a> <a href="/src/leetcode/ValidSudoku.jl"><img src="/imgs/unnamed.png" alt="valid sudoku" width="40" height="40"></a> |
| 128. Longest Consecutive Sequence | Find the length of the longest<br>consecutive elements sequence | Medium | Arrays, Hashing | <a href="/src/leetcode/LongestConsecutive.jl"><img src="/imgs/unnamed.png" alt="longest consecutive sequence" width="40" height="40"></a> |
| 271. Encode and Decode Strings | Encode a list of strings to a<br>single string and decode it back to the list | Medium | Arrays, String Manipulation | <a href="/src/leetcode/EncodeDecodeString.jl"><img src="/imgs/unnamed.png" alt="encode decode string" width="40" height="40"></a> |
| 49. Group Anagrams | Group strings into<br>anagrams | Medium | Hashing, Sorting | <a href="/src/leetcode/groupAnagrams.jl"><img src="/imgs/unnamed.png" alt="group anagrams" width="40" height="40"></a> |
| 219. Close Duplicates | Check if a vector contains<br>duplicates within a given range | Easy | Sliding Window | <a href="/src/leetcode/closeDuplicates.jl"><img src="/imgs/unnamed.png" alt="close duplicates" width="40" height="40"></a> |
| 1343. NumOfSubarrays | Count subarrays with average greater<br>than or equal to a threshold | Medium | Sliding Window | <a href="/src/leetcode/numOfSubarrays.jl"><img src="/imgs/unnamed.png" alt="num of subarrays" width="40" height="40"></a> |
| 1929. Concatenation of Array | Return array ans of length 2n where<br>ans[i] == nums[i] and ans[i + n] == nums[i] | Easy | Arrays | <a href="/src/leetcode/get_concatenation.py"><img src="/imgs/python-programming-language.webp" alt="concatenation array" width="40" height="40"></a> <a href="/src/leetcode/GetConcatenation.jl"><img src="/imgs/unnamed.png" alt="concatenation array" width="40" height="40"></a> |

</details>

<br>

<details open>
  <summary>Two Pointers</summary>

| Question                     | Description                                                                 | Difficulty | Type            | Solution |
|------------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 125. Valid Palindrome        | Determine if a string is a palindrome, considering only alphanumeric characters and ignoring cases | Easy | Two Pointers | <a href="/src/leetcode/isPalindrome.jl"><img src="/imgs/unnamed.png" alt="is palindrome" width="40" height="40"></a> |
| 15. Three Sum                | Find all unique triplets in the array which gives the sum of zero           | Medium     | Two Pointers    | <a href="/src/leetcode/threeSum.jl"><img src="/imgs/unnamed.png" alt="three sum" width="40" height="40"></a> |
| 11. Container With Most Water| Find two lines that together with the x-axis form a container, such that the container contains the most water | Medium | Two Pointers | <a href="/src/leetcode/MaxArea.jl"><img src="/imgs/unnamed.png" alt="container with most water" width="40" height="40"></a> |
| Two Sum Part 2                          | Find two indices in a sorted array such that they add up to a specific target | Medium     | Sliding Window  | <a href="/src/leetcode/two_sum2.py"><img src="/imgs/python-programming-language.webp" alt="two sum part 2" width="40" height="40"></a> <a href="/src/leetcode/TwoSumPart2.jl"><img src="/imgs/unnamed.png" alt="two sum part 2" width="40" height="40"></a> |
| Trapping Rain Water                     | Calculate how much water can be trapped after raining                       | Hard       | Sliding Window  | <a href="/src/leetcode/trap.jl"><img src="/imgs/python-programming-language.webp" alt="trapping rain water" width="40" height="40"></a> <a href="/src/leetcode/trap.py"><img src="/imgs/unnamed.png" alt="trapping rain water" width="40" height="40"></a> |
</details>

<br>

<details open>
  <summary>Stack</summary>

| Question                | Description                                                                 | Difficulty | Type            | Solution |
|-------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 20. Valid Parenthesis   | Determine if the input string has valid parentheses                         | Easy       | Stack           | <a href="/src/leetcode/ValidParenthesis.jl"><img src="/imgs/unnamed.png" alt="valid parenthesis" width="40" height="40"></a> |

</details>

<br>

<details open>
  <summary>Sliding Window</summary>

| Question                                | Description                                                                 | Difficulty | Type            | Solution |
|-----------------------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 121. Best Time to Buy and Sell Stock    | Find the maximum profit you can achieve from one transaction                | Easy       | Sliding Window  | <a href="/src/leetcode/MaxProfit.jl"><img src="/imgs/unnamed.png" alt="best time to buy and sell stock" width="40" height="40"></a> |
| 3. Longest Substring Without Repeating Characters | Find the length of the longest substring without repeating characters | Medium     | Sliding Window  | <a href="/src/leetcode/longestSubstringWithoutRepeatingCharacters.jl"><img src="/imgs/unnamed.png" alt="longest substring without repeating characters" width="40" height="40"></a> |
| 424. Longest Repeating Character Replacement | Find the length of the longest substring containing the same letter you can get after performing k replacements | Medium     | Sliding Window  | <a href="/src/leetcode/longestRepeatingCharacterReplacement.jl"><img src="/imgs/unnamed.png" alt="longest repeating character replacement" width="40" height="40"></a> |
| 76. Minimum Window Substring            | Find the minimum window substring of `s` such that every character in `t` is included | Hard       | Sliding Window  | <a href="/src/leetcode/MinWindow.jl"><img src="/imgs/unnamed.png" alt="minimum window substring" width="40" height="40"></a> |


</details>

<br>


<details open>
  <summary>Linked List</summary>

| Question                     | Description                                                                 | Difficulty | Type            | Solution |
|------------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 21. Merge Two Sorted Lists   | Merge two sorted linked lists and return it as a new sorted list            | Easy       | Linked List     | <a href="/src/leetcode/merge_2_sorted_lists.py"><img src="/imgs/python-programming-language.webp" alt="merge two sorted lists" width="40" height="40"></a> <a href="/src/leetcode/Merge2SortedList.jl"><img src="/imgs/unnamed.png" alt="merge two sorted lists" width="40" height="40"></a> |

</details>


## Kattis Problems

<details>
  <summary>Kattis Problems</summary>

| Problem ID     | Description                                      | Difficulty | Type                   | Solution                                                                                                      |
|----------------|--------------------------------------------------|------------|------------------------|---------------------------------------------------------------------------------------------------------------|
| hip hip        | Print "Hipp hipp hurra!" 20 times                | Easy       | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="hip hip" width="50">](/src/kattis/hip_hip.py)         |
| storafmaeli    | Check if it's anniversary                        | Easy       | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="storafmaeli" width="50">](/src/kattis/storafmaeli.py) |
| fyrirtækjanafn | Filter out consonants from input                 | Easy       | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="fyrirtækjanafn" width="50">](/src/kattis/fyrirtækjanafn.py) |
| peningar       | Calculate values accumulated from circular cells | Easy       | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="peningar" width="50">](/src/kattis/peningar.py)       |
| framvindustika | Print progress bar and %                         | Medium     | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="framvindustika" width="50">](/src/kattis/framvindustika.py) |
| message        | Extract letters from nested list to form a message| Easy       | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="message" width="50">](/src/kattis/message.py)         |
| bidendalausbid | Calculate waited time in minutes                 | Easy       | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="bidendalausbid" width="50">](/src/kattis/bidendalausbid.py) |
| hlaupafmaeli   | Check birthday for leap year                     | Medium     | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="hlaupafmaeli" width="50">](/src/kattis/hlaupafmaeli.py) |
| lidaskipting2  | Find min and max number of competitive teams that can be formed | Easy | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="lidaskipting2" width="50">](/src/kattis/lidaskipting2.py) |
| fleytitala     | Find min and max number of competitive teams that can be formed | Medium | Easy Coding Challenges | [<img src="/imgs/python-programming-language.webp" alt="fleytitala" width="50">](/src/kattis/fleytitala.py)   |
| subaruba       | Ubbi dubbi game                                  | Medium     | Array | [<img src="/imgs/python-programming-language.webp" alt="subaruba" width="50">](/src/kattis/subaruba.py)       |
| gangur         | Count passing pairs of people                    | Easy       | Array | [<img src="/imgs/python-programming-language.webp" alt="gangur" width="50">](/src/kattis/gangur.py)           |
| taktsvedjur    | Calculate scores with multipliers                | Easy       | Array | [<img src="/imgs/python-programming-language.webp" alt="taktsvedjur" width="50">](/src/kattis/taktsvedjur.py) |

</details>