# Graphs

> Implementation: `src/dsa_from_scratch/python/graph/`

## Representations

| Representation | Space | Edge lookup | Neighbors |
|---------------|-------|------------|-----------|
| Adjacency matrix | O(V²) | O(1) | O(V) |
| Adjacency list | O(V + E) | O(degree) | O(degree) |
| Edge list | O(E) | O(E) | O(E) |

Adjacency list is preferred for sparse graphs (most practical cases).

## Graph Types
- **Directed vs Undirected**
- **Weighted vs Unweighted**
- **Cyclic vs Acyclic** (DAG = Directed Acyclic Graph)
- **Connected vs Disconnected**

## Traversal Comparison

| | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack / Recursion |
| Shortest path | ✅ (unweighted) | ❌ |
| Cycle detection | ✅ | ✅ |
| Topo sort | ✅ (Kahn's) | ✅ |
| Memory | O(width) | O(depth) |

## Shortest Path Algorithms

| Algorithm | Weights | Time |
|-----------|---------|------|
| BFS | Unweighted | O(V + E) |
| Dijkstra | Non-negative | O((V+E) log V) |
| Bellman-Ford | Any (detects neg cycles) | O(VE) |
| Floyd-Warshall | Any, all-pairs | O(V³) |

## Minimum Spanning Tree

| Algorithm | Approach | Time |
|-----------|----------|------|
| Kruskal's | Sort edges, union-find | O(E log E) |
| Prim's | Greedy, min-heap | O((V+E) log V) |
