def valid_parenthesis(input_str: str) -> None:
    """A variation to the valid parenthesis problem
    on leetcode. Here we have to check if the
    string is a valid parenthesis and if it is
    then we have to count the number of "p", "g"
    and "o" in the string.

    Args:
        input_str (str): The input string
    """
    mapping = {"P": "p", "O": "o", "G": "g"}
    stack = []

    for char in input_str:
        # if this is not any of the bad guys
        # move on and add the item picked up
        # to the top of the stack
        if char not in mapping.keys():
            stack.append(char)
            continue

        # Check from the top to the end of the stack if mapping[char] exists
        found = False
        while stack:
            top = stack.pop()
            if top == mapping[char]:
                found = True
                break

        if not found:
            print("Neibb")
            return

    if not stack:
        print("Neibb")
    else:
        print(str(stack.count("p")))
        print(str(stack.count("g")))
        print(str(stack.count("o")))


if __name__ == "__main__":
    input_str = input().strip()
    valid_parenthesis(input_str)
