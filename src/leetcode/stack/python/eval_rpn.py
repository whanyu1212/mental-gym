from typing import List


class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []

        for token in tokens:
            if token in ["+", "-", "*", "/"]:
                operand2 = stack.pop()
                operand1 = stack.pop()
                if token == "+":
                    stack.append(operand1 + operand2)
                elif token == "-":
                    stack.append(operand1 - operand2)
                elif token == "*":
                    stack.append(operand1 * operand2)
                else:
                    stack.append(int(operand1 / operand2))
            else:
                stack.append(int(token))

        return stack.pop()


if __name__ == "__main__":
    solution = Solution()

    # Example 1
    tokens = ["2", "1", "+", "3", "*"]
    # Explanation: ((2 + 1) * 3) = 9
    assert (result := solution.evalRPN(tokens)) == 9, f"unexpected {result=}"
