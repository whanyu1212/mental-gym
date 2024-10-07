import sys
from collections import Counter


def apply_inflation(prices: list, events: list):
    price_counter = Counter(prices)
    # {2:2, 1:2, 5:1} inital counter
    base_sum = sum(prices)
    total_inflation = 0
    output = []

    for event in events:
        if event.startswith("I"):
            inflation_factor = int(event.split()[1])
            total_inflation += inflation_factor
            total_sum = base_sum + total_inflation * len(prices)
            output.append(total_sum)
        else:
            old_value = int(event.split()[1])
            new_value = int(event.split()[2])

            # find the base price adjusted for inflation
            base_old = old_value - total_inflation  # 3-1 = 2
            base_new = new_value - total_inflation  # 2-1 = 1

            count = price_counter[base_old]  # 2

            # they are being updated to the new value
            # del the old value and add the new value
            price_counter[base_old] -= count
            if price_counter[base_old] == 0:
                del price_counter[base_old]
            price_counter[base_new] += count  # {1:4, 5:1}
            # Update base_sum
            base_sum -= base_old * count
            base_sum += base_new * count
            # adjust for inflation at the end
            total_sum = base_sum + total_inflation * len(prices)
            output.append(total_sum)
    return output


if __name__ == "__main__":
    # with open("input.txt", "r") as file:
    #     lines = file.readlines()
    #     stripped_lines = [line.strip() for line in lines]
    #     print(stripped_lines)

    #     prices = list(map(int, stripped_lines[1].split()))
    #     events = stripped_lines[3:]

    # with open("output.txt", "w") as file:
    #     for line in apply_inflation(prices, events):
    #         file.write(f"{line}\n")

    input_data = sys.stdin.read().strip().split("\n")
    stripped_lines = [line.strip() for line in input_data]

    prices = list(map(int, stripped_lines[1].split()))
    events = stripped_lines[3:]
    output = apply_inflation(prices, events)
    sys.stdout.write("\n".join(str(line) for line in output))
