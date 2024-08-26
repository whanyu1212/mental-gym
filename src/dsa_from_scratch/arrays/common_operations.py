import random
from colorama import Fore, Style, init
from typing import Union, List

init(autoreset=True)


def initialize_array(length: int) -> List[Union[int, float, str, None]]:
    """Initialize an array of length `length` with None values.
    0 is not used as it can be a valid value in some cases but
    if we want to include str as a potential value, we can't use 0
    to initialize it

    Args:
        length (int): Length of the array to be initialized

    Returns:
        List[Union[int, float, str]]: Array of length `length` with None values
    """
    print(
        f"{Fore.BLUE}Initializing an array of length {length} with None values{Style.RESET_ALL}"
    )
    return [None] * length


def random_access(nums: list[int]) -> int:
    """Randomly access an element in the array `nums`

    Args:
        nums (list[int]): input list of integers

    Returns:
        int: Randomly accessed element from the array
    """
    random_index = random.randint(0, len(nums) - 1)
    print(
        f"{Fore.GREEN}Randomly accessing element at index {random_index} in the array{Style.RESET_ALL}"
    )
    random_num = nums[random_index]
    print(f"{Fore.CYAN}Randomly accessed element: {random_num}{Style.RESET_ALL}")
    return random_num


def insert(nums: list[int], num: int, index: int) -> None:
    """Insert a number `num` at index `index` in the array `nums`

    Args:
        nums (list[int]): original list of integers
        num (int): number to be inserted
        index (int): index at which `num` is to be inserted
    """
    for i in range(len(nums) - 1, index, -1):
        nums[i] = nums[i - 1]

    nums[index] = num
    print(f"{Fore.GREEN}Inserting {num} at index {index} in the array{Style.RESET_ALL}")
    print(f"{Fore.CYAN}Updated array: {nums}{Style.RESET_ALL}")


def remove(nums: list[int], index: int) -> None:
    """Remove an element at index `index` in the array `nums`

    Args:
        nums (list[int]): original list of integers
        index (int): index at which element is to be removed
    """
    for i in range(index, len(nums) - 1):
        nums[i] = nums[i + 1]
    print(
        f"{Fore.GREEN}Removing element at index {index} from the array{Style.RESET_ALL}"
    )
    print(f"{Fore.CYAN}Updated array: {nums}{Style.RESET_ALL}")


def traverse(nums: list[int]) -> None:
    """Traverse the array `nums` and print the sum of all elements

    Args:
        nums (list[int]): input list of integers
    """
    count = 0
    # Traverse array by index
    print(f"{Fore.GREEN}Traversing array by index{Style.RESET_ALL}")
    for i in range(len(nums)):
        count += nums[i]
    print(f"{Fore.GREEN}Sum of array elements: {count}{Style.RESET_ALL}")


def find(nums: list[int], target: int) -> int:
    """Find the index of the element `target` in the array `nums`

    Args:
        nums (list[int]): input list of integers
        target (int): element to be found in the array

    Returns:
        int: index of the element `target` in the array `nums` or -1 if not found
    """
    for i in range(len(nums)):
        if nums[i] == target:
            print(
                f"{Fore.GREEN}Element {target} found at index {i} in the array{Style.RESET_ALL}"
            )
            return i
    print(f"{Fore.RED}Element {target} not found in the array{Style.RESET_ALL}")
    return -1


def extend(nums: list[int], enlarge: int) -> list[int]:
    """Extend the array `nums` by `enlarge` elements

    Args:
        nums (list[int]): original list of integers
        enlarge (int): number of elements to be added to the array

    Returns:
        list[int]: new array after expansion
    """
    res = [0] * (len(nums) + enlarge)
    # Copy all elements from the original array to the new array
    for i in range(len(nums)):
        res[i] = nums[i]
    # Return the new array after expansion
    print(f"{Fore.GREEN}Extending array by {enlarge} elements{Style.RESET_ALL}")
    print(f"{Fore.CYAN}Updated array: {res}{Style.RESET_ALL}")
    return res
