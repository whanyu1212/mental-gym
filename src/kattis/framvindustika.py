def framvindustika():
    p, w = [int(i) for i in input().split()]

    output = (
        "["
        + "#" * int(w * p / 100)
        + "-" * (w - int(w * p / 100))
        + "]"
        + " "
        + "|"
        + " " * (4 - len(str(p)))
        + str(p)
        + "%"
    )

    print(output)
