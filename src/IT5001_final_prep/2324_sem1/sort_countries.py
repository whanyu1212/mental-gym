# Implementing python's way of sorting string by ascii from scratch


def ascii_compare(s1: str, s2: str) -> int:
    i = 0
    while i < len(s1) and i < len(s2):
        if ord(s1[i]) != ord(s2[i]):
            return ord(s1[i]) - ord(s2[i])  # the difference in ascii value
        i += 1

    # if the ascii values are tied, compare the length of the strings
    return len(s1) - len(s2)


def ascii_sort(strings: list) -> list:
    for i in range(len(strings)):
        for j in range(len(strings) - i - 1):
            # if j-th string is greater than (j+1)-th string
            if ascii_compare(strings[j], strings[j + 1]) > 0:
                # swap their position
                strings[j], strings[j + 1] = strings[j + 1], strings[j]
    return strings
