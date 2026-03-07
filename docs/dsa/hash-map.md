# Hash Map

> Implementation: `src/dsa_from_scratch/python/hash_map/`

## Operations & Complexity

| Operation | Average | Worst (all collisions) |
|-----------|---------|----------------------|
| Get | O(1) | O(n) |
| Put | O(1) | O(n) |
| Delete | O(1) | O(n) |

## Key Concepts

### Hash Function
Maps a key to a bucket index: `index = hash(key) % capacity`

Good hash functions:
- Distribute keys uniformly
- Fast to compute
- Deterministic

### Collision Resolution
**Separate chaining** (used here): Each bucket holds a linked list of `(key, value)` pairs.

**Open addressing**: Probe for next empty slot (linear, quadratic, or double hashing).

### Load Factor & Rehashing
- **Load factor** `α = n / capacity` (n = number of entries)
- Rehash when `α > 0.75` — resize to 2× capacity and re-insert all entries

## Skeleton (Separate Chaining)
```python
class HashMap:
    def __init__(self, capacity=16):
        self.capacity = capacity
        self.buckets = [[] for _ in range(capacity)]
        self.size = 0

    def _index(self, key):
        return hash(key) % self.capacity

    def put(self, key, val):
        idx = self._index(key)
        for i, (k, v) in enumerate(self.buckets[idx]):
            if k == key:
                self.buckets[idx][i] = (key, val)
                return
        self.buckets[idx].append((key, val))
        self.size += 1
        if self.size / self.capacity > 0.75:
            self._rehash()

    def get(self, key):
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        raise KeyError(key)

    def _rehash(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        for bucket in old_buckets:
            for k, v in bucket:
                self.put(k, v)
```
