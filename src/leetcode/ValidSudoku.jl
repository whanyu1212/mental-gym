function isValidSudoku(board::Vector{Vector{Char}})::Bool
    row_dict = Dict{Int, Set{Char}}()
    col_dict = Dict{Int, Set{Char}}()
    box_dict = Dict{Tuple{Int,Int}, Set{Char}}()

    # (1,1) | (1,2) | (1,3)    # i÷3+1, j÷3+1 coordinates
    # -------|-------|-------
    # (2,1) | (2,2) | (2,3)
    # -------|-------|-------
    # (3,1) | (3,2) | (3,3)

    for i in 1:9
        for j in 1:9
            num = board[i][j]
            num == '.' && continue

            if num in get!(row_dict, i, Set{Char}()) ||
               num in get!(col_dict, j, Set{Char}()) ||
               num in get!(box_dict, (i÷3, j÷3), Set{Char}())
                return false
            end
            
            push!(row_dict[i], num)
            push!(col_dict[j], num)
            push!(box_dict[(i÷3, j÷3)], num)
            end
        end
        return true
    end

# Example usage
if abspath(PROGRAM_FILE) == @__FILE__
    board = 
    [['1','2','.','.','3','.','.','.','.'],
    ['4','.','.','5','.','.','.','.','.'],
    ['.','9','1','.','.','.','.','.','3'],
    ['5','.','.','.','6','.','.','.','4'],
    ['.','.','.','8','.','3','.','.','5'],
    ['7','.','.','.','2','.','.','.','6'],
    ['.','.','.','.','.','.','2','.','.'],
    ['.','.','.','4','1','9','.','.','8'],
    ['.','.','.','.','8','.','.','7','9']]

    println(isValidSudoku(board))
end

