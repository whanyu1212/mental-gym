from typing import Union


class MaxHeap:
    def __init__(self):
        # Initialize an empty heap that is 1-indexed
        # Index 0 is a placeholder
        self.heap = [0]

    def push(self, val: int):
        """Push a value into the heap.
        The comparison is the opposite of the min heap.

        Args:
            val (int): the value to be pushed into the heap
        """
        # Append puts the value at the end of the heap
        self.heap.append(val)

        i = len(self.heap) - 1

        # Now we need to percolate up

        # While the position is not at the root and it is greater than the parent node
        # Swap the value with the parent node
        while i > 1 and self.heap[i] > self.heap[i // 2]:
            self.heap[i], self.heap[i // 2] = self.heap[i // 2], self.heap[i]
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
            # Only root node for you to pop
            return self.heap.pop()

        res = self.heap[1]

        # Move the last element to the root node
        self.heap[1] = self.heap.pop()

        i = 1

        # After moving the last element to the root node
        # The heap structure is maintained but the order property is violated
        # Percolate down

        while 2 * i < len(self.heap):
            if (
                2 * i + 1 < len(self.heap)
                and self.heap[2 * i + 1] > self.heap[2 * i]
                and self.heap[2 * i + 1] > self.heap[i]
            ):  # prioritize swapping with the larger child
                # Scenario 1: Swap with the right child
                self.heap[i], self.heap[2 * i + 1] = self.heap[2 * i + 1], self.heap[i]
                i = 2 * i + 1

            elif self.heap[2 * i] > self.heap[i]:
                # Scenario 2: Swap with the left child
                self.heap[i], self.heap[2 * i] = self.heap[2 * i], self.heap[i]
                i = 2 * i

            else:  # The heap order property is satisfied
                break

        return res

    def top(self) -> Union[int, None]:
        """Return the root node of the heap.

        Returns:
            Union[int, None]: the root node of the heap
        """
        return self.heap[1] if len(self.heap) > 1 else None

    def heapify(self, arr: list):
        """Turn the array into a heap.
        No return because the heap is an
        instance variable.

        Args:
            arr (list): the array to be transformed into a heap
        """
        # 0-th position is move to the end
        arr.append(arr[0])

        self.heap = arr

        # start from the last parent node or the first non-leaf node
        # and percolate down

        # Iterate through all parent nodes starting from the last non-leaf node

        cur = len(self.heap - 1) // 2
        while cur > 0:

            i = cur

            while 2 * i < len(self.heap):  # while the left child exists
                if (
                    2 * i + 1 < len(self.heap)  # if right child exists
                    and self.heap[2 * i + 1]
                    > self.heap[2 * i]  # if right child is greater than left child
                    and self.heap[2 * i + 1]
                    > self.heap[i]  # if right child is greater than parent
                ):
                    # Scenario 1: Swap with the right child
                    self.heap[i], self.heap[2 * i + 1] = (
                        self.heap[2 * i + 1],
                        self.heap[i],
                    )
                    i = 2 * i + 1

                elif self.heap[2 * i] > self.heap[i]:
                    # Scenario 2: Swap with the left child
                    self.heap[i], self.heap[2 * i] = self.heap[2 * i], self.heap[i]
                    i = 2 * i
                else:  # The heap order property is satisfied
                    break

            cur -= 1
