import os
import sys
import pytest


# Add the src/kattis directory to the PYTHONPATH
path_to_add = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../src/kattis/python")
)
sys.path.insert(0, path_to_add)


from fleytitala import process_multiline_input, calculate_distance_geom


@pytest.mark.parametrize(
    "input_str, expected_output",
    [
        (["0\n", "10\n"], (0, 10)),
        (["1\n", "1\n"], (1, 1)),
        (["12\n", "4\n"], (12, 4)),
    ],
)
def test_process_multiline_input(input_str, expected_output):
    assert process_multiline_input(input_str) == expected_output


@pytest.mark.parametrize(
    "d, b, expected_output",
    [
        (0, 0, 0),
        (1, 1, 1.5),
        (12, 4, 23.25),
        (0, 10, 0.0),
    ],
)
def test_calculate_waited_time_in_minutes(d, b, expected_output):
    assert calculate_distance_geom(d, b) == expected_output
