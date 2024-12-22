mutable struct ListNode
    val::Int
    next::Union{ListNode,Nothing}
    
    # Constructor for a single node
    ListNode(val::Int) = new(val, nothing)
    # Constructor for node with next pointer
    ListNode(val::Int, next::Union{ListNode,Nothing}) = new(val, next)
end


function merge_two_lists(
    list1::Union{ListNode,Nothing}, list2::Union{ListNode,Nothing}
)::Union{ListNode,Nothing}
    isnothing(list1) && isnothing(list2) && return nothing
    isnothing(list1) && return list2
    isnothing(list2) && return list1

    dummy = ListNode(0)
    current = dummy
    
    while !isnothing(list1) && !isnothing(list2)
        if list1.val <= list2.val
            current.next = list1
            list1 = list1.next
        else
            current.next = list2
            list2 = list2.next
        end
        current = current.next
    end
    
    # Attach remaining nodes
    current.next = isnothing(list1) ? list2 : list1
    
    return dummy.next
end

# Helper function to print the list
function print_list(head::Union{ListNode,Nothing})
    current = head
    while !isnothing(current)
        print(current.val, " -> ")
        current = current.next
    end
    println("nothing")
end

if abspath(PROGRAM_FILE) == @__FILE__
    # Create test lists
    l1 = ListNode(1, ListNode(2, ListNode(4)))
    l2 = ListNode(1, ListNode(3, ListNode(4)))
    
    println("List 1:")
    print_list(l1)
    println("List 2:")
    print_list(l2)
    
    println("Merged list:")
    result = merge_two_lists(l1, l2)
    print_list(result)
end