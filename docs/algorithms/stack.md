# Stack

## When to Use
- Matching/balancing brackets, parentheses
- "Next greater/smaller element" problems
- Expression evaluation
- Monotonic stack for O(n) range queries

## Patterns

### Balanced Parentheses
```python
def is_valid(s: str) -> bool:
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return not stack
```
**Time**: O(n) | **Space**: O(n)

### Monotonic Stack (Next Greater Element)
```python
def next_greater(nums: list[int]) -> list[int]:
    result = [-1] * len(nums)
    stack = []  # indices, decreasing values
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            result[stack.pop()] = n
        stack.append(i)
    return result
```
**Time**: O(n) | **Space**: O(n)

### Min Stack
```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        min_val = min(val, self.min_stack[-1] if self.min_stack else val)
        self.min_stack.append(min_val)

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```
**Time**: O(1) all ops | **Space**: O(n)

## Related Problems
- LeetCode 20 — Valid Parentheses
- LeetCode 155 — Min Stack
- LeetCode 739 — Daily Temperatures
- LeetCode 84 — Largest Rectangle in Histogram
