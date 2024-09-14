# Implementation of basic properties of a heap data structure such as the parent-child relationship

# Assuming the heap is stored in an array and it follows the 0-based indexing


class Heap:
    def __init__(self):
        """Initialize an empty heap for illustration purposes."""
        self.heap = [0]  # Placeholder for 1-based indexing

    def left(self, i: int) -> int:
        """Get index of left child node"""
        return 2 * i

    def right(self, i: int) -> int:
        """Get index of right child node"""
        return 2 * i + 1

    def parent(self, i: int) -> int:
        """Get index of parent node"""
        return i // 2  # Integer division down

    def peek(self) -> int:
        """Access heap top element"""
        if len(self.heap) <= 1:
            raise IndexError("Heap is empty")
        return self.heap[1]
