# Code Templates

Quick-copy boilerplate for common algorithm patterns.

## Python Imports
```python
from collections import defaultdict, deque, Counter
from heapq import heappush, heappop, heapify
from functools import lru_cache
from itertools import accumulate
from bisect import bisect_left, bisect_right
import sys
input = sys.stdin.readline  # faster I/O for competitive programming
```

## Binary Search
```python
def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1
```

## BFS Template
```python
from collections import deque
def bfs(start, graph):
    visited = {start}
    queue = deque([(start, 0)])  # (node, distance)
    while queue:
        node, dist = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
```

## DFS Template (iterative)
```python
def dfs(start, graph):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited: continue
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
```

## Backtracking Template
```python
def backtrack(state, choices):
    if is_complete(state):
        result.append(state[:])
        return
    for choice in choices:
        if is_valid(state, choice):
            state.append(choice)
            backtrack(state, choices)
            state.pop()
```

## Union-Find (Disjoint Set Union)
```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        return True
```

## Min Heap / Priority Queue
```python
import heapq
heap = []
heapq.heappush(heap, (priority, item))
priority, item = heapq.heappop(heap)

# Max heap: negate values
heapq.heappush(heap, (-priority, item))
```

## Grid BFS (4-directional)
```python
def grid_bfs(grid, start_r, start_c):
    rows, cols = len(grid), len(grid[0])
    visited = {(start_r, start_c)}
    queue = deque([(start_r, start_c)])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr,nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc))
```
