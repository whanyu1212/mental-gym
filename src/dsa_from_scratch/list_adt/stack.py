# Different ways of implementing a stack in Python

# Method 1: Using a list


class ListStack:
    def __init__(self):
        self.stack = []

    def push(self, data):
        self.stack.append(data)

    def pop(self):
        if not self.stack:
            raise IndexError("You can't pop from an empty stack")
        return self.stack.pop()

    def peek(self):
        if not self.stack:
            raise IndexError("You can't peek into an empty stack")
        return self.stack[-1]

    def is_empty(self):
        return not bool(self.stack)

    def __str__(self):
        return str(self.stack)


# Method 2: Using a singly linked list


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class LinkedListStack:
    """Stack class based on linked list"""

    def __init__(self):
        """Constructor"""
        self._peek: ListNode | None = None
        self._size: int = 0

    def size(self) -> int:
        """Get the length of the stack"""
        return self._size

    def is_empty(self) -> bool:
        """Determine if the stack is empty"""
        return self._size == 0

    def push(self, val: int):
        """Push"""
        node = ListNode(val)
        node.next = self._peek
        self._peek = node
        self._size += 1

    def pop(self) -> int:
        """Pop"""
        num = self.peek()
        self._peek = self._peek.next
        self._size -= 1
        return num

    def peek(self) -> int:
        """Access stack top element"""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._peek.val

    def to_list(self) -> list[int]:
        """Convert to a list for printing"""
        arr = []
        node = self._peek
        while node:
            arr.append(node.val)
            node = node.next
        arr.reverse()
        return arr

    def __str__(self):
        """Print the stack"""
        return str(self.to_list())


# Example usage

if __name__ == "__main__":
    stack = ListStack()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    print(stack)  # [1, 2, 3]
    print(stack.pop())  # 3
    print(stack.peek())  # 2
    print(stack.is_empty())  # False
    print(stack.pop())  # 2
    print(stack.pop())  # 1
    print(stack.is_empty())  # True

    stack = LinkedListStack()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    print(stack)  # [1, 2, 3]
    print(stack.pop())  # 3
    print(stack.peek())  # 2
    print(stack.is_empty())  # False
    print(stack.pop())  # 2
    print(stack.pop())  # 1
    print(stack.is_empty())  # True
    try:
        stack.pop()
    except IndexError as e:
        print(e)  # Stack is empty
