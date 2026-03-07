def solve_backtracking(state, res):
    """
    Generic backtracking template.
    1. Check if state is valid solution (base case) -> add to res, return
    2. Iterate through valid candidates
    3. Place candidate (update state)
    4. Recurse
    5. Backtrack (remove candidate)
    """
    if is_solution(state):
        res.append(state[:])
        return

    for candidate in get_candidates(state):
        state.append(candidate)
        solve_backtracking(state, res)
        state.pop()

def is_solution(state):
    return False

def get_candidates(state):
    return []
