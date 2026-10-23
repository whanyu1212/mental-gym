from typing import List


class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        """
        Keep at most two copies of each value in sorted ``nums`` in
        place.

        Return ``k`` such that ``nums[:k]`` is the compacted result. The order
        of the kept values must remain sorted.
        """
        # ``write`` is the next keep-slot. ``nums[:write]`` is already a legal
        # answer. ``read`` scans every candidate.
        #
        # Not a swap. When a value is rejected, ``write`` stays put — that
        # slot is now a hole. The next keeper is copied into the waiting
        # ``write``.
        #
        #   skip extra  →  write stays  →  hole
        #   keep next   →  nums[write] = nums[read]  →  write moves
        #
        # Write ``nums[read]`` at ``write`` iff it would not be a third copy
        # of the prefix we have already accepted. Sorted input makes that
        # test ``nums[read] != nums[write - 2]``.
        #
        # ``write < 2`` short-circuits so ``nums[write - 2]`` is never
        # evaluated while ``write`` is 0 or 1 (Python would silently read
        # ``nums[-2]``).
        #
        # Invariant: after each ``read``, ``nums[:write]`` is the correct
        # compaction of ``nums[:read + 1]`` — sorted, at most two of each
        # value.
        #
        # Example: nums = [1, 1, 1, 2]
        #   read=0,1  write<2         keep both 1s     prefix [1, 1], write=2
        #   read=2    nums[0] == 1    skip 3rd 1       write stays on the hole
        #   read=3    nums[0] != 2    copy 2 into write
        #                             prefix [1, 1, 2], write=3
        write = 0
        for read in range(len(nums)):
            if write < 2 or nums[read] != nums[write - 2]:
                nums[write] = nums[read]
                write += 1
        return write
