import os
import sys
import pytest
from io import StringIO

# Add the src/kattis directory to the PYTHONPATH
path_to_add = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../src/kattis")
)
sys.path.insert(0, path_to_add)

from peningar import parse_inputs, calculate_value_accumulated


@pytest.mark.parametrize(
    "input_data, expected_num_cells, expected_step_size, expected_cells",
    [
        (["4 1\n", "1 1 1 1\n"], 4, 1, [1, 1, 1, 1]),
        (["3 2\n", "2 2 2\n"], 3, 2, [2, 2, 2]),
        (["5 3\n", "3 3 3 3 3\n"], 5, 3, [3, 3, 3, 3, 3]),
    ],
)
def test_parse_inputs(
    input_data, expected_num_cells, expected_step_size, expected_cells
):
    num_cells, step_size, cells = parse_inputs(input_data)
    assert num_cells == expected_num_cells
    assert step_size == expected_step_size
    assert cells == expected_cells


@pytest.mark.parametrize(
    "input_data, expected_output",
    [
        (["4 1\n", "1 1 1 1\n"], "4"),
        (["3 2\n", "2 2 2\n"], "6"),
        (["5 3\n", "3 3 3 3 3\n"], "15"),
    ],
)
def test_calculate_value_accumulated(monkeypatch, input_data, expected_output):
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)
    calculate_value_accumulated(input_data)
    assert captured_output.getvalue().strip() == expected_output
