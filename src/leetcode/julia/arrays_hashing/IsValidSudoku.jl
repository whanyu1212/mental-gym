using DataStructures

function isValidSudoku(board::Matrix{Char})::Bool
    # Here, () -> Set{Char}() is an anonymous function that acts as the factory,
    # creating a new empty Set{Char} when a key is accessed for the first time
    rowset = DefaultDict{Int,Set{Char}}(() -> Set{Char}())
    colset = DefaultDict{Int,Set{Char}}(() -> Set{Char}())
    # Corrected squareset to use a Tuple{Int, Int} as key
    squareset = DefaultDict{Tuple{Int,Int},Set{Char}}(() -> Set{Char}())

    rows = size(board, 1)
    cols = size(board, 2)

    # Assuming board is 9x9 for Sudoku
    # If not, these loops are general for an M x N board
    for i in 1:rows
        for j in 1:cols
            current_char = board[i, j]

            if current_char == '.'
                continue
            end

            # Calculate square index (0-indexed for simplicity in mapping from 1-indexed i,j)
            # Or use 1-indexed: square_idx = ( (i-1)÷3 + 1, (j-1)÷3 + 1 )
            square_key = ((i - 1) ÷ 3, (j - 1) ÷ 3)

            if current_char in rowset[i] ||
               current_char in colset[j] ||
               current_char in squareset[square_key]
                return false
            end

            push!(rowset[i], current_char)
            push!(colset[j], current_char)
            push!(squareset[square_key], current_char)
        end
    end
    return true # If all checks pass
end



using Test

@testset "IsValidSudoku Tests" begin
    @testset "Valid Boards" begin
        valid_board_1 = [
            '5' '3' '.' '.' '7' '.' '.' '.' '.';
            '6' '.' '.' '1' '9' '5' '.' '.' '.';
            '.' '9' '8' '.' '.' '.' '.' '6' '.';
            '8' '.' '.' '.' '6' '.' '.' '.' '3';
            '4' '.' '.' '8' '.' '3' '.' '.' '1';
            '7' '.' '.' '.' '2' '.' '.' '.' '6';
            '.' '6' '.' '.' '.' '.' '2' '8' '.';
            '.' '.' '.' '4' '1' '9' '.' '.' '5';
            '.' '.' '.' '.' '8' '.' '.' '7' '9'
        ]
        @test isValidSudoku(valid_board_1) == true

        empty_board = [
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.';
            '.' '.' '.' '.' '.' '.' '.' '.' '.'
        ]
        @test isValidSudoku(empty_board) == true

        full_valid_board = [
            '5' '3' '4' '6' '7' '8' '9' '1' '2';
            '6' '7' '2' '1' '9' '5' '3' '4' '8';
            '1' '9' '8' '3' '4' '2' '5' '6' '7';
            '8' '5' '9' '7' '6' '1' '4' '2' '3';
            '4' '2' '6' '8' '5' '3' '7' '9' '1';
            '7' '1' '3' '9' '2' '4' '8' '5' '6';
            '9' '6' '1' '5' '3' '7' '2' '8' '4';
            '2' '8' '7' '4' '1' '9' '6' '3' '5';
            '3' '4' '5' '2' '8' '6' '1' '7' '9'
        ]
        @test isValidSudoku(full_valid_board) == true
    end

    @testset "Invalid Boards" begin
        invalid_board_row = [ # Duplicate '5' in first row
            '5' '3' '5' '.' '7' '.' '.' '.' '.';
            '6' '.' '.' '1' '9' '5' '.' '.' '.';
            '.' '9' '8' '.' '.' '.' '.' '6' '.';
            '8' '.' '.' '.' '6' '.' '.' '.' '3';
            '4' '.' '.' '8' '.' '3' '.' '.' '1';
            '7' '.' '.' '.' '2' '.' '.' '.' '6';
            '.' '6' '.' '.' '.' '.' '2' '8' '.';
            '.' '.' '.' '4' '1' '9' '.' '.' '5';
            '.' '.' '.' '.' '8' '.' '.' '7' '9'
        ]
        @test isValidSudoku(invalid_board_row) == false

        invalid_board_col = [ # Duplicate '3' in second column
            '5' '3' '.' '.' '7' '.' '.' '.' '.';
            '6' '.' '.' '1' '9' '5' '.' '.' '.';
            '.' '9' '8' '.' '.' '.' '.' '6' '.';
            '8' '.' '.' '.' '6' '.' '.' '.' '3';
            '4' '3' '.' '8' '.' '3' '.' '.' '1';
            '7' '.' '.' '.' '2' '.' '.' '.' '6';
            '.' '6' '.' '.' '.' '.' '2' '8' '.';
            '.' '.' '.' '4' '1' '9' '.' '.' '5';
            '.' '.' '.' '.' '8' '.' '.' '7' '9'
        ]
        @test isValidSudoku(invalid_board_col) == false

        invalid_board_square = [ # Duplicate '3' in top-left 3x3 square
            '5' '3' '.' '.' '7' '.' '.' '.' '.';
            '6' '3' '.' '1' '9' '5' '.' '.' '.';
            '.' '9' '8' '.' '.' '.' '.' '6' '.';
            '8' '.' '.' '.' '6' '.' '.' '.' '3';
            '4' '.' '.' '8' '.' '3' '.' '.' '1';
            '7' '.' '.' '.' '2' '.' '.' '.' '6';
            '.' '6' '.' '.' '.' '.' '2' '8' '.';
            '.' '.' '.' '4' '1' '9' '.' '.' '5';
            '.' '.' '.' '.' '8' '.' '.' '7' '9'
        ]
        @test isValidSudoku(invalid_board_square) == false

        invalid_board_multiple_errors = [ # Duplicate '1' in row, col and square
            '1' '1' '.' '.' '7' '.' '.' '.' '.';
            '1' '.' '.' '1' '9' '5' '.' '.' '.';
            '.' '9' '8' '.' '.' '.' '.' '6' '.';
            '8' '.' '.' '.' '6' '.' '.' '.' '3';
            '4' '.' '.' '8' '.' '3' '.' '.' '1';
            '7' '.' '.' '.' '2' '.' '.' '.' '6';
            '.' '6' '.' '.' '.' '.' '2' '8' '.';
            '.' '.' '.' '4' '1' '9' '.' '.' '5';
            '.' '.' '.' '.' '8' '.' '.' '7' '9'
        ]
        @test isValidSudoku(invalid_board_multiple_errors) == false
    end
end