class ListNode:
    """Bidirectional linked list node class"""

    def __init__(self, data: int):
        self.data: int = data
        self.prev: ListNode | None = None
        self.next: ListNode | None = None


class DoublyLinkedList:
    def __init__(self):
        self.head: DoublyLinkedList | None = None
        self.tail: DoublyLinkedList | None = None
