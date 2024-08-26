import sys


def sort_memes(memes: list) -> str:
    """Sort a meme list by the product of the second and third element in the list.
    If there are ties, sort by the first element in the list which is the meme name.

    Args:
        memes (list): nested list

    Returns:
        str: meme name
    """
    sorted_memes = sorted(
        memes, key=lambda x: (-x[1] * x[2], x[0])
    )  # cant do reverse=True because of the second key
    return sorted_memes[0][0]


if __name__ == "__main__":
    inputs = sys.stdin.readlines()
    clean_list = [i.strip().split() for i in inputs][1:]
    int_list = [[i[0], int(i[1]), int(i[2])] for i in clean_list]
    print(sort_memes(int_list))
