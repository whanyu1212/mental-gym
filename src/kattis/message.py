import sys


def process_multiline_input(message: list):

    # a list of dimensions (e.g. ['2', '3'])
    dimension_lst = message[0].strip().split()

    matrix = [list(line.strip()) for line in message[1:]]

    if not len(matrix) == int(dimension_lst[0]) and all(
        len(row) == int(dimension_lst[1]) for row in matrix
    ):
        raise ValueError("The dimensions and the matrix do not match")

    return matrix


def output_message(matrix):
    message = "".join([char for row in matrix for char in row if char != "."])

    return message


if __name__ == "__main__":
    message = sys.stdin.readlines()
    matrix = process_multiline_input(message)
    print(output_message(matrix))
