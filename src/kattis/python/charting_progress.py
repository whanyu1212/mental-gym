import sys
import pytest
from io import StringIO


def charting_progress():
    content = sys.stdin.readlines()
    index_count = 0
    output = []
    for line in content:
        if line == "\n":
            output.append(line.strip())
            index_count = 0  # reset index count
        else:
            row_length = len(line.strip())
            star_count = line.count("*")
            new_line = (
                "." * (row_length - star_count - index_count)
                + ("*" * star_count)
                + ("." * index_count)
            )
            index_count += star_count
            output.append(new_line)

    print("\n".join(output))


@pytest.mark.parametrize(
    "test_input, expected",
    [
        (
            [
                "...........*........\n",
                "....*.....*.........\n",
                ".........*..*...*...\n",
                "*..*..*......***....\n",
                "..*.....*...........\n",
                ".*..................\n",
                ".......*.........*.*\n",
                "....................\n",
                ".....*............*.\n",
            ],
            "...................*\n.................**.\n..............***...\n........******......\n......**............\n.....*..............\n..***...............\n....................\n**..................\n",
        )
    ],
)
def test_charting_progress(monkeypatch, test_input, expected):
    monkeypatch.setattr("sys.stdin", StringIO("".join(test_input)))

    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)

    charting_progress()

    assert captured_output.getvalue().strip() == expected.strip()
