# Linked List

> Implementation: `src/dsa_from_scratch/python/list_adt/`

## Operations & Complexity

| Operation | Singly | Doubly |
|-----------|--------|--------|
| Prepend | O(1) | O(1) |
| Append | O(n) / O(1) with tail | O(1) with tail |
| Delete head | O(1) | O(1) |
| Delete tail | O(n) | O(1) |
| Search | O(n) | O(n) |
| Insert at index | O(n) | O(n) |

## Singly Linked List Skeleton
```python
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def prepend(self, val):
        node = Node(val)
        node.next = self.head
        self.head = node
        self.size += 1

    def delete_head(self):
        if not self.head:
            return None
        val = self.head.val
        self.head = self.head.next
        self.size -= 1
        return val
```

## Common Techniques
- **Dummy head**: Eliminates edge cases for head deletion/insertion
- **Two pointers**: Fast/slow for middle, cycle detection, kth from end
- **Reverse in-place**: Three-pointer approach (prev, curr, next)
