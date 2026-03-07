# Arrays (Dynamic Array)

> Implementation: `src/dsa_from_scratch/python/arrays/`

## Operations & Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| Access by index | O(1) | Direct memory offset |
| Append (amortized) | O(1) | Doubles capacity when full |
| Insert at index | O(n) | Shift elements right |
| Delete at index | O(n) | Shift elements left |
| Search | O(n) | Linear scan |

## Key Concepts

- **Amortized O(1) append**: When array is full, allocate 2× capacity and copy. The cost is amortized over all appends.
- **Contiguous memory**: Cache-friendly, fast sequential access.
- **Dynamic resizing**: Python `list` does this automatically; implementing it yourself reveals the doubling strategy.

## Skeleton
```python
class DynamicArray:
    def __init__(self):
        self._data = [None]
        self._size = 0
        self._capacity = 1

    def append(self, val):
        if self._size == self._capacity:
            self._resize(2 * self._capacity)
        self._data[self._size] = val
        self._size += 1

    def _resize(self, new_cap):
        new_data = [None] * new_cap
        for i in range(self._size):
            new_data[i] = self._data[i]
        self._data = new_data
        self._capacity = new_cap

    def __getitem__(self, idx):
        if not 0 <= idx < self._size:
            raise IndexError("index out of range")
        return self._data[idx]

    def __len__(self):
        return self._size
```
