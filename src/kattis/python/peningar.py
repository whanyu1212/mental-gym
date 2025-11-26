import sys


def parse_inputs(inputs):
    num_cells = int(inputs[0].strip().split()[0])
    step_size = int(inputs[0].strip().split()[1])
    cells = [int(i) for i in inputs[1].strip().split()]
    return num_cells, step_size, cells


def calculate_value_accumulated(inputs):
    num_cells, step_size, cells = parse_inputs(inputs)

    position = 0
    total_value = 0
    visited = set()

    while position not in visited:
        total_value += cells[position]
        visited.add(position)
        position = (position + step_size) % num_cells

    print(total_value)


if __name__ == "__main__":
    inputs = sys.stdin.readlines()
    num_cells, step_size, cells = parse_inputs(inputs)
    calculate_value_accumulated(inputs)
