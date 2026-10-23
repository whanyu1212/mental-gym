import pytest
from hittast import create_weighted_graph, dijkstra
from kattis_samples import run_solution, sample_cases, tokens


@pytest.mark.parametrize("stdin, expected", sample_cases("hittast"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("hittast", stdin)) == tokens(expected)


def test_graphs_are_undirected_with_per_traveller_costs():
    graph_a, graph_b = create_weighted_graph(2, ["1 2 5 7"])
    assert graph_a == {1: [(2, 5)], 2: [(1, 5)]}
    assert graph_b == {1: [(2, 7)], 2: [(1, 7)]}


def test_dijkstra_prefers_cheaper_longer_route():
    graph = {1: [(2, 10), (3, 1)], 2: [(1, 10), (3, 1)], 3: [(1, 1), (2, 1)]}
    assert dijkstra(graph, 1) == {1: 0, 2: 2, 3: 1}


def test_meeting_in_the_middle_can_beat_either_endpoint():
    # Lodging is cheap only at 2; both travel there.
    stdin = "3 2\n100 1 100\n1 2 3 0\n2 3 0 4\n"
    assert tokens(run_solution("hittast", stdin)) == ["8"]
