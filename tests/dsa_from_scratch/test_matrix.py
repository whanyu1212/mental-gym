"""Flat layout, coordinate transforms, and matrix multiplication."""

import random

import pytest
from arrays.python.matrix import Matrix


def as_rows(matrix):
    return [matrix.row(r) for r in range(matrix.rows)]


def test_layout_access_and_copying():
    source = [[1, 2, 3], [4, 5, 6]]
    matrix = Matrix.from_rows(source)
    assert (matrix.rows, matrix.cols) == (2, 3)
    assert matrix._data == [1, 2, 3, 4, 5, 6]
    assert matrix.get(1, 0) == 4
    matrix.set(0, 2, 9)
    assert matrix.row(0) == [1, 2, 9]
    assert matrix.column(2) == [9, 6]
    assert source == [[1, 2, 3], [4, 5, 6]]
    source[1][0] = 100
    row = matrix.row(1)
    column = matrix.column(0)
    row[0] = column[0] = -1
    assert matrix.get(1, 0) == 4
    assert matrix.get(0, 0) == 1
    assert as_rows(Matrix(2, 2, 1.5)) == [[1.5, 1.5], [1.5, 1.5]]


@pytest.mark.parametrize('shape', [(-1, 2), (2, -1)])
def test_negative_dimensions(shape):
    with pytest.raises(ValueError):
        Matrix(*shape)


def test_invalid_shapes_and_coordinates():
    with pytest.raises(ValueError):
        Matrix.from_rows([[1], [2, 3]])
    matrix = Matrix(2, 3)
    for r, c in [(-1, 0), (0, -1), (2, 0), (0, 3)]:
        with pytest.raises(IndexError):
            matrix.get(r, c)
        with pytest.raises(IndexError):
            matrix.set(r, c, 7)
    for r in [-1, 2]:
        with pytest.raises(IndexError):
            matrix.row(r)
    for c in [-1, 3]:
        with pytest.raises(IndexError):
            matrix.column(c)
    with pytest.raises(ValueError):
        matrix.multiply(Matrix(2, 2))
    assert matrix._data == [0] * 6


def test_rectangular_transforms_are_independent():
    matrix = Matrix.from_rows([[1, 2, 3], [4, 5, 6]])
    transposed = matrix.transpose()
    rotated = matrix.rotate_clockwise()
    assert (transposed.rows, transposed.cols) == (3, 2)
    assert (rotated.rows, rotated.cols) == (3, 2)
    assert as_rows(transposed) == [[1, 4], [2, 5], [3, 6]]
    assert as_rows(rotated) == [[4, 1], [5, 2], [6, 3]]
    assert as_rows(transposed.transpose()) == as_rows(matrix)
    restored = matrix
    for _ in range(4):
        restored = restored.rotate_clockwise()
    assert as_rows(restored) == as_rows(matrix)
    transposed.set(0, 0, 99)
    rotated.set(0, 0, 99)
    assert as_rows(matrix) == [[1, 2, 3], [4, 5, 6]]


def test_multiplication_known_values_and_floats():
    left = Matrix.from_rows([[1, 2, 3], [4, 5, 6]])
    right = Matrix.from_rows([[7, 8], [9, 10], [11, 12]])
    product = left.multiply(right)
    assert (product.rows, product.cols) == (2, 2)
    assert as_rows(product) == [[58, 64], [139, 154]]
    identity = Matrix.from_rows([[1, 0], [0, 1]])
    assert as_rows(identity.multiply(left)) == as_rows(left)
    floats = Matrix.from_rows([[0.1, 0.2]])
    assert floats.multiply(Matrix.from_rows([[3], [4]])).get(0, 0) == pytest.approx(1.1)
    product.set(0, 0, -1)
    assert left.get(0, 0) == 1 and right.get(0, 0) == 7


@pytest.mark.parametrize('shape', [(0, 0), (0, 3), (2, 0), (1, 1), (1, 4), (4, 1)])
def test_transforms_and_empty_shapes(shape):
    rows, cols = shape
    matrix = Matrix(rows, cols, 5)
    for transformed in (matrix.transpose(), matrix.rotate_clockwise()):
        assert (transformed.rows, transformed.cols) == (cols, rows)
        assert transformed._data == [5] * (rows * cols)
    if rows == 0 or cols == 0:
        with pytest.raises(IndexError):
            matrix.get(0, 0)
    if rows:
        assert matrix.row(0) == [5] * cols
    if cols:
        assert matrix.column(0) == [5] * rows


def test_empty_construction_and_zero_inner_product():
    empty = Matrix.from_rows([])
    assert (empty.rows, empty.cols) == (0, 0)
    empty_rows = Matrix.from_rows([[], []])
    assert (empty_rows.rows, empty_rows.cols) == (2, 0)
    assert as_rows(empty_rows.multiply(Matrix(0, 3))) == [[0, 0, 0], [0, 0, 0]]
    product = Matrix(0, 2).multiply(Matrix(2, 3))
    assert (product.rows, product.cols) == (0, 3)


def test_seeded_multiplication_against_nested_lists():
    rng = random.Random(42)
    for _ in range(100):
        rows, inner, cols = [rng.randint(1, 5) for _ in range(3)]
        left = [[rng.randint(-5, 5) for _ in range(inner)] for _ in range(rows)]
        right = [[rng.randint(-5, 5) for _ in range(cols)] for _ in range(inner)]
        expected = [
            [sum(a * b for a, b in zip(row, column)) for column in zip(*right)]
            for row in left
        ]
        assert (
            as_rows(Matrix.from_rows(left).multiply(Matrix.from_rows(right))) == expected
        )
