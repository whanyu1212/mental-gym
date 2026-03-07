# Linked List

## When to Use
- In-place reversal with O(1) space
- Cycle detection
- Merging / splitting lists
- Finding middle, kth from end

## Patterns

### Reverse a Linked List
```python
def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
```
**Time**: O(n) | **Space**: O(1)

### Fast & Slow Pointers (Floyd's)
```python
# Detect cycle
def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

# Find middle
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```
**Time**: O(n) | **Space**: O(1)

### Merge Two Sorted Lists
```python
def merge(l1, l2):
    dummy = curr = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next
```
**Time**: O(n + m) | **Space**: O(1)

### Dummy Head Pattern
Use a dummy node to simplify edge cases (empty list, single node):
```python
dummy = ListNode(0)
dummy.next = head
curr = dummy
# ... manipulate list ...
return dummy.next
```

## Related Problems
- LeetCode 206 — Reverse Linked List
- LeetCode 21 — Merge Two Sorted Lists
- LeetCode 141 — Linked List Cycle
- LeetCode 19 — Remove Nth Node From End
