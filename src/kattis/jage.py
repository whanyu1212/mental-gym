import sys


def find_cheaters(player_list: list, pairs: list) -> tuple:
    """Find the cheaters who imposed as hunters in the game.

    Args:
        player_list (list): participants in the game
        pairs (list): pairs of players who tagged each other

    Returns:
        tuple: number of cheaters and list of cheaters
    """
    starting_hunter = player_list[0]
    perceived_hunters = {starting_hunter}
    cheaters = set()
    for si, sj in pairs:
        if si in perceived_hunters:
            perceived_hunters.add(sj)
            perceived_hunters.remove(si)
        else:
            cheaters.add(si)
            perceived_hunters.add(sj)
    return len(cheaters), sorted(list(cheaters))


if __name__ == "__main__":
    # stripped_lines = []
    # with open("input.txt", "r") as file:
    #     for line in file:
    #         stripped_lines.append(line.strip())
    # player_list = stripped_lines[1].split()
    # tags = stripped_lines[2:]

    # pairs = []
    # for line in tags:
    #     names = [name for name in line.split() if name != "tar"]
    #     if len(names) == 2:
    #         pairs.append((names[0], names[1]))

    # len_cheaters, cheaters = find_cheaters(player_list, pairs)

    # with open("output.txt", "w") as file:
    #     file.write(f"{len_cheaters}\n")
    #     for cheater in cheaters:
    #         file.write(f"{cheater}\n")
    input_data = sys.stdin.read().strip().split("\n")
    stripped_lines = [line.strip() for line in input_data]
    player_list = stripped_lines[1].split()
    tags = stripped_lines[2:]

    pairs = []
    for line in tags:
        names = [name for name in line.split() if name != "tar"]
        if len(names) == 2:
            pairs.append((names[0], names[1]))

    len_cheaters, cheaters = find_cheaters(player_list, pairs)

    sys.stdout.write(f"{len_cheaters}\n")
    for cheater in cheaters:
        sys.stdout.write(f"{cheater}\n")
