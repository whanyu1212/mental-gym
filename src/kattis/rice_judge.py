import sys


def rice_judge_sort(input_list: list, preference: str) -> int:
    if preference == "antal":
        sorted_rice = sorted(
            input_list, key=lambda x: ((x[0] + x[1]), x[0]), reverse=True
        )
    else:
        sorted_rice = sorted(
            input_list, key=lambda x: ((x[0] + x[1]), x[1]), reverse=True
        )

    return input_list.index(sorted_rice[0]) + 1


# Example usage:
if __name__ == "__main__":
    inputs = sys.stdin.readlines()
    preference = inputs[1].strip()
    clean_list = [i.strip().split() for i in inputs][2:]
    int_list = [[int(i[0]), int(i[1])] for i in clean_list]
    print(rice_judge_sort(int_list, preference))
