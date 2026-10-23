import pytest
from kattis_samples import run_solution, sample_cases, tokens
from talnalas import bfs, generate_list_of_neighbors


def assert_valid_path(path, start, passcode, lucky):
    assert path[0] == start and path[-1] == passcode
    # Every state reached after a step must be lucky. The start and passcode are
    # lucky by the statement's guarantee, though a sample need not list them.
    assert all(state in lucky for state in path[1:-1])
    for before, after in zip(path, path[1:]):
        changed = [(a, b) for a, b in zip(before, after) if a != b]
        assert len(changed) == 1, (before, after)
        a, b = changed[0]
        assert (int(a) - int(b)) % 10 in (1, 9), (before, after)


@pytest.mark.parametrize("stdin, expected", sample_cases("talnalas"))
def test_official_samples(stdin, expected):
    got = tokens(run_solution("talnalas", stdin))
    want = tokens(expected)
    if want == ["Neibb"]:
        assert got == want
        return
    # Any shortest path is accepted, so check the length and validity.
    _, n_lucky, start, passcode, *lucky = stdin.split()
    assert len(lucky) == int(n_lucky)
    assert got[0] == want[0]
    path = got[1:]
    assert len(path) == int(want[0]) + 1
    assert_valid_path(path, start, passcode, set(lucky) | {passcode})


def test_neighbors_wrap_around():
    assert sorted(generate_list_of_neighbors("09", 2)) == ["00", "08", "19", "99"]


@pytest.mark.parametrize(
    "start, passcode, lucky, distance",
    [
        ("0", "9", {"0"}, 1),  # one step backwards wraps 0 -> 9
        ("00", "11", {"00", "01"}, 2),
        ("00", "11", {"00"}, -1),  # both intermediate states are unlucky
        ("000", "555", {"000"}, -1),
    ],
)
def test_bfs(start, passcode, lucky, distance):
    allowed = lucky | {passcode}
    got_distance, path = bfs(start, passcode, allowed)
    assert got_distance == distance
    if distance == -1:
        assert path == []
    else:
        assert len(path) == distance + 1
        assert_valid_path(path, start, passcode, allowed)
