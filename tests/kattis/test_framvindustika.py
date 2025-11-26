import os
import sys
import pytest
from io import StringIO

# Add the src/kattis directory to the PYTHONPATH
path_to_add = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../src/kattis/python")
)
sys.path.insert(0, path_to_add)

from framvindustika import framvindustika


@pytest.mark.parametrize(
    "input_data, expected_output",
    [
        ("50 10\n", "[#####-----] |  50%"),
        ("75 20\n", "[###############-----] |  75%"),
        ("100 5\n", "[#####] | 100%"),
        ("0 8\n", "[--------] |   0%"),
    ],
)
def test_framvindustika(monkeypatch, input_data, expected_output):
    # Simulate input
    monkeypatch.setattr("sys.stdin", StringIO(input_data))

    # Capture the output
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)

    # Call the function
    framvindustika()

    # Assert the output
    assert captured_output.getvalue().strip() == expected_output
