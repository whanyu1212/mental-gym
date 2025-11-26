import sys


def name_query(name_dict: dict, name_list: list) -> list:
    """Based on the input, return a list of strings with the following rules:
    - If the name is in the dictionary and the value is not None, append
    "Neibb en {name} {value} er heima"
    - If the name is in the dictionary and the value is None, append "Jebb"
    - If the name is not in the dictionary, append "Neibb"

    Args:
        name_dict (dict): a dictionary with first name as keys and second name as values
        name_list (list): a list of names to query for

    Returns:
        list: output msg to print
    """
    output = []
    for n in name_list:
        if n in name_dict and name_dict[n]:
            output.append(f"Neibb en {n} {name_dict[n]} er heima")
        elif n in name_dict and not name_dict[n]:
            output.append("Jebb")
        else:
            output.append("Neibb")

    return output


if __name__ == "__main__":

    # with open("input.txt", "r") as file:
    #     lines = file.readlines()
    #     stripped_lines = [line.strip() for line in lines]
    #     first_list_len = int(stripped_lines[0])
    #     first_list = stripped_lines[1 : first_list_len + 1]
    #     second_list_len = int(stripped_lines[first_list_len + 1])
    #     second_list = stripped_lines[first_list_len + 2 :]

    #     first_dict = {
    #         name.split()[0]: name.split()[1] if len(name.split()) > 1 else None
    #         for name in first_list
    #     }

    # output = name_query(first_dict, second_list)

    # with open("output.txt", "w") as file:
    #     for line in output:
    #         file.write(line + "\n")

    input_data = sys.stdin.read().strip().split("\n")
    stripped_lines = [line.strip() for line in input_data]
    first_list_len = int(stripped_lines[0])
    first_list = stripped_lines[1 : first_list_len + 1]
    second_list_len = int(stripped_lines[first_list_len + 1])
    second_list = stripped_lines[first_list_len + 2 :]

    first_dict = {
        name.split()[0]: name.split()[1] if len(name.split()) > 1 else None
        for name in first_list
    }

    output = name_query(first_dict, second_list)

    # More efficient way to print to stdout
    sys.stdout.write("\n".join(output) + "\n")
