import heapq
import sys

# https://docs.python.org/3/library/heapq.html


def parse_score(input_list):
    max_heap = []
    output = []
    lazy_addition = 0
    for i in range(0, len(input_list), 2):
        val = input_list[i + 1]
        if input_list[i] == 1:
            # Insert the new value into the max-heap (as negative)
            heapq.heappush(max_heap, -(val - lazy_addition))
            # Ensure the heap only contains up to 10 elements
            if len(max_heap) > 10:
                heapq.heappop(max_heap)  # heappop Remove the smallest element
                # negate of the smallest element is the largest element
        elif input_list[i] == 2:
            lazy_addition += val
        else:
            k_smallest_elements = heapq.nlargest(val, max_heap)
            output.append(-k_smallest_elements[-1] + lazy_addition)

    return output


if __name__ == "__main__":
    # input_data = sys.stdin.read().strip().split()
    # flattened_list = list(map(int, input_data[1:]))
    # results = parse_score(flattened_list)
    # sys.stdout.write("\n".join(map(str, results)) + "\n")

    with open("input.txt", "r") as file:
        input_data = file.read().strip().split()

    flattened_list = list(map(int, input_data[1:]))
    results = parse_score(flattened_list)

    with open("output.txt", "w") as file:
        file.write("\n".join(map(str, results)) + "\n")
