# Implementing a double-ended queue using a doubly linked list.


class ListNode:
    def __init__(self):
        self.data = None
        self.next: ListNode | None = None
        self.prev: ListNode | None = None


class LinkedListDequeue:
    def __init__(self):
        self.front = None  # head node is the front node
        self.rear = None  # tail node is the rear node
        self._size = 0

    def is_empty(self) -> bool:
        return not bool(self._size)

    def size(self) -> int:
        return self._size

    def push(self, num, is_front):
        new_node = ListNode()
        new_node.data = num
        if self.is_empty():
            # If the list is empty, the new node becomes the head and tail of the queue
            self.front = self.rear = new_node
        elif is_front:
            # if front is True, insert at the beginning
            new_node.next = self.front
            self.front.prev = new_node
            # setting the new node to the front
            self.front = new_node
        else:
            # if front is False, insert at the end
            new_node.prev = self.rear
            self.rear.next = new_node
            self.rear = new_node
        self._size += 1

    def push_first(self, num: int):
        self.push(num, True)

    def push_last(self, num: int):
        self.push(num, False)

    def pop(self, is_front):
        if self.is_empty():
            raise IndexError("The dequeue is empty")
        if is_front:
            item = self.front.data
            self.front = self.front.next
            if self.front:
                self.front.prev = None
            else:
                self.rear = None
        else:
            item = self.rear.data
            self.rear = self.rear.prev
            if self.rear:
                self.rear.next = None
            else:
                self.front = None
        self._size -= 1
        return item

    def pop_first(self):
        return self.pop(True)

    def pop_last(self):
        return self.pop(False)

    def peek_first(self):
        if self.is_empty():
            raise IndexError("The dequeue is empty")
        return self.front.data

    def peek_last(self):
        if self.is_empty():
            raise IndexError("The dequeue is empty")
        return self.rear.data

    def to_array(self):
        node = self._front
        res = [0] * self.size()
        for i in range(self.size()):
            res[i] = node.val
            node = node.next
        return res
