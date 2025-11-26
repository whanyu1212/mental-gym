from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def mergeTwoLists(
        self, list1: Optional[ListNode], list2: Optional[ListNode]
    ) -> Optional[ListNode]:
        """Merging 2 lists using an iterative way. Keeping 2 variables
        to move the pointer and a dummy node to keep track of the head.

        Args:
            list1 (Optional[ListNode]): a linked list
            list2 (Optional[ListNode]): another linked list

        Returns:
            Optional[ListNode]: a merged linked list
        """

        dummy = ListNode()
        current = dummy

        while list1 and list2:
            if list1.val < list2.val:
                current.next = list1
                list1 = list1.next
            else:
                current.next = list2
                list2 = list2.next
            current = current.next

        return dummy.next  # 1 based indexing


# Example usage

if __name__ == "__main__":
    list1 = ListNode(1, ListNode(2, ListNode(4)))
    list2 = ListNode(1, ListNode(3, ListNode(4)))

    solution = Solution()
    merged_list = solution.mergeTwoLists(list1, list2)
    while merged_list:
        print(merged_list.val)
        merged_list = merged_list.next
