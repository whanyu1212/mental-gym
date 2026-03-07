# Graphs

## Representations

```python
# Adjacency list (most common)
graph = {
    0: [1, 2],
    1: [0, 3],
    2: [0],
    3: [1],
}

# Build from edge list
from collections import defaultdict
def build_graph(edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)  # undirected
    return graph
```

## BFS (Shortest Path / Level Order)
```python
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```
**Time**: O(V + E) | **Space**: O(V)

## DFS
```python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited
```
**Time**: O(V + E) | **Space**: O(V)

## Cycle Detection (Directed Graph)
```python
def has_cycle(graph, n):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n

    def dfs(u):
        color[u] = GRAY
        for v in graph[u]:
            if color[v] == GRAY:
                return True  # back edge = cycle
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK
        return False

    return any(dfs(i) for i in range(n) if color[i] == WHITE)
```

## Topological Sort (Kahn's BFS)
```python
from collections import deque

def topo_sort(n, edges):
    graph = defaultdict(list)
    in_degree = [0] * n
    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1

    queue = deque(i for i in range(n) if in_degree[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    return order if len(order) == n else []  # empty = cycle exists
```

## Related Problems
- LeetCode 200 — Number of Islands
- LeetCode 207 — Course Schedule
- LeetCode 210 — Course Schedule II
- LeetCode 417 — Pacific Atlantic Water Flow
