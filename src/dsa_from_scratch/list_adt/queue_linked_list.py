# Implementing queue using linked list


class ListNode:
    """Linked list node class"""

    def __init__(self, data: int):
        self.data: int = data  # Node value
        self.next: ListNode | None = None  # Reference to the next node


class LinkedListQueue:
    def __init__(self):
        # Initialize the queue with an empty linked list

        # We need both front and rear pointers to keep track of the queue
        # in contrary to the stack where we only needed the head pointer
        self.front = self.rear = None
        self.size = 0

    def size(self):
        """Return the size of the queue"""
        return self.size

    def is_empty(self):
        """Check if the queue is empty"""
        return not bool(self.size)

    def enqueue(self, item):
        """Add an item to the queue"""
        new_node = ListNode(item)
        if self.is_empty():
            self.front = self.rear = new_node
        else:
            self.rear.next = new_node
            self.rear = new_node
        self.size += 1

    def dequeue(self):
        """Remove and return the first item from the queue"""
        if self.is_empty():
            raise IndexError("The queue is empty")
        item = self.front.data
        self.front = self.front.next
        self.size -= 1
        return item

    def peek(self):
        """Return the first item from the queue"""
        if self.is_empty():
            raise IndexError("The queue is empty")
        return self.front.data

    def to_list(self):
        lst = []
        current = self.front
        while current:
            lst.append(current.data)
            current = current.next
        return lst
