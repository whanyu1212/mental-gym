# Write a program that computes the difference between non-negative integers.

# Input
# Each line of the input consists of a pair of integers. Each integer is between 
#  and 
#  (inclusive). The input is terminated by end of file.

# Output
# For each pair of integers in the input, output one line, containing the absolute value of their difference.



for line in readlines(stdin)
    a, b = parse.(Int, split(line, " "))
    println(abs(a - b))
end