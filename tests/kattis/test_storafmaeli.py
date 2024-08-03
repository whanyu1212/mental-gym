import io
import os
import sys
from io import StringIO

path_to_add = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../src/kattis")
)
sys.path.insert(0, path_to_add)

from storafmaeli import process_anniversary_year


def test_process_anniversary_year(monkeypatch):
    """
    A StringIO object is a part of Python's io module and provides an in-memory
    file-like object that reads and writes a string buffer (text). Essentially,
    it behaves like a file, but instead of being connected to a file on disk, it operates in memory.
    """

    # Test case: input less than 10
    monkeypatch.setattr("sys.stdin", StringIO("5\n"))
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)
    process_anniversary_year()
    assert captured_output.getvalue().strip() == "Neibb"

    # Test case: input exactly divisible by 10
    monkeypatch.setattr("sys.stdin", StringIO("20\n"))
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)
    process_anniversary_year()
    assert captured_output.getvalue().strip() == "Jebb"

    # Test case: input not divisible by 10 but greater than 10
    monkeypatch.setattr("sys.stdin", StringIO("15\n"))
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)
    process_anniversary_year()
    assert captured_output.getvalue().strip() == "Neibb"

    # Test case: invalid input (non-integer)
    monkeypatch.setattr("sys.stdin", StringIO("abc\n"))
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)
    process_anniversary_year()
    assert (
        captured_output.getvalue().strip()
        == "Invalid input. Please enter a valid year."
    )
