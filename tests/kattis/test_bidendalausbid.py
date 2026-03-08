import pytest
from bidendalausbid import calculate_waited_time_in_minutes, process_multiline_input


@pytest.mark.parametrize(
    "message, expected_output",
    [
        (["02:02\n", "20:20\n"], (2, 2, 20, 20)),
        (["13:37\n", "13:42\n"], (13, 37, 13, 42)),
        (["20:20\n", "02:02\n"], (20, 20, 2, 2)),
    ],
)
def test_process_multiline_input(message, expected_output):
    assert process_multiline_input(message) == expected_output


def test_calculate_waited_time_in_minutes():
    assert calculate_waited_time_in_minutes(2, 2, 20, 20) == 1098
    assert calculate_waited_time_in_minutes(13, 37, 13, 42) == 5
    assert calculate_waited_time_in_minutes(20, 20, 2, 2) == 342
