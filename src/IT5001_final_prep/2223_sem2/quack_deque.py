# Reference: https://www.geeksforgeeks.org/deque-in-python/

from collections import deque


class Quack:
    def __init__(self):  # for this section, you MUST use Python deque
        self.d = deque()

    def left(self):  # shown as an example
        if not self.d:
            return None
        return self.d[0]  # returns the leftmost element in O(1)

    def right(self):  # returns the rightmost element in O(1) (1 mark)
        if not self.d:
            return None
        return self.d[-1]

    def QuackPush(self, x):  # implement O(1) QuackPush (1 mark)
        # add a new element 𝑥 to the left end of the Quack
        # no return value is needed for QuackPush
        self.d.appendleft(x)  # modifies the Quack inplace

    def QuackPop(self):  # implement O(1) QuackPop (1 mark)
        # remove and return the leftmost element in the Quack
        if not self.d:
            return None
        return self.d.popleft()

    def QuackPull(self):  # implement QuackPull (1 mark)
        if not self.d:
            return None
        return self.d.pop()  # return and remove the rightmost element in the Quack
