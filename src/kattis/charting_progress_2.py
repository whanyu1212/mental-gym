import sys
import pytest
from io import StringIO


def charting_progress(content: list) -> str:
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

    return "\n".join(output) + "\n"


def main():
    content = sys.stdin.readlines()
    result = charting_progress(content)
    print(result)


if __name__ == "__main__":
    main()


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
def test_charting_progress(test_input, expected):
    assert charting_progress(test_input) == expected
