"""
Derive Big-O upper bounds for a small subset of Python.

The model assumes ordinary integers with constant-cost operations, a
built-in list of integers for a sequence input, and unshadowed Python
built-ins. Other parameters annotated as int are integer inputs of
unknown magnitude. It counts extra space beyond the input and estimates
set construction with expected hash table costs. The analyzer parses
source and never executes it.
"""

import ast
from dataclasses import dataclass, replace


class UnsupportedSyntax(ValueError):
    """Indicate that the analyzer has no cost rule for part of a
    function."""


@dataclass(frozen=True)
class Analysis:
    """Store the powers of n for time and extra space, along with the
    rules used."""

    time_exponent: int = 0
    space_exponent: int = 0
    expected_time: bool = False
    steps: tuple[str, ...] = ()


def format_bound(exponent: int) -> str:
    if exponent == 0:
        return "O(1)"
    if exponent == 1:
        return "O(n)"
    return f"O(n^{exponent})"


def _combine(*parts: Analysis) -> Analysis:
    # Adding a fixed number of polynomial bounds keeps the largest exponent.
    # Only scalar values survive between statements, so peak space is a maximum.
    return Analysis(
        time_exponent=max((part.time_exponent for part in parts), default=0),
        space_exponent=max((part.space_exponent for part in parts), default=0),
        expected_time=any(part.expected_time for part in parts),
        steps=tuple(step for part in parts for step in part.steps),
    )


_BUILTINS = {"len", "range", "set"}
_ARITHMETIC = (ast.Add, ast.Sub, ast.Mult)
_COMPARISONS = (ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE)

# A tracked name is an integer. Its value is None when its magnitude has no
# known polynomial bound in n. An absent name can have any type.
Bounds = dict[str, int | None]


def _max_bound(*bounds: int | None) -> int | None:
    if any(bound is None for bound in bounds):
        return None
    return max(bound for bound in bounds if bound is not None)


def _merge_bounds(left: Bounds, right: Bounds) -> Bounds:
    return {name: _max_bound(left[name], right[name]) for name in left.keys() & right}


def _assigned_names(statements: list[ast.stmt]) -> set[str]:
    return {
        part.id
        for statement in statements
        for part in ast.walk(statement)
        if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store)
    }


def _unsupported(node: ast.stmt | ast.expr) -> UnsupportedSyntax:
    return UnsupportedSyntax(f"line {node.lineno}: {ast.unparse(node)}")


@dataclass(frozen=True)
class _Scalar:
    magnitude: int | None = None
    cost: Analysis = Analysis()


class _Analyzer:
    def __init__(self, sequence: str | None, local_names: set[str]) -> None:
        self.sequence = sequence
        self.local_names = local_names

    def block(self, statements: list[ast.stmt], bounds: Bounds) -> Analysis:
        return _combine(*(self.statement(node, bounds) for node in statements))

    def statement(self, node: ast.stmt, bounds: Bounds) -> Analysis:
        match node:
            case ast.Pass() | ast.Return(value=None):
                return Analysis()
            case ast.Return(value=ast.expr() as value):
                return self.return_value(value, bounds)
            case ast.Assign(targets=[target], value=value):
                return self.assign(target, value, bounds)
            case ast.AugAssign(target=ast.Name(id=name), op=op, value=value) if (
                isinstance(op, _ARITHMETIC) and name in bounds
            ):
                result = self.arithmetic(
                    op, _Scalar(bounds[name]), self.scalar(value, bounds)
                )
                bounds[name] = result.magnitude
                return result.cost
            case ast.If(test=test, body=body, orelse=otherwise):
                test_cost = self.scalar(test, bounds).cost
                then_bounds, else_bounds = bounds.copy(), bounds.copy()
                then_cost = self.block(body, then_bounds)
                else_cost = self.block(otherwise, else_bounds)
                merged = _merge_bounds(then_bounds, else_bounds)
                bounds.clear()
                bounds.update(merged)
                return _combine(test_cost, then_cost, else_cost)
            case ast.For(orelse=[]):
                return self.loop(node, bounds)
            case _:
                raise _unsupported(node)

    def scalar(self, node: ast.expr, bounds: Bounds) -> _Scalar:
        match node:
            case ast.Constant(value=int()):
                return _Scalar(0)
            case ast.Name(id=name) if name in bounds:
                return _Scalar(bounds[name])
            case ast.Subscript(value=ast.Name(id=name), slice=index) if (
                name == self.sequence and not isinstance(index, ast.Slice)
            ):
                return _Scalar(cost=self.scalar(index, bounds).cost)
            case ast.UnaryOp(op=(ast.UAdd() | ast.USub()), operand=operand):
                return self.scalar(operand, bounds)
            case ast.UnaryOp(op=ast.Not(), operand=operand):
                return _Scalar(0, self.scalar(operand, bounds).cost)
            case ast.BinOp(left=left, op=op, right=right) if isinstance(op, _ARITHMETIC):
                return self.arithmetic(
                    op, self.scalar(left, bounds), self.scalar(right, bounds)
                )
            case ast.Compare(left=left, ops=operators, comparators=right) if all(
                isinstance(op, _COMPARISONS) for op in operators
            ):
                return _Scalar(
                    0,
                    _combine(
                        *(self.scalar(part, bounds).cost for part in (left, *right))
                    ),
                )
            case ast.BoolOp(values=values):
                return self.choose(values, bounds)
            case ast.IfExp(test=test, body=body, orelse=otherwise):
                result = self.choose([body, otherwise], bounds)
                return _Scalar(
                    result.magnitude,
                    _combine(self.scalar(test, bounds).cost, result.cost),
                )
            case ast.Call(
                func=ast.Name(id=("max" | "min") as name),
                args=[first, second, *rest],
                keywords=[],
            ) if name not in self.local_names:
                return self.choose([first, second, *rest], bounds)
            case ast.Call(func=ast.Name(id="len"), args=[value], keywords=[]):
                return self.length(value)
            case _:
                raise _unsupported(node)

    def choose(self, values: list[ast.expr], bounds: Bounds) -> _Scalar:
        choices = [self.scalar(value, bounds) for value in values]
        return _Scalar(
            _max_bound(*(choice.magnitude for choice in choices)),
            _combine(*(choice.cost for choice in choices)),
        )

    def arithmetic(self, op: ast.operator, left: _Scalar, right: _Scalar) -> _Scalar:
        magnitude = _max_bound(left.magnitude, right.magnitude)
        if (
            isinstance(op, ast.Mult)
            and left.magnitude is not None
            and right.magnitude is not None
        ):
            magnitude = left.magnitude + right.magnitude
        return _Scalar(magnitude, _combine(left.cost, right.cost))

    def assign(self, target: ast.expr, value: ast.expr, bounds: Bounds) -> Analysis:
        match target, value:
            case ast.Name(id=name), _ if name not in _BUILTINS and name != self.sequence:
                result = self.scalar(value, bounds)
                bounds[name] = result.magnitude
                return result.cost
            case ast.Tuple(elts=targets), ast.Tuple(elts=values) if len(targets) == len(
                values
            ):
                names = self.target_names(targets)
                results = [self.scalar(part, bounds) for part in values]
                bounds.update(
                    (name, result.magnitude) for name, result in zip(names, results)
                )
                return _combine(*(result.cost for result in results))
            case ast.Subscript(value=ast.Name(id=name), slice=index), _ if (
                name == self.sequence and not isinstance(index, ast.Slice)
            ):
                return _combine(
                    self.scalar(value, bounds).cost, self.scalar(index, bounds).cost
                )
            case _:
                raise _unsupported(target)

    def target_names(self, targets: list[ast.expr]) -> list[str]:
        names = []
        for target in targets:
            if (
                not isinstance(target, ast.Name)
                or target.id in _BUILTINS
                or target.id == self.sequence
            ):
                raise _unsupported(target)
            names.append(target.id)
        return names

    def return_value(self, node: ast.expr, bounds: Bounds) -> Analysis:
        match node:
            case ast.Subscript(value=ast.Name(id=name), slice=ast.Slice() as span) if (
                name == self.sequence
            ):
                parts = [
                    part
                    for part in (span.lower, span.upper, span.step)
                    if part is not None
                ]
                copy = Analysis(
                    time_exponent=1,
                    space_exponent=1,
                    steps=(
                        f"line {node.lineno}: the returned slice copies up to n items.",
                    ),
                )
                return _combine(
                    copy, *(self.scalar(part, bounds).cost for part in parts)
                )
            case _:
                return self.scalar(node, bounds).cost

    def length(self, value: ast.expr) -> _Scalar:
        match value:
            case ast.Name(id=name) if name == self.sequence:
                return _Scalar(1)
            case ast.Call(
                func=ast.Name(id="set"), args=[ast.Name(id=name)], keywords=[]
            ) if name == self.sequence:
                return _Scalar(
                    1,
                    Analysis(
                        time_exponent=1,
                        space_exponent=1,
                        expected_time=True,
                        steps=(
                            f"line {value.lineno}: set({name}) makes n insertion "
                            "attempts at expected constant cost each and stores up to "
                            "n entries.",
                        ),
                    ),
                )
            case _:
                detail = f"len({ast.unparse(value)})"
                raise UnsupportedSyntax(f"line {value.lineno}: {detail}")

    def loop(self, node: ast.For, bounds: Bounds) -> Analysis:
        iterations, counters, setup = self.loop_bounds(node.iter, bounds)
        targets: list[ast.expr]
        if len(counters) == 1 and isinstance(node.target, ast.Name):
            targets = [node.target]
        elif (
            isinstance(node.target, ast.Tuple)
            and len(node.target.elts) == len(counters) == 2
        ):
            targets = node.target.elts
        else:
            raise _unsupported(node.target)
        names = self.target_names(targets)

        # A loop can change a value before the next iteration begins. Keep the
        # scalar type but require the body to reestablish a magnitude bound.
        mutated = _assigned_names(node.body)
        body_bounds = {
            name: None if name in mutated else bound for name, bound in bounds.items()
        }
        body_bounds.update(zip(names, counters))
        cost = self.block(node.body, body_bounds)
        # The loop may execute zero times, so keep each prior scalar in the merge.
        bounds.update(_merge_bounds(bounds, body_bounds))

        step = (
            f"line {node.lineno}: {ast.unparse(node.iter)} has at most "
            f"{format_bound(iterations)} iterations, each taking at most "
            f"{format_bound(cost.time_exponent)} time."
        )
        return _combine(
            setup,
            replace(
                cost,
                time_exponent=cost.time_exponent + iterations,
                steps=(step, *cost.steps),
            ),
        )

    def loop_bounds(
        self, node: ast.expr, bounds: Bounds
    ) -> tuple[int, tuple[int | None, ...], Analysis]:
        match node:
            case ast.Name(id=name) if name == self.sequence:
                return 1, (None,), Analysis()
            case ast.Call(
                func=ast.Name(id="enumerate"), args=[ast.Name(id=name)], keywords=[]
            ) if name == self.sequence and "enumerate" not in self.local_names:
                return 1, (1, None), Analysis()
            case ast.Call(func=ast.Name(id="range"), args=args, keywords=[]) if (
                1 <= len(args) <= 3
            ):
                values = [self.scalar(arg, bounds) for arg in args]
                # A nonzero integer step has magnitude at least one. The
                # endpoints bound the count and the magnitude of every index.
                endpoints = values[:2]
                magnitude = _max_bound(*(value.magnitude for value in endpoints))
                if magnitude is not None:
                    setup = _combine(*(value.cost for value in values))
                    return magnitude, (magnitude,), setup
        detail = f"unknown loop bound {ast.unparse(node)}"
        raise UnsupportedSyntax(f"line {node.lineno}: {detail}")


def _function(tree: ast.Module, name: str) -> ast.FunctionDef:
    scope = tree.body
    parent, dot, member = name.rpartition(".")
    if dot:
        classes = [node for node in scope if isinstance(node, ast.ClassDef)]
        matches = [node for node in classes if node.name == parent]
        if len(matches) != 1 or matches[0].decorator_list:
            raise UnsupportedSyntax(f"expected one undecorated class named {parent}")
        scope = matches[0].body
    functions = [
        node
        for node in scope
        if isinstance(node, ast.FunctionDef) and node.name == member
    ]
    if len(functions) != 1 or functions[0].decorator_list:
        raise UnsupportedSyntax(f"expected one undecorated function named {name}")
    return functions[0]


def analyze(
    source: str, function: str, *, size: str, sequence: bool = False
) -> Analysis:
    """
    Analyze a function or a Class.method using one named input as n.

    With sequence=True, n is the length of the given list parameter.
    Otherwise n is the value of the given nonnegative integer parameter.
    Unmodeled syntax raises UnsupportedSyntax.
    """
    target = _function(ast.parse(source), function)
    args = target.args
    named = (*args.posonlyargs, *args.args, *args.kwonlyargs)
    parameters = {arg.arg for arg in named}
    if size not in parameters:
        raise UnsupportedSyntax(f"{size!r} is not a named parameter of {function}")
    variadic = {arg.arg for arg in (args.vararg, args.kwarg) if arg is not None}
    if (parameters | variadic) & _BUILTINS:
        raise UnsupportedSyntax("a parameter shadows len, range, or set")
    bounds: Bounds = {
        arg.arg: None
        for arg in named
        if arg.arg != size
        and isinstance(arg.annotation, ast.Name)
        and arg.annotation.id == "int"
    }
    if not sequence:
        bounds[size] = 1
    body = (
        target.body[1:]
        if ast.get_docstring(target, clean=False) is not None
        else target.body
    )
    local_names = parameters | variadic | _assigned_names(body)
    return _Analyzer(size if sequence else None, local_names).block(body, bounds)
