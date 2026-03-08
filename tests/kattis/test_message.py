import pytest
from message import output_message, process_multiline_input


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
