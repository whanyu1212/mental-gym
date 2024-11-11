from typing import List


def get_total_price_pool(input_lines: List[str]) -> int:
    sales_records = []
    prize_pool = 0
    for line in input_lines:
        sales_records.extend(list(map(int, line.split())))
        max_sales = max(sales_records)
        min_sales = min(sales_records)
        prize_pool += max_sales - min_sales
        sales_records.pop(sales_records.index(max_sales))
        sales_records.pop(sales_records.index(min_sales))
    return prize_pool


# Example usage
if __name__ == "__main__":
    with open("input.txt", "r") as f:
        # sys.stdin.read().strip().split("\n") if reading from terminal
        input_lines = f.read().strip().split("\n")
    print(get_total_price_pool(input_lines))
