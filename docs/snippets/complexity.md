# Complexity Cheatsheet

## Big-O Reference

| Complexity | Name | Example |
|-----------|------|---------|
| O(1) | Constant | Hash map lookup, array access |
| O(log n) | Logarithmic | Binary search, balanced BST ops |
| O(n) | Linear | Single-pass scan, BFS/DFS |
| O(n log n) | Linearithmic | Merge sort, heap sort, sorting-based |
| O(n²) | Quadratic | Nested loops, bubble sort |
| O(2ⁿ) | Exponential | Subsets, brute-force recursion |
| O(n!) | Factorial | Permutations |

## Data Structure Operations

| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1) | O(1) |
| Hash Map | O(1) avg | O(1) avg | O(1) avg | O(1) avg |
| BST (balanced) | O(log n) | O(log n) | O(log n) | O(log n) |
| Heap | O(1) peek | O(n) | O(log n) | O(log n) |
| Stack / Queue | O(1) top | O(n) | O(1) | O(1) |

## Sorting Algorithms

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |
| Tim Sort (Python) | O(n) | O(n log n) | O(n log n) | O(n) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |

## Graph Algorithms

| Algorithm | Time | Space | Use Case |
|-----------|------|-------|----------|
| BFS | O(V + E) | O(V) | Shortest path (unweighted) |
| DFS | O(V + E) | O(V) | Cycle detection, topo sort |
| Dijkstra | O((V+E) log V) | O(V) | Shortest path (non-negative weights) |
| Bellman-Ford | O(VE) | O(V) | Shortest path (negative weights) |
| Kruskal / Prim | O(E log E) | O(V) | Minimum spanning tree |

## Space Complexity Patterns

| Pattern | Space |
|---------|-------|
| Recursion depth (DFS on tree) | O(h) where h = height |
| BFS queue | O(w) where w = max width |
| Memoization table | O(states) |
| In-place two pointers | O(1) |
| Prefix sum array | O(n) |
