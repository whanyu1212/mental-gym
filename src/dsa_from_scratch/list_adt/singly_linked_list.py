# A linked list is a linear data structure in which each element is a node object,
# and the nodes are interconnected through "references". These references hold the
# memory addresses of subsequent nodes, enabling navigation from one node to the next.
from colorama import Fore, Style, init

init(autoreset=True)


class ListNode:
    """Linked list node class"""

    def __init__(self, data: int):
        self.data: int = data  # Node value
        self.next: ListNode | None = None  # Reference to the next node


class SinglyLinkedList:
    def __init__(self):
        """Initialize an empty singly linked list,
        assuming that the head node is None"""
        self.head = None

    def insert(self, data, position=None):
        new_node = ListNode(data)
        if position is None or position == 0:  # Insert at the beginning
            new_node.next = self.head
            self.head = new_node
        else:
            current = self.head
            for _ in range(position - 1):
                if current is None:
                    raise IndexError("Position out of range")
                current = current.next
            new_node.next = current.next
            current.next = new_node

    def remove(self, data):
        if self.head is None:
            return

        if self.head.data == data:
            self.head = self.head.next
            return

        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                return
            current = current.next

    def access(self, position):
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

    def __str__(self):
        values = []
        current = self.head
        while current:
            # values.append(str(current.data))
            values.append(str(current.data))
            current = current.next
        return " -> ".join(values)


# Example usage
if __name__ == "__main__":
    # Initialize a singly linked list
    # The head node is None at the start
    singly_linked_list = SinglyLinkedList()
    # Insert elements
    singly_linked_list.insert(1)
    singly_linked_list.insert(2)
    singly_linked_list.insert(3)
    singly_linked_list.insert(4)
    # Print the linked list
    print(singly_linked_list)  # 4 -> 3 -> 2 -> 1
    singly_linked_list.insert(5, 2)
    print(singly_linked_list)  # 4 -> 3 -> 5 -> 2 -> 1
    singly_linked_list.remove(3)
    print(singly_linked_list)  # 4 -> 5 -> 2 -> 1
    print(singly_linked_list.access(2))  # 2
    print(singly_linked_list.find(5))  # 1
