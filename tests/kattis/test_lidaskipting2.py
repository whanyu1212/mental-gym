import pytest
from lidaskipting2 import get_min_max_teams


@pytest.mark.parametrize(
    "participants, expected_output",
    [
        (6, "6\n2"),
        (61, "61\n21"),
        (100, "100\n34"),
        (
            10000000000000000000000000000000000000000,
            "10000000000000000000000000000000000000000\n3333333333333333333333333333333333333334",  # noqa: E501
        ),
    ],
)
def test_get_min_max_teams(participants, expected_output):
    assert get_min_max_teams(participants) == expected_output
