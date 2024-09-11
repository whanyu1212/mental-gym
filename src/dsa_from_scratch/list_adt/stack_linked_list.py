# Implementing Stack using Linked List


class ListNode:
    """Linked list node class"""

    def __init__(self, data: int):
        self.data: int = data  # Node value
        self.next: ListNode | None = None  # Reference to the next node


class LinkedListStack:
    def __init__(self):
        # Initialize the stack with an empty linked list

        self.head = None
        self.size = 0

    def size(self):
        """Return the size of the stack"""
        return self.size

    def is_empty(self):
        """Check if the stack is empty"""
        return not bool(self.size)

    def push(self, item):
        """Add an item to the stack
        and make it the head of the linked list"""
        new_node = ListNode(item)
        new_node.next = self.head
        self.head = new_node
        self.size += 1

    def pop(self):
        """Remove and return the last item from the stack"""
        if self.is_empty():
            raise IndexError("The stack is empty")
        item = self.head.data
        self.head = self.head.next
        self.size -= 1
        return item

    def peek(self):
        """Return the last item from the stack"""
        if self.is_empty():
            raise IndexError("The stack is empty")
        return self.head.data

    def to_list(self):
        """Convert the stack to a list"""
        stack_list = []
        current = self.head
        while current:
            stack_list.append(current.data)
            current = current.next
        return stack_list


# Example usage
if __name__ == "__main__":
    linked_list_stack = LinkedListStack()

    linked_list_stack.push(1)
    linked_list_stack.push(2)
    linked_list_stack.push(3)
    print(linked_list_stack.head.next.data)  # 2
    print(linked_list_stack.peek())  # 3
    lst = linked_list_stack.to_list()  # [3, 2, 1]
    print(lst)
