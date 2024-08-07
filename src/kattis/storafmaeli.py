def process_anniversary_year():
    user_input = input()

    try:
        year = int(user_input)
        if year < 10:
            print("Neibb")
        elif year >= 10 and year % 10 == 0:
            print("Jebb ")
        else:
            print("Neibb")
    except ValueError:
        print("Invalid input. Please enter a valid year.")
