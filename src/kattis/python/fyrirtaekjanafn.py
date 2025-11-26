def filter_consonants():
    input_str = input()
    vowel_char = "aeiouyAEIOUY"
    filtered_output = "".join([i for i in input_str if i in vowel_char and i.isalpha()])
    print(filtered_output)


# input_str = input()
# print(filter_consonants(input_str))
