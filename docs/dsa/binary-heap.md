# Binary Heap

> Implementation: `src/dsa_from_scratch/python/binary_heap/`

## Properties
- **Shape**: Complete binary tree (filled left to right)
- **Heap order**: Parent ≤ children (min-heap) or Parent ≥ children (max-heap)
- **Array representation**: For node at index `i`:
  - Left child: `2i + 1`
  - Right child: `2i + 2`
  - Parent: `(i - 1) // 2`

## Operations & Complexity

| Operation | Time |
|-----------|------|
| Peek min/max | O(1) |
| Push | O(log n) |
| Pop min/max | O(log n) |
| Heapify (build from list) | O(n) |

## Min-Heap Skeleton
```python
class MinHeap:
    def __init__(self):
        self.data = []

    def push(self, val):
        self.data.append(val)
        self._sift_up(len(self.data) - 1)

    def pop(self):
        self.data[0], self.data[-1] = self.data[-1], self.data[0]
        val = self.data.pop()
        self._sift_down(0)
        return val

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.data[parent] > self.data[i]:
                self.data[parent], self.data[i] = self.data[i], self.data[parent]
                i = parent
            else:
                break

    def _sift_down(self, i):
        n = len(self.data)
        while True:
            smallest = i
            for child in (2*i+1, 2*i+2):
                if child < n and self.data[child] < self.data[smallest]:
                    smallest = child
            if smallest == i:
                break
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]
            i = smallest
```

## Python's `heapq`
Python provides a min-heap via `heapq`. For max-heap, negate values.
```python
import heapq
h = []
heapq.heappush(h, 3)
heapq.heappop(h)  # returns smallest
heapq.heapify(list)  # O(n) in-place
```
