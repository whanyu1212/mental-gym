function MaxProfit(prices::Vector{Int})::Int
    # trackers
    left = 1
    right = 2
    max_profit = 0 

    while right <= length(prices)
        current_profit = prices[right] - prices[left]
        if prices[right] > prices[left]
            max_profit = max(max_profit, current_profit)
        else
            left = right
        end
        right += 1
    end
    return max_profit
end