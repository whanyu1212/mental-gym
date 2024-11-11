import sys
import heapq


def get_total_prize_pool(input_lines):
    min_heap = []
    max_heap = []
    prize_pool = 0

    for line in input_lines:
        daily_sales = list(map(int, line.strip().split()))
        for sale in daily_sales:
            # Insert sale into min-heap and max-heap
            heapq.heappush(min_heap, sale)
            heapq.heappush(max_heap, -sale)  # Max-heap implemented using negation

        if min_heap and max_heap:
            # Retrieve and remove the minimum sale
            min_sale = heapq.heappop(min_heap)
            # Retrieve and remove the maximum sale
            max_sale = -heapq.heappop(max_heap)
            # Update the prize pool
            prize_pool += max_sale - min_sale

    return prize_pool


if __name__ == "__main__":
    with open("input.txt", "r") as f:
        input_lines = f.read.strip().split("\n")
    # input_lines = sys.stdin.readlines()
    result = get_total_prize_pool(input_lines)
    print(result)
