# Kattis Problems

> Solutions live in `src/kattis/python/`

## Solved

| Problem | Difficulty | Approach | Notes |
|---------|-----------|----------|-------|
| Hip Hip | Easy | String output | Pattern counting |

## Tips for Kattis

- **I/O**: Use `sys.stdin` for faster reads on large inputs
  ```python
  import sys
  input = sys.stdin.readline
  ```
- **Multiple test cases**: Read until EOF with `for line in sys.stdin:`
- **Floating point**: Watch for precision — use `f"{val:.6f}"` or `round()`
- **Time limits**: Python is often ~3-5x slower than C++ — optimize hot loops

## Common Input Patterns

```python
import sys
input = sys.stdin.readline

# Single line of ints
a, b = map(int, input().split())

# n lines of values
n = int(input())
values = [int(input()) for _ in range(n)]

# Grid input
rows = []
for _ in range(n):
    rows.append(list(map(int, input().split())))
```
