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

  [Singly Linked List](./src/dsa_from_scratch/linked_list/singly_linked_list.py)
  [Doubly Linked List](./src/dsa_from_scratch/linked_list/doubly_linked_list.py)
  
</details>


## LeetCode Questions
Gradually adding the questions in different languages (Python, Julia & C++)

<details>
  <summary>Arrays & Hashing</summary>

<details>
  <summary>Arrays & Hashing</summary>

| Question                | Description                                                                 | Difficulty | Type            | Solution |
|-------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 1. Two Sum              | Find two indices in a vector such that the numbers add up to a target value | Easy       | Arrays, Hashing | <a href="/src/leetcode/twoSum.jl"><img src="/imgs/unnamed.png" alt="two sum" width="40" height="40"></a> |
| 242. IsAnagram          | Determine if two strings are anagrams of each other                         | Easy       | Hashing         | <a href="/src/leetcode/isAnagram.jl"><img src="/imgs/unnamed.png" alt="is anagram" width="40" height="40"></a>|
| 217. Contains Duplicate | Check if a vector contains any duplicates                                   | Easy       | Arrays, Hashing | <a href="/src/leetcode/containsDuplicate.jl"><img src="/imgs/unnamed.png" alt="contains duplicate" width="40" height="40"></a> |
| 128. Longest Consecutive Sequence | Find the length of the longest consecutive elements sequence | Medium | Arrays, Hashing | <a href="/src/leetcode/LongestConsecutive.jl"><img src="/imgs/unnamed.png" alt="longest consecutive sequence" width="40" height="40"></a> |
| 271. Encode and Decode Strings | Encode a list of strings to a single string and decode it back to the list | Medium | Arrays, String Manipulation | <a href="/src/leetcode/EncodeDecodeString.jl"><img src="/imgs/unnamed.png" alt="encode decode string" width="40" height="40"></a> |
| 49. Group Anagrams           | Group strings into anagrams                                                 | Medium     | Hashing, Sorting| <a href="/src/leetcode/groupAnagrams.jl"><img src="/imgs/unnamed.png" alt="group anagrams" width="40" height="40"></a> |
| 219. Close Duplicates        | Check if a vector contains duplicates within a given range                  | Easy       | Sliding Window  | <a href="/src/leetcode/closeDuplicates.jl"><img src="/imgs/unnamed.png" alt="close duplicates" width="40" height="40"></a> |
| 1343. NumOfSubarrays         | Count subarrays with average greater than or equal to a threshold           | Medium     | Sliding Window  | <a href="/src/leetcode/numOfSubarrays.jl"><img src="/imgs/unnamed.png" alt="num of subarrays" width="40" height="40"></a> |

</details>

<details>
  <summary>Two Pointers</summary>

| Question                     | Description                                                                 | Difficulty | Type            | Solution |
|------------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 125. Valid Palindrome        | Determine if a string is a palindrome, considering only alphanumeric characters and ignoring cases | Easy | Two Pointers | <a href="/src/leetcode/isPalindrome.jl"><img src="/imgs/unnamed.png" alt="is palindrome" width="40" height="40"></a> |
| 15. Three Sum                | Find all unique triplets in the array which gives the sum of zero           | Medium     | Two Pointers    | <a href="/src/leetcode/threeSum.jl"><img src="/imgs/unnamed.png" alt="three sum" width="40" height="40"></a> |
| 11. Container With Most Water| Find two lines that together with the x-axis form a container, such that the container contains the most water | Medium | Two Pointers | <a href="/src/leetcode/MaxArea.jl"><img src="/imgs/unnamed.png" alt="container with most water" width="40" height="40"></a> |

</details>

<details>
  <summary>Stack</summary>

| Question                | Description                                                                 | Difficulty | Type            | Solution |
|-------------------------|-----------------------------------------------------------------------------|------------|-----------------|----------|
| 20. Valid Parenthesis   | Determine if the input string has valid parentheses                         | Easy       | Stack           | <a href="/src/leetcode/ValidParenthesis.jl"><img src="/imgs/unnamed.png" alt="valid parenthesis" width="40" height="40"></a> |

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