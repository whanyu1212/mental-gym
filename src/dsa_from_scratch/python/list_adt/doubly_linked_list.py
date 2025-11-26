# In contrast to a singly linked list, a doubly linked list maintains references
# in two directions. Each node contains references (pointer) to both its successor
# (the next node) and predecessor (the previous node). Although doubly linked lists
# offer more flexibility for traversing in either direction, they also consume more memory space.
from colorama import Fore, Style, init

init(autoreset=True)


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

    def insert(self, data, position=None):
        new_node = ListNode(data)
        # Insert at the beginning
        # If the list is empty, the new node becomes the head and tail
        if self.head is None:
            self.head = self.tail = new_node
        # If position is not specified or 0, insert at the beginning
        elif position is None or position == 0:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
        else:
            # the goal is to move the current pointer to the node just before the position
            current = self.head
            for _ in range(position - 1):
                if current.next is None:  # check if the current node is the last node
                    break
                current = current.next  # move the current pointer to the next node
            # insert the new node between the current node and the next node
            new_node.next = current.next
            new_node.prev = current
            if current.next:
                current.next.prev = new_node
            else:  # if the current node is the last node, update the tail
                self.tail = new_node
            current.next = new_node

    def remove(self, data):
        current = self.head
        while current:
            if current.data == data:
                if current.prev:
                    current.prev.next = current.next
                else:
                    self.head = current.next
                if current.next:
                    current.next.prev = current.prev
                else:
                    self.tail = current.prev
                return
            current = current.next

    def access(self, position):
        if position < 0:
            raise IndexError("Position out of range")

        if position > self.size() // 2:
            current = self.tail
            for _ in range(self.size() - position - 1):
                if current is None:
                    raise IndexError("Position out of range")
                current = current.prev
        else:
            current = self.head
            for _ in range(position):
                if current is None:
                    raise IndexError("Position out of range")
                current = current.next
        return current.data

    def find(self, data):
        current = self.head
        position = 0
        while current:
            if current.data == data:
                return position
            current = current.next
            position += 1
        return -1  # Not found

    def size(self):
        count = 0
        current = self.head
        while current:
            count += 1
            current = current.next
        return count

    def __str__(self):
        values = []
        current = self.head
        while current:
            values.append(str(current.data))
            current = current.next
        return " <-> ".join(values)


# Example usage
if __name__ == "__main__":
    doubly_linked_list = DoublyLinkedList()
    doubly_linked_list.insert(1)
    doubly_linked_list.insert(2)
    doubly_linked_list.insert(3)
    print(doubly_linked_list)
    doubly_linked_list.insert(4, 1)
    print(doubly_linked_list)
    doubly_linked_list.remove(3)
    print(doubly_linked_list)
    doubly_linked_list.access(1)  # 4
    doubly_linked_list.find(2)  # 1
