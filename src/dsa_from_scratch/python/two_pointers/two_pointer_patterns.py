"""
Two-pointer templates, one per family in
notes/patterns/two_pointers.mdx.

Each function is the smallest version of a family's movement rule.
Before every pointer move, the comment answers the note's three
questions: what the pointer means, what is already settled, and why no
skipped candidate can be the answer.
"""


def reverse_in_place(items: list) -> None:
    """
    Mirror and swap: reverse ``items`` in place.

    Invariant: everything outside ``[left, right]`` is already in its final
    reversed position.

    Args:
        items (list): sequence to reverse; modified in place
    """
    left, right = 0, len(items) - 1
    while left < right:
        items[left], items[right] = items[right], items[left]
        # The outer pair is settled forever, so both ends move inward.
        left += 1
        right -= 1


def is_palindrome(text: str) -> bool:
    """
    Mirror and compare: is ``text`` the same forwards and backwards?

    Args:
        text (str): string to check

    Returns:
        bool: True if ``text`` is a palindrome
    """
    left, right = 0, len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True


def pair_with_sum(sorted_nums: list[int], target: int) -> tuple[int, int] | None:
    """
    Sorted-pair elimination: indices ``(i, j)`` with ``i < j`` and
    ``sorted_nums[i] + sorted_nums[j] == target``, or ``None``.

    Invariant: any answer pair lies inside ``[left, right]``.

    Args:
        sorted_nums (list[int]): values in non-decreasing order
        target (int): the sum to find

    Returns:
        tuple[int, int] | None: a matching pair of indices, if one exists
    """
    left, right = 0, len(sorted_nums) - 1
    while left < right:
        total = sorted_nums[left] + sorted_nums[right]
        if total == target:
            return left, right
        if total < target:
            # Even the largest partner is too small, so ``left`` pairs with
            # nothing in range: discard it.
            left += 1
        else:
            # Even the smallest partner is too large, so ``right`` pairs with
            # nothing in range: discard it.
            right -= 1
    return None


def max_container_area(heights: list[int]) -> int:
    """
    Converging pointers with a greedy proof: the largest
    ``(j - i) * min(heights[i], heights[j])``.

    Args:
        heights (list[int]): non-negative wall heights

    Returns:
        int: the maximum area, 0 when there are fewer than two walls
    """
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        width = right - left
        best = max(best, width * min(heights[left], heights[right]))
        # Every other pair that keeps the shorter wall is narrower and still
        # capped by that wall, so none can beat what was just measured.
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best


def compact_keep_at_most(sorted_nums: list[int], k: int) -> int:
    """
    Read/write compaction: keep at most ``k`` copies of each value in
    sorted ``sorted_nums``, in place.

    Invariant: ``sorted_nums[:write]`` is exactly the final answer for
    everything read so far.

    Args:
        sorted_nums (list[int]): values in non-decreasing order; modified
            in place
        k (int): the most copies of any value to keep, at least 1

    Returns:
        int: ``write``, the length of the kept prefix
    """
    write = 0
    for value in sorted_nums:
        # Sorted input means a value's copies are adjacent, so comparing with
        # the slot ``k`` back decides whether this copy is still allowed.
        if write < k or sorted_nums[write - k] != value:
            sorted_nums[write] = value
            write += 1
    return write


def merge_sorted(first: list[int], second: list[int]) -> list[int]:
    """
    Two-input traversal: merge two sorted lists into one sorted list.

    Invariant: ``merged`` holds every element before both read pointers,
    in order.

    Args:
        first (list[int]): values in non-decreasing order
        second (list[int]): values in non-decreasing order

    Returns:
        list[int]: all values from both inputs in non-decreasing order
    """
    i = j = 0
    merged = []
    while i < len(first) and j < len(second):
        # The smaller head is the smallest unread value overall.
        if first[i] <= second[j]:
            merged.append(first[i])
            i += 1
        else:
            merged.append(second[j])
            j += 1
    # At most one input has values left, and they are already sorted.
    merged.extend(first[i:])
    merged.extend(second[j:])
    return merged


def merge_into_first(first: list[int], m: int, second: list[int], n: int) -> None:
    """
    Two-input traversal, written backward: merge ``second`` into the
    ``m`` real values of ``first``, which has ``n`` spare slots at the
    end.

    Writing from the back never overwrites an unread value of ``first``.

    Args:
        first (list[int]): ``m`` sorted values followed by ``n`` spare
            slots; modified in place
        m (int): number of real values in ``first``
        second (list[int]): ``n`` sorted values
        n (int): number of values in ``second``
    """
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and first[i] > second[j]:
            first[write] = first[i]
            i -= 1
        else:
            first[write] = second[j]
            j -= 1
        write -= 1
    # Once ``second`` is used up, ``first[:i + 1]`` is already in place.


def unique_triplets_with_sum(nums: list[int], target: int = 0) -> list[list[int]]:
    """
    Anchor plus pair search: every distinct triple of values that sums to
    ``target``.

    Args:
        nums (list[int]): input values, in any order
        target (int): the sum to find

    Returns:
        list[list[int]]: distinct sorted triples, in ascending order
    """
    values = sorted(nums)
    triplets = []
    for anchor in range(len(values) - 2):
        # Skip a repeated anchor: it would find the same triples again.
        if anchor > 0 and values[anchor] == values[anchor - 1]:
            continue
        left, right = anchor + 1, len(values) - 1
        need = target - values[anchor]
        while left < right:
            total = values[left] + values[right]
            if total < need:
                left += 1
            elif total > need:
                right -= 1
            else:
                triplets.append([values[anchor], values[left], values[right]])
                left += 1
                right -= 1
                # Skip repeated partners for the same reason.
                while left < right and values[left] == values[left - 1]:
                    left += 1
    return triplets


def trapped_water(heights: list[int]) -> int:
    """
    Two-sided state: units of water trapped between the walls.

    Water above a bar is ``min(tallest left, tallest right) - bar``. The side
    with the smaller known maximum is settled: the other side already has a
    wall at least that tall, so its unknown part cannot lower the level.

    Args:
        heights (list[int]): non-negative bar heights

    Returns:
        int: total trapped water
    """
    left, right = 0, len(heights) - 1
    left_max = right_max = water = 0
    while left < right:
        if heights[left] < heights[right]:
            left_max = max(left_max, heights[left])
            water += left_max - heights[left]
            left += 1
        else:
            right_max = max(right_max, heights[right])
            water += right_max - heights[right]
            right -= 1
    return water


def find_middle(values: list) -> int:
    """
    Fast and slow pointers: index of the middle element (the second of two
    middles when the length is even).

    ``fast`` moves two steps for every one step of ``slow``, so ``slow`` is
    halfway when ``fast`` runs off the end.

    Args:
        values (list): a non-empty sequence

    Returns:
        int: the middle index
    """
    slow = fast = 0
    while fast + 1 < len(values):
        slow += 1
        fast += 2
    return slow


if __name__ == "__main__":
    letters = list("hello")
    reverse_in_place(letters)
    print("".join(letters))  # olleh
    print(is_palindrome("racecar"))  # True
    print(pair_with_sum([2, 7, 11, 15], 9))  # (0, 1)
    print(max_container_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
    nums = [1, 1, 1, 2, 2, 3]
    print(nums[: compact_keep_at_most(nums, 2)])  # [1, 1, 2, 2, 3]
    print(merge_sorted([1, 3, 5], [2, 4]))  # [1, 2, 3, 4, 5]
    print(unique_triplets_with_sum([-1, 0, 1, 2, -1, -4]))  # [[-1, -1, 2], [-1, 0, 1]]
    print(trapped_water([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))  # 6
    print(find_middle([1, 2, 3, 4, 5]))  # 2
