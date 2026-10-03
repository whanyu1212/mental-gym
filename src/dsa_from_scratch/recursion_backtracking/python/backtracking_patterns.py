"""
How Backtracking Works
1. Define a search space
2. Recursively explore the search space
3. When reaching a state that violates constraints, backtrack to previous state
4. Continue exploring until a solution is found or all possibilities are exhausted
"""

"""Backtracking is useful when:

1. You need to find all possible solutions
2. You need to find an optimal solution among many possibilities
3. The problem can be broken down into a sequence of decisions
4. The search space is too large for brute force
"""

"""
Step-by-Step Execution of generateParenthesis(2)

Initial State:
stack = []
res = []

Step 1: Call backtrack(0, 0)
- Check if openN == closedN == n: No (0 != 2)
- Check if openN < n: Yes (0 < 2)
  - Add "(" to stack: stack = ["("]
  - Call backtrack(1, 0)

Step 2: Inside backtrack(1, 0)
- Check if openN == closedN == n: No (1 != 2)
- Check if openN < n: Yes (1 < 2)
  - Add "(" to stack: stack = ["(", "("]
  - Call backtrack(2, 0)

Step 3: Inside backtrack(2, 0)
- Check if openN == closedN == n: No (0 != 2)
- Check if openN < n: No (2 = 2)
- Check if closedN < openN: Yes (0 < 2)
  - Add ")" to stack: stack = ["(", "(", ")"]
  - Call backtrack(2, 1)

Step 4: Inside backtrack(2, 1)
- Check if openN == closedN == n: No (1 != 2)
- Check if openN < n: No (2 = 2)
- Check if closedN < openN: Yes (1 < 2)
  - Add ")" to stack: stack = ["(", "(", ")", ")"]
  - Call backtrack(2, 2)

Step 5: Inside backtrack(2, 2)
- Check if openN == closedN == n: Yes! (2 == 2 == 2)
  - Add "".join(stack) to res: res = ["(())"]
  - Return from this function call

Step 6: Back to backtrack(2, 1)
- Pop ")" from stack: stack = ["(", "(", ")"]
- No more code to execute, return

Step 7: Back to backtrack(2, 0)
- Pop ")" from stack: stack = ["(", "("]
- No more code to execute, return

Step 8: Back to backtrack(1, 0)
- Pop "(" from stack: stack = ["("]
- Check if closedN < openN: Yes (0 < 1)
  - Add ")" to stack: stack = ["(", ")"]
  - Call backtrack(1, 1)

Step 9: Inside backtrack(1, 1)
- Check if openN == closedN == n: No (1 != 2)
- Check if openN < n: Yes (1 < 2)
  - Add "(" to stack: stack = ["(", ")", "("]
  - Call backtrack(2, 1)

Step 10: Inside backtrack(2, 1)
- Check if openN == closedN == n: No (1 != 2)
- Check if openN < n: No (2 = 2)
- Check if closedN < openN: Yes (1 < 2)
  - Add ")" to stack: stack = ["(", ")", "(", ")"]
  - Call backtrack(2, 2)

Step 11: Inside backtrack(2, 2)
- Check if openN == closedN == n: Yes! (2 == 2 == 2)
  - Add "".join(stack) to res: res = ["(())", "()()"]
  - Return from this function call

Step 12: Back to backtrack(2, 1)
- Pop ")" from stack: stack = ["(", ")", "("]
- No more code to execute, return

Step 13: Back to backtrack(1, 1)
- Pop "(" from stack: stack = ["(", ")"]
- No more code to execute, return

Step 14: Back to backtrack(1, 0)
- Pop ")" from stack: stack = ["("]
- No more code to execute, return

Step 15: Back to backtrack(0, 0)
- Pop "(" from stack: stack = []
- No more code to execute, return

Final Result: res = ["(())", "()()"]
"""
