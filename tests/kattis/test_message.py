import os
import sys
import pytest


# Add the src/kattis directory to the PYTHONPATH
path_to_add = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../src/kattis/python")
)
sys.path.insert(0, path_to_add)

from message import process_multiline_input, output_message


@pytest.mark.parametrize(
    "message, expected_output",
    [
        (
            ["3 3\n", "sn.\n", ".a.\n", ".ke\n"],
            [
                ["s", "n", "."],
                [".", "a", "."],
                [".", "k", "e"],
            ],
        ),
        (
            ["5 6\n", "pa....\n", "......\n", ".u.l..\n", ".....a\n", "......\n"],
            [
                ["p", "a", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "."],
                [".", "u", ".", "l", ".", "."],
                [".", ".", ".", ".", ".", "a"],
                [".", ".", ".", ".", ".", "."],
            ],
        ),
        # Add more input-output pairs as needed
    ],
)
def test_process_multiline_input(message, expected_output):
    assert process_multiline_input(message) == expected_output


def test_output_message():
    assert (
        output_message(
            [
                ["s", "n", "."],
                [".", "a", "."],
                [".", "k", "e"],
            ]
        )
        == "snake"
    )
    assert (
        output_message(
            [
                ["p", "a", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "."],
                [".", "u", ".", "l", ".", "."],
                [".", ".", ".", ".", ".", "a"],
                [".", ".", ".", ".", ".", "."],
            ]
        )
        == "paula"
    )
