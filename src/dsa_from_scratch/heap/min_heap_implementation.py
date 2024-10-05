# Implementaion of a min heap using a list representation.
from typing import Union


class MinHeap:
    def __init__(self):
        # Initialize an empty heap that is 1-indexed
        # Index 0 is a placeholder
        self.heap = [0]

    def push(self, val: int):
        """Push a value into the heap.
        The heap is modified in-place and
        thus the return value is None.

        Args:
            val (int): the value to be pushed into the heap
        """
        self.heap.append(val)
        # The new value is appended to the end of the heap initially
        i = len(self.heap) - 1

        # Percolate up

        # While the position is not at the root
        # and the value is less than the parent
        while i > 1 and self.heap[i] < self.heap[i // 2]:
            # swap with 1 level up
            # you can do this in python with tuple unpacking
            self.heap[i], self.heap[i // 2] = self.heap[i // 2], self.heap[i]
            # update the index by moving 1 level up
            i = i // 2

    def pop(self) -> int:
        """Popping the root node from the heap
        while maintaining the heap structure and order property.

        Returns:
            int: the value of the root node that was popped
        """

        # Base cases:

        if len(self.heap) == 1:
            # You can't pop from an empty heap
            return None
        if len(self.heap) == 2:
            # Only 1 element in the heap which is the root
            return self.heap.pop()

        res = self.heap[1]

        # list.pop returns the last element of the list
        # Move it to the root node to maintain the heap structure (complete binary tree)
        self.heap[1] = self.heap.pop()
        i = 1

        # It still violates the order property of the heap
        # Percolate down
        # Heap is filled from left to right
        # So, we start by checking the left child first
        while 2 * i < len(self.heap):
            if (
                2 * i + 1 < len(self.heap)  # if right child exists
                and self.heap[2 * i + 1]
                < self.heap[2 * i]  # if right child is smaller than left child
                and self.heap[i]
                > self.heap[2 * i + 1]  # if right child is smaller than parent
            ):
                # Scenario 1: Swap right child
                self.heap[i], self.heap[i // 2] = self.heap[i // 2], self.heap[i]
                i = 2 * i + 1  # move to right child

            elif self.heap[i] > self.heap[2 * i]:
                # Scenario 2: Swap left child
                self.heap[i], self.heap[i // 2] = self.heap[i // 2], self.heap[i]
                i = 2 * i  # move to left child
            else:  # Scenario 3: No need to swap
                break
        return res

    def top(self) -> Union[int, None]:  # peek
        """Peek the root node of the heap.

        Returns:
            Union[int, None]: the root node of the heap
            if it exists, else None
        """
        if len(self.heap) > 1:
            return self.heap[1]
        return None

    def heapify(self, arr: list):
        """Transform an array into a heap.
        We are using list in the context of
        python. The idea is that we percolate
        each element down the tree until the
        right position is found.

        Args:
            arr (list): the array to be transformed into a heap
        """
        # 0-th position is moved to the end
        arr.append(arr[0])

        self.heap = arr  # assign the array to the heap

        # start from the last parent node or the first non-leaf node
        cur = (len(self.heap) - 1) // 2
        while cur > 0:  # While index is valid and there are still parent nodes
            # Percolate down
            i = cur
            while 2 * i < len(self.heap):  # while left child exists
                if (
                    2 * i + 1 < len(self.heap)  # if right child exists
                    and self.heap[2 * i + 1]
                    < self.heap[2 * i]  # if right child is smaller
                    and self.heap[i]
                    > self.heap[2 * i + 1]  # if parent is greater than right child
                ):
                    # Scenario 1: Swap right child
                    self.heap[i], self.heap[2 * i + 1] = (
                        self.heap[2 * i + 1],
                        self.heap[i],
                    )
                    i = 2 * i + 1

                elif self.heap[i] > self.heap[2 * i]:
                    # Swap left child
                    self.heap[i], self.heap[2 * i] = (
                        self.heap[2 * i],
                        self.heap[i],
                    )
                    i = 2 * i
                else:
                    break
            cur -= 1  # move to the next parent node
