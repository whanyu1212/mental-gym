# DSA Curriculum and Reference

Use this module as a teaching reference. Select topics based on the learner's goal, demonstrated gaps, and the repository's practice categories.

## Foundations

- Big-O time and space analysis
- Recursion, call stacks, and base cases
- References, mutation, and memory basics
- Testing, tracing, and edge-case reasoning
- Loop invariants and correctness arguments

## Data Structures

- Arrays and strings
- Linked lists
- Stacks and queues
- Hash maps and sets
- Trees and binary search trees
- Heaps and priority queues
- Tries
- Graphs
- Disjoint set union

## Algorithms and Patterns

- Sorting and binary search
- Two pointers
- Sliding windows
- Prefix sums and difference arrays
- Intervals
- Monotonic stacks and queues
- Tree traversal
- Graph traversal and shortest paths
- Backtracking
- Greedy algorithms
- Dynamic programming
- Bit manipulation

## Topic Teaching Rules

For every data structure or algorithm, guide the learner through:

1. **Purpose:** What problem does it help solve?
2. **Naive baseline:** What would a simpler approach cost?
3. **Mental model:** Use a small example, diagram, or manual trace.
4. **Operations:** What changes during each operation?
5. **Invariant:** What property must remain true?
6. **Complexity:** Why are the time and space bounds correct?
7. **Implementation:** Have the learner write a minimal version.
8. **Recognition:** When does the technique fit, and when does it not?
9. **Practice:** Give one direct exercise, one variation, and one interview-style problem.

## Pattern Recognition Prompts

Use prompts that reveal reasoning without prematurely giving away the solution.

- “What work is repeated between adjacent candidate solutions?”
- “What information would let you make the next decision in constant time?”
- “Can the input be processed in an order that makes earlier results reusable?”
- “What condition must remain true as the pointers or state change?”
- “What is the brute-force approach, and where does its cost come from?”
- “Can you choose a subproblem whose answer helps build the larger answer?”
- “What happens if you trace this example manually?”

## Repository Alignment

When suggesting practice, prefer the existing category structure:

- `src/leetcode/arrays_hashing/`
- `src/leetcode/sliding_window/`
- `src/leetcode/stack/`
- Other pattern/category directories under `src/leetcode/`

Use relevant conceptual notes under `notes/` as supplemental material when available.

## Suggested Learning Path

1. Foundations: complexity, arrays, strings, hash maps, recursion.
2. Core patterns: two pointers, sliding window, prefix sums, binary search.
3. Linear structures: linked lists, stacks, queues, monotonic structures.
4. Trees and heaps: traversals, BSTs, priority queues, tries.
5. Graphs: BFS, DFS, topological sort, union-find, shortest paths.
6. Advanced problem solving: backtracking, greedy algorithms, dynamic programming.
7. Interview practice: mixed pattern recognition, communication, and timed exercises.

## Mastery Check

A learner has demonstrated working mastery of a topic when they can:

- Explain its core invariant or decision rule.
- Identify suitable and unsuitable use cases.
- Implement it without copying a template.
- Analyze time and space complexity.
- Handle common edge cases.
- Adapt it to a meaningful variation.
