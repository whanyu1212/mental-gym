# Min Heap
class Heap:
    def __init__(self):
        self.heap = [0]  # a list to store the heap, 0 is a placeholder

    def push(self, val):
        self.heap.append(val)
        i = len(self.heap) - 1  # its appended at the end

        # Percolate up
        while i > 1 and self.heap[i] < self.heap[i // 2]:
            # swap with 1 level up
            tmp = self.heap[i]
            self.heap[i] = self.heap[i // 2]
            self.heap[i // 2] = tmp
            i = i // 2

    def pop(self):
        if len(self.heap) == 1:
            # Empty heap with only a placeholder
            return None
        if len(self.heap) == 2:
            # Only 1 element in the heap which is the root
            return self.heap.pop()

        res = self.heap[1]
        # Move last value to root
        self.heap[1] = self.heap.pop()  # this is the pop from the list
        i = 1
        # Percolate down
        while 2 * i < len(self.heap):
            if (
                2 * i + 1 < len(self.heap)  # if right child exists
                and self.heap[2 * i + 1]
                < self.heap[2 * i]  # if right child is smaller than left child
                and self.heap[i]
                > self.heap[2 * i + 1]  # if right child is smaller than parent
            ):
                # Swap right child
                tmp = self.heap[i]
                self.heap[i] = self.heap[2 * i + 1]
                self.heap[2 * i + 1] = tmp
                i = 2 * i + 1  # move to right child
            elif self.heap[i] > self.heap[2 * i]:
                # Swap left child
                tmp = self.heap[i]
                self.heap[i] = self.heap[2 * i]
                self.heap[2 * i] = tmp
                i = 2 * i  # move to left child
            else:
                break
        return res

    def top(self):
        if len(self.heap) > 1:
            return self.heap[1]
        return None

    def heapify(self, arr):
        """transform an array into a min heap in O(n) time complexity"""
        # 0-th position is moved to the end
        arr.append(arr[0])

        self.heap = arr  # assign the array to the heap
        cur = (len(self.heap) - 1) // 2  # start from the last parent node
        while cur > 0:
            # Percolate down
            i = cur
            while 2 * i < len(self.heap):  # while left child exists
                if (
                    2 * i + 1 < len(self.heap)  # if right child exists
                    and self.heap[2 * i + 1] < self.heap[2 * i]
                    and self.heap[i] > self.heap[2 * i + 1]
                ):
                    # Swap right child
                    tmp = self.heap[i]
                    self.heap[i] = self.heap[2 * i + 1]
                    self.heap[2 * i + 1] = tmp
                    i = 2 * i + 1
                elif self.heap[i] > self.heap[2 * i]:
                    # Swap left child
                    tmp = self.heap[i]
                    self.heap[i] = self.heap[2 * i]
                    self.heap[2 * i] = tmp
                    i = 2 * i
                else:
                    break
            cur -= 1
