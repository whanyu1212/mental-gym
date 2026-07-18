from typing import List


class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        """
        Do not return anything, modify nums1 in-place instead.

        This is a read/write version of the fast-and-slow pointer
        pattern. The read pointers inspect values that have not been
        merged, while the write pointer marks the next position to fill.
        Working right to left prevents nums1's unmerged values from
        being overwritten.
        """
        # i reads the largest remaining value from nums1's original elements.
        i = m - 1

        # j reads the largest remaining value from nums2.
        j = n - 1

        # k writes the larger value into nums1's next open slot. We need a
        # separate write pointer because that slot may differ from both i and j.
        k = m + n - 1

        while i >= 0 and j >= 0:
            if nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
                k -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
                k -= 1

        # When the main merge loop ends, at least one input has been exhausted.
        #
        # If j < 0, nums2 has no values left. Any values still pointed to by i
        # are already in nums1, and because we merged from right to left, they
        # are already in their correct positions. No copying is necessary.
        #
        # If i < 0 but j >= 0, nums1's original values were consumed first.
        # The remaining nums2 values still need to be copied into nums1, which
        # is why the cleanup loop checks while j >= 0.
        #
        # We do not need a matching while i >= 0 loop: those values already
        # live in nums1, and merging from right to left has left them sorted.
        while j >= 0:
            nums1[k] = nums2[j]
            j -= 1
