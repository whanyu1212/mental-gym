# Implementing Queue using Array


class ArrayQueue:
    def __init__(self, size: int):
        """Initialize the queue with an empty list"""
        self.queue = [] * size
        self.front = 0  # Front pointer in the queue
        self._size = 0

    def size(self):
        """Return the size of the queue"""
        return self._size

    def capacity(self):
        """Return the capacity of the queue"""
        return len(self.queue)

    def is_empty(self):
        return not bool(self._size)

    def push(self, item):
        if self._size == self.capacity():
            raise IndexError("The queue is full")

        rear = (self.front + self._size) % self.capacity()

        self.queue[rear] = item

        self._size += 1

    def pop(self):
        if self.is_empty():
            raise IndexError("The queue is empty")

        item = self.queue[self.front]
        self.queue[self.front] = None
        self.front = (self.front + 1) % self.capacity()
        self._size -= 1
        return item

    def peek(self):
        if self.is_empty():
            raise IndexError("The queue is empty")
        return self.queue[self.front]

    def to_list(self):
        res = [0] * self._size
        for i in range(self._size):
            res[i] = self.queue[(self.front + i) % self.capacity()]
        return res
