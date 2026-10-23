"""
A growable array using a Python list only as fixed-size backing storage.

Invariant: 0 <= size <= capacity. Live values occupy [0, size); unused
slots contain None. None is also a valid value: size, not a sentinel,
determines whether a slot is live.

Growth doubles capacity (zero grows to one), copying values manually.
Across n appends the copies form a geometric series, totaling O(n). Thus
append is amortized O(1), although one growing append costs O(n). This
models the idea, not CPython's exact list growth policy.
"""

from typing import Generic, TypeVar, cast

T = TypeVar("T")


class DynamicArray(Generic[T]):
    """
    Nonnegative indexing only; no slicing or automatic shrinking.

    Invalid indices raise IndexError, including pop on an empty array.
    Removal clears references so unused slots do not keep objects alive.
    """

    def __init__(self, capacity: int = 0) -> None:
        if capacity < 0:
            raise ValueError("capacity must be nonnegative")
        self._data: list[T | None] = [None] * capacity
        self._size = 0

    def __len__(self) -> int:
        return self._size

    @property
    def capacity(self) -> int:
        return len(self._data)

    def _check_index(self, index: int) -> None:
        if not 0 <= index < self._size:
            raise IndexError("array index out of range")

    def get(self, index: int) -> T:
        """Read a live value in O(1) time."""
        self._check_index(index)
        return cast(T, self._data[index])

    def set(self, index: int, value: T) -> None:
        """Replace a live value in O(1) time."""
        self._check_index(index)
        self._data[index] = value

    def _grow_if_full(self) -> None:
        if self._size < self.capacity:
            return
        new_capacity = max(1, 2 * self.capacity)
        new_data: list[T | None] = [None] * new_capacity
        for i in range(self._size):
            new_data[i] = self._data[i]
        self._data = new_data

    def append(self, value: T) -> None:
        """Append in amortized O(1) time; O(n) time/extra space on
        growth."""
        self._grow_if_full()
        self._data[self._size] = value
        self._size += 1

    def pop(self) -> T:
        """Remove and return the last value in O(1), retaining
        capacity."""
        return self.remove(self._size - 1)

    def insert(self, index: int, value: T) -> None:
        """
        Insert before index (0 <= index <= size), shifting right.

        O(n) worst-case time; O(n) extra space only when growing.
        """
        if not 0 <= index <= self._size:
            raise IndexError("insertion index out of range")
        self._grow_if_full()
        for i in range(self._size, index, -1):
            self._data[i] = self._data[i - 1]
        self._data[index] = value
        self._size += 1

    def remove(self, index: int) -> T:
        """Remove and return a value, shifting left in O(n) worst-case
        time."""
        self._check_index(index)
        value = cast(T, self._data[index])
        for i in range(index, self._size - 1):
            self._data[i] = self._data[i + 1]
        self._size -= 1
        self._data[self._size] = None
        return value


if __name__ == "__main__":
    # DynamicArray[int] specializes T to int for type checkers; it does not
    # validate values at runtime. Five slots are reserved, but none are live.
    dynamic_array = DynamicArray[int](capacity=5)

    # len() calls __len__: logical size, NOT backing-storage capacity.
    print(f"Initial size: {len(dynamic_array)}")  # 0
    # @property exposes capacity as an attribute, without parentheses.
    print(f"Initial capacity: {dynamic_array.capacity}")  # 5
    assert len(dynamic_array) == 0 and dynamic_array.capacity == 5

    # append adds after the last live value, using reserved space first.
    for value in (10, 20, 30, 40, 50):
        dynamic_array.append(value)
    print("After append:", [dynamic_array.get(i) for i in range(len(dynamic_array))])
    assert len(dynamic_array) == 5 and dynamic_array.capacity == 5

    # get reads a live index; set replaces it without changing size.
    print(f"Value at index 1: {dynamic_array.get(1)}")  # 20
    dynamic_array.set(1, 25)
    assert dynamic_array.get(1) == 25
    assert len(dynamic_array) == 5

    # Inserting into a full array doubles capacity from 5 to 10.
    # Existing values shift RIGHT, starting at the end to avoid overwriting.
    dynamic_array.insert(1, 15)
    values = [dynamic_array.get(i) for i in range(len(dynamic_array))]
    print("After insert:", values)  # [10, 15, 25, 30, 40, 50]
    print(f"Capacity after growth: {dynamic_array.capacity}")  # 10
    assert values == [10, 15, 25, 30, 40, 50]
    assert dynamic_array.capacity == 10

    # remove takes an INDEX, not a value; later values shift LEFT.
    removed = dynamic_array.remove(2)
    print(f"Removed index 2: {removed}")  # 25
    assert removed == 25
    assert [dynamic_array.get(i) for i in range(len(dynamic_array))] == [
        10,
        15,
        30,
        40,
        50,
    ]

    # pop removes the last live value: no shifting is needed.
    popped = dynamic_array.pop()
    print(f"Popped last value: {popped}")  # 50
    assert popped == 50
    assert [dynamic_array.get(i) for i in range(len(dynamic_array))] == [10, 15, 30, 40]

    # Removing values clears their slots but does not shrink the allocation.
    while len(dynamic_array) > 0:
        dynamic_array.pop()
    print(f"Empty again: size={len(dynamic_array)}, capacity={dynamic_array.capacity}")
    assert len(dynamic_array) == 0 and dynamic_array.capacity == 10

    # Reserved slots are not live indices; reading index 0 now must fail.
    try:
        dynamic_array.get(0)
    except IndexError as error:
        print(f"Expected empty-array error: {error}")
    else:
        raise AssertionError("Reading an empty array should raise IndexError")
