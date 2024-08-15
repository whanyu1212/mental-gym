import sys


def process_text_ubbi_dubbi(text: str, vowel_list: set, mode: str) -> str:
    """Process the string of text to convert to Ubbi Dubbi language or vice versa.

    Args:
        text (str): string of text to be processed (may or may not contain vowels)
        vowel_list (set): aeiouyAEIOUY
        mode (str): 'D' for English to Ubbi Dubbi, 'A' for Ubbi Dubbi to English

    Returns:
        str: processed text
    """
    output = []

    if mode == "D":
        for i in text:
            if i in vowel_list and i.islower():
                output.append("ub" + i)
            elif i in vowel_list and i.isupper():
                output.append("Ub" + i.lower())
            else:
                output.append(i)
    elif mode == "A":
        i = 0
        while i < len(text):
            if (
                i + 2 < len(text)
                and text[i : i + 2] in {"ub", "Ub"}
                and text[i + 2] in vowel_list
            ):
                if text[i : i + 2] == "ub":
                    output.append(text[i + 2])
                elif text[i : i + 2] == "Ub":
                    output.append(text[i + 2].upper())
                i += 3
            else:
                output.append(text[i])
                i += 1
    return "".join(output)


def process_text_list_ubbi_dubbi(
    lst: list[str],
    mode: str,
) -> None:
    """Loop through the list of text to process each string of text.

    Args:
        lst (list[str]): list of text to be processed
        mode (str): 'D' for English to Ubbi Dubbi, 'A' for Ubbi Dubbi to English
    """
    for i in lst:
        print(process_text_ubbi_dubbi(i, vowel_list, mode))


if __name__ == "__main__":
    input_message = sys.stdin.readlines()

    mode = input_message[0].strip()
    line_number = int(input_message[1].strip())
    text_list = [line.strip() for line in input_message[2:]]

    vowel_list = set("aeiouyAEIOUY")

    process_text_list_ubbi_dubbi(text_list, mode)
