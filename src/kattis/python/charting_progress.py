import sys


def charting_progress():
    content = sys.stdin.readlines()
    index_count = 0
    output = []
    for line in content:
        if line == "\n":
            output.append(line.strip())
            index_count = 0  # reset index count
        else:
            row_length = len(line.strip())
            star_count = line.count("*")
            new_line = (
                "." * (row_length - star_count - index_count)
                + ("*" * star_count)
                + ("." * index_count)
            )
            index_count += star_count
            output.append(new_line)

    print("\n".join(output))


if __name__ == "__main__":
    charting_progress()
