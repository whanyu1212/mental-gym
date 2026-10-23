import itertools
import random

import pytest
from kattis_samples import run_solution, sample_cases, tokens


def graph_input(n, directed, edges):
    lines = [f"{n} {len(edges)} {directed}"] + [f"{u} {v}" for u, v in edges]
    return "\n".join(lines) + "\n"


def reference(n, directed, edges):
    """Straight-from-the-statement classification: [tree, complete, bipartite, DAG]."""
    out = {v: set() for v in range(n)}
    for u, v in edges:
        out[u].add(v)
        if directed == 1:
            out[v].add(u)

    def reachable(start):
        seen, stack = {start}, [start]
        while stack:
            for nxt in out[stack.pop()]:
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
        return seen

    in_degree = {v: 0 for v in range(n)}
    if directed == 2:
        for _, v in edges:
            in_degree[v] += 1

    # DAG: Kahn's algorithm. An undirected graph with an edge is never a DAG.
    if directed == 1:
        dag = int(not edges)
    else:
        remaining = dict(in_degree)
        ready = [v for v in range(n) if remaining[v] == 0]
        removed = 0
        while ready:
            u = ready.pop()
            removed += 1
            for v in out[u]:
                remaining[v] -= 1
                if remaining[v] == 0:
                    ready.append(v)
        dag = int(removed == n)

    if directed == 1:
        tree = int(len(edges) == n - 1 and len(reachable(0)) == n)
    else:
        roots = [v for v in range(n) if in_degree[v] == 0]
        tree = int(
            dag
            and len(edges) == n - 1
            and len(roots) == 1
            and len(reachable(roots[0])) == n
        )

    complete = int(all(len(out[v]) == n - 1 for v in range(n)))

    if directed == 2:
        # "All edge directions must be from a vertex in U to a vertex in V", so
        # no vertex may have both an outgoing and an incoming edge.
        has_out = {u for u, _ in edges}
        has_in = {v for _, v in edges}
        bipartite = int(not has_out & has_in)
    else:
        color, bipartite = {}, 1
        for start in range(n):
            if start in color:
                continue
            color[start], stack = 0, [start]
            while stack:
                u = stack.pop()
                for v in out[u]:
                    if v not in color:
                        color[v] = 1 - color[u]
                        stack.append(v)
                    elif color[v] == color[u]:
                        bipartite = 0

    return [tree, complete, bipartite, dag]


@pytest.mark.parametrize("stdin, expected", sample_cases("graphds1"))
def test_official_samples(stdin, expected):
    assert tokens(run_solution("graphds1", stdin)) == tokens(expected)


def test_subtask_1_example():
    stdin = graph_input(5, 1, [(2, 3), (1, 0), (4, 1), (1, 2)])
    assert tokens(run_solution("graphds1", stdin)) == ["1", "0", "1", "0"]


@pytest.mark.parametrize(
    "n, directed, edges, expected",
    [
        # Isolated vertices 0 and 1 mean the graph is neither connected nor complete.
        (4, 1, [(2, 3)], [0, 0, 1, 0]),
        # Sink-only vertices (1, 3) must exist in the graph; previously KeyError.
        (4, 2, [(0, 1), (2, 3)], [0, 0, 1, 1]),
        # Odd cycle; previously RuntimeError (dict grew during iteration).
        (3, 2, [(0, 1), (0, 2), (1, 0)], [0, 0, 0, 0]),
        # Cycle 2<->3 is unreachable from vertex 0; must still rule out DAG.
        (4, 2, [(0, 1), (2, 3), (3, 2)], [0, 0, 0, 0]),
        # Single directed edge: root 0 reaches 1.
        (2, 2, [(0, 1)], [1, 0, 1, 1]),
        # Complete directed graph on 3 vertices.
        (3, 2, [(u, v) for u in range(3) for v in range(3) if u != v], [0, 1, 0, 0]),
        # Two roots: a DAG but not a tree.
        (3, 2, [(0, 2), (1, 2)], [0, 0, 1, 1]),
        # Directed path: 2-colourable ignoring direction, but vertex 1 has both
        # an incoming and an outgoing edge, so it is not directed-bipartite.
        (3, 2, [(0, 1), (1, 2)], [1, 0, 0, 1]),
        # Root listed after its child: must still be recognised as a tree.
        (2, 2, [(1, 0)], [1, 0, 1, 1]),
        # M = 0 is allowed. Previously StopIteration on an empty graph. An
        # edgeless undirected graph is still a DAG ("at least one edge" rule).
        (1, 1, [], [1, 1, 1, 1]),
        (1, 2, [], [1, 1, 1, 1]),
        (3, 1, [], [0, 0, 1, 1]),
        (3, 2, [], [0, 0, 1, 1]),
    ],
)
def test_regressions(n, directed, edges, expected):
    assert reference(n, directed, edges) == expected  # guard the oracle itself
    stdin = graph_input(n, directed, edges)
    assert tokens(run_solution("graphds1", stdin)) == [str(x) for x in expected]


def small_graphs(per_shape=40):
    """A fixed random sample of simple graphs with 2-4 vertices, both
    kinds."""
    rng = random.Random(20260926)
    cases = []
    for n in range(2, 5):
        for directed in (1, 2):
            pairs = [
                (u, v)
                for u in range(n)
                for v in range(n)
                if u != v and (directed == 2 or u < v)
            ]
            graphs = [
                list(edges)
                for m in range(1, len(pairs) + 1)
                for edges in itertools.combinations(pairs, m)
            ]
            for edges in rng.sample(graphs, min(len(graphs), per_shape)):
                cases.append((n, directed, edges))
    return cases


@pytest.mark.parametrize("n, directed, edges", small_graphs())
def test_matches_reference_on_small_graphs(n, directed, edges):
    stdin = graph_input(n, directed, edges)
    expected = [str(x) for x in reference(n, directed, edges)]
    assert tokens(run_solution("graphds1", stdin)) == expected


# N is up to 100,000, far beyond Python's default recursion limit of 1,000, so
# every search must be iterative. Each case is a long path or cycle that forces
# a deep search in one of the three places graphds1 walks the graph.
LONG = 100_000


def path_edges(n):
    return [(i, i + 1) for i in range(n - 1)]


@pytest.mark.parametrize(
    "n, directed, edges, expected",
    [
        # Undirected path: a tree (is_tree's undirected search), bipartite, not
        # a DAG because it has edges.
        pytest.param(LONG, 1, path_edges(LONG), [1, 0, 1, 0], id="undirected-path"),
        # Directed path: a rooted tree (is_tree's directed search from the root),
        # a DAG (is_DAG), and not bipartite since inner vertices have in and out.
        pytest.param(LONG, 2, path_edges(LONG), [1, 0, 0, 1], id="directed-path"),
        # Directed cycle closing back to 0: no root, so is_tree stops early, but
        # is_DAG must walk the whole cycle to find the back edge.
        pytest.param(
            LONG,
            2,
            path_edges(LONG) + [(LONG - 1, 0)],
            [0, 0, 0, 0],
            id="directed-cycle",
        ),
        # Odd undirected cycle: is_tree's search walks every vertex before it
        # meets the back edge.
        pytest.param(
            LONG - 1,
            1,
            path_edges(LONG - 1) + [(LONG - 2, 0)],
            [0, 0, 0, 0],
            id="undirected-odd-cycle",
        ),
    ],
)
def test_deep_graphs_do_not_overflow_the_stack(n, directed, edges, expected):
    assert reference(n, directed, edges) == expected  # guard the oracle itself
    stdin = graph_input(n, directed, edges)
    assert tokens(run_solution("graphds1", stdin)) == [str(x) for x in expected]
