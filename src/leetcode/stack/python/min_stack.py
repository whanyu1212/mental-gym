# This LeetCode challenge requires building a stack that supports
# push, pop, top, and retrieving the minimum element in O(1) time.


# The 2 stack method is more intuitive than the 1 stack method.
class MinStack:
    def __init__(self):
        self.stack = []
        self.minStack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        val = min(val, self.minStack[-1] if self.minStack else val)
        self.minStack.append(val)

    def pop(self) -> None:
        self.stack.pop()
        self.minStack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.minStack[-1]


# example usage
if __name__ == "__main__":
    minStack = MinStack()
    minStack.push(-2)
    minStack.push(0)
    minStack.push(-3)
    print(minStack.getMin())  # -3
    minStack.pop()
    print(minStack.top())  # 0
    print(minStack.getMin())  # -2
