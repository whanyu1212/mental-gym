"""Array invariants, boundary behavior, and seeded reference
comparisons."""

import random

import pytest
from arrays.python.common_operations import (
    extend,
    find,
    initialize_array,
    insert,
    random_access,
    remove,
    traverse,
)
from arrays.python.dynamic_array import DynamicArray


def test_common_helpers(capsys):
    assert initialize_array(3) == [None, None, None]
    assert initialize_array(0) == []
    with pytest.raises(ValueError):
        initialize_array(-1)
    assert find([4, 2, 4], 4) == 0
    assert find([], 4) == -1
    assert find([1], 4) == -1
    assert random_access([7]) == 7
    with pytest.raises(ValueError):
        random_access([])
    original = [1, 2]
    assert extend(original, 2) == [1, 2, 0, 0]
    assert original == [1, 2]
    assert extend(original, 0) == original
    with pytest.raises(ValueError):
        extend(original, -1)
    traverse([1, 2, 3])
    assert 'Sum of array elements: 6' in capsys.readouterr().out


def test_fixed_capacity_shifts_and_clears():
    buffer = [None] * 4
    size = insert(buffer, 2, 0, 0)
    size = insert(buffer, 1, 0, size)
    size = insert(buffer, 4, size, size)
    size = insert(buffer, 3, 2, size)
    assert buffer == [1, 2, 3, 4] and size == 4
    with pytest.raises(OverflowError):
        insert(buffer, 5, 2, size)
    assert buffer == [1, 2, 3, 4]
    size = remove(buffer, 1, size)
    assert buffer == [1, 3, 4, None] and size == 3
    size = remove(buffer, 2, size)
    size = remove(buffer, 0, size)
    size = remove(buffer, 0, size)
    assert buffer == [None] * 4 and size == 0


@pytest.mark.parametrize('size', [-1, 4])
def test_fixed_capacity_invalid_size(size):
    buffer = [1, None, None]
    for operation in (
        lambda: insert(buffer, 2, 0, size),
        lambda: remove(buffer, 0, size),
    ):
        with pytest.raises(ValueError):
            operation()
        assert buffer == [1, None, None]


def test_fixed_capacity_invalid_indices_and_empty_buffers():
    buffer = [1, None]
    for index in (-1, 2):
        with pytest.raises(IndexError):
            insert(buffer, 2, index, 1)
    for index in (-1, 1):
        with pytest.raises(IndexError):
            remove(buffer, index, 1)
    with pytest.raises(IndexError):
        remove(buffer, 0, 0)
    with pytest.raises(OverflowError):
        insert([], 1, 0, 0)
    assert buffer == [1, None]


def assert_matches(array, expected):
    assert len(array) == len(expected)
    assert array.capacity >= len(array)
    assert [array.get(i) for i in range(len(array))] == expected
    # Inspect storage deliberately: clearing references is part of the lesson.
    assert array._data[len(array) :] == [None] * (array.capacity - len(array))


def test_dynamic_growth_and_retained_capacity():
    array = DynamicArray()
    capacities = []
    for i in range(9):
        array.append(i)
        capacities.append(array.capacity)
        assert_matches(array, list(range(i + 1)))
    assert capacities == [1, 2, 4, 4, 8, 8, 8, 8, 16]
    for i in reversed(range(9)):
        assert array.pop() == i
    assert_matches(array, [])
    assert array.capacity == 16


def test_dynamic_insert_remove_and_none_values():
    array = DynamicArray(2)
    array.append('a')
    array.append('c')
    array.insert(1, 'b')  # Insertion into full storage must grow before shifting.
    assert array.capacity == 4
    array.insert(0, None)
    array.insert(len(array), 'd')
    assert_matches(array, [None, 'a', 'b', 'c', 'd'])
    array.set(2, 'B')
    assert array.remove(2) == 'B'
    assert array.remove(0) is None
    assert array.remove(len(array) - 1) == 'd'
    assert_matches(array, ['a', 'c'])


def test_dynamic_bounds_do_not_mutate():
    with pytest.raises(ValueError):
        DynamicArray(-1)
    array = DynamicArray()
    with pytest.raises(IndexError):
        array.pop()
    with pytest.raises(IndexError):
        array.get(0)
    array.append(7)
    for index in (-1, 1, 2):
        for operation in (
            lambda: array.get(index),
            lambda: array.set(index, 9),
            lambda: array.remove(index),
        ):
            with pytest.raises(IndexError):
                operation()
    for index in (-1, 2):
        with pytest.raises(IndexError):
            array.insert(index, 8)
    assert_matches(array, [7])
    assert array.capacity == 1


@pytest.mark.parametrize('capacity', [0, 1, 3, 16])
def test_dynamic_array_matches_list(capacity):
    rng = random.Random(42)
    array = DynamicArray(capacity)
    expected = []
    for _ in range(1000):
        operation = rng.choice(['append', 'insert', 'remove', 'pop', 'set', 'get'])
        value = rng.choice([None, -5, 0, 9, 'hello'])
        if operation == 'append':
            array.append(value)
            expected.append(value)
        elif operation == 'insert':
            index = rng.randrange(len(expected) + 1)
            array.insert(index, value)
            expected.insert(index, value)
        elif expected:
            index = rng.randrange(len(expected))
            if operation == 'remove':
                assert array.remove(index) == expected.pop(index)
            elif operation == 'pop':
                assert array.pop() == expected.pop()
            elif operation == 'set':
                array.set(index, value)
                expected[index] = value
            else:
                assert array.get(index) == expected[index]
        assert_matches(array, expected)
