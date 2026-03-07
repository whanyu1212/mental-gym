class ArrayDeque:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.data = [0] * capacity
        self.front = 0
        self.rear = 0
        self.size = 0

    def is_empty(self) -> bool:
        return self.size == 0

    def is_full(self) -> bool:
        return self.size == self.capacity

    def push_first(self, num: int):
        if self.is_full():
            raise IndexError("The deque is full")
        self.front = (self.front - 1) % self.capacity
        self.data[self.front] = num
        self.size += 1

    def push_last(self, num: int):
        if self.is_full():
            raise IndexError("The deque is full")
        self.data[self.rear] = num
        self.rear = (self.rear + 1) % self.capacity
        self.size += 1

    def pop_first(self):
        if self.is_empty():
            raise IndexError("The deque is empty")
        item = self.data[self.front]
        self.data[self.front] = None
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return item

    def pop_last(self):
        if self.is_empty():
            raise IndexError("The deque is empty")
        self.rear = (self.rear - 1) % self.capacity
        item = self.data[self.rear]
        self.data[self.rear] = None
        self.size -= 1
        return item

    def peek_first(self):
        if self.is_empty():
            raise IndexError("The deque is empty")
        return self.data[self.front]

    def peek_last(self):
        if self.is_empty():
            raise IndexError("The deque is empty")
        return self.data[(self.rear - 1) % self.capacity]

    def to_array(self):
        result = []
        for i in range(self.size):
            result.append(self.data[(self.front + i) % self.capacity])
        return result
