# Implementing Stack using Array


class ArrayStack:
    def __init__(self):
        """Initialize the stack with an empty lists"""
        self.stack = []

    # Add various methods for stack operations
    def size(self):
        """Return the size of the stack"""
        return len(self.stack)

    def is_empty(self):
        """Check if the stack is empty"""
        return not bool(self.stack)

    def push(self, item):
        """Add an item to the stack"""
        self.stack.append(item)

    def pop(self):
        """Remove and return the last item from the stack"""
        if self.is_empty():
            raise IndexError("The stack is empty")
        return self.stack.pop()

    def peek(self):
        """Return the last item from the stack"""
        if self.is_empty():
            raise IndexError("The stack is empty")
        return self.stack[-1]

    def __str__(self):
        """print the stack items using string"""
        return str(self.stack)


# Example usage
if __name__ == "__main__":
    array_stack = ArrayStack()

    for i in range(1, 6):
        array_stack.push(i)
    print(array_stack, "\n")  # [1, 2, 3, 4, 5]

    print(f"Size of the stack: {array_stack.size()}")  # 5
    print(f"Is the stack empty? {array_stack.is_empty()}")  # False
    print(f"Peek: {array_stack.peek()}")  # 5
    print(f"Pop: {array_stack.pop()}")  # 5
    print(f"Peek: {array_stack.peek()}")  # 4
    print(array_stack)  # [1, 2, 3, 4]
