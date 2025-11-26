class TreeNode:
    """Binary tree node. Very similar to a linked list node, but with two pointers."""

    def __init__(self, val: int):
        self.val: int = val  # Node value
        self.left: TreeNode | None = None  # Reference to left child node
        self.right: TreeNode | None = None  # Reference to right child node


class BinarySearchTree:
    def __init__(self):
        self.root: TreeNode | None = None

    def search(self, num: int) -> TreeNode | None:
        """Search node"""
        cur = self._root
        # Loop find, break after passing leaf nodes
        while cur is not None:
            # Target node is in cur's right subtree
            if cur.val < num:
                cur = cur.right
            # Target node is in cur's left subtree
            elif cur.val > num:
                cur = cur.left
            # Found target node, break loop
            else:
                break
        return cur

    def insert(self, num: int):
        """Insert node"""
        # If tree is empty, initialize root node
        if self._root is None:
            self._root = TreeNode(num)
            return
        # Loop find, break after passing leaf nodes
        cur, pre = self._root, None
        while cur is not None:
            # Found duplicate node, thus return
            # No need to insert
            if cur.val == num:
                return
            # Last checked node becomes pre node
            pre = cur
            # Insertion position is in cur's right subtree
            if cur.val < num:
                cur = cur.right
            # Insertion position is in cur's left subtree
            else:
                cur = cur.left
        # Insert node
        node = TreeNode(num)
        if pre.val < num:
            pre.right = node
        else:
            pre.left = node

    def remove(self, num: int):
        """Remove node"""
        # If tree is empty, return
        if self._root is None:
            return
        # Loop find, break after passing leaf nodes
        cur, pre = self._root, None
        while cur is not None:
            # Found node to be removed, break loop
            if cur.val == num:
                break
            pre = cur
            # Node to be removed is in cur's right subtree
            if cur.val < num:
                cur = cur.right
            # Node to be removed is in cur's left subtree
            else:
                cur = cur.left
        # If no node to be removed, return
        if cur is None:
            return

        # Number of child nodes = 0 or 1
        if cur.left is None or cur.right is None:
            # When the number of child nodes = 0/1, child = null/that child node
            child = cur.left or cur.right
            # Remove node cur
            if cur != self._root:
                if pre.left == cur:
                    pre.left = child
                else:
                    pre.right = child
            else:
                # If the removed node is the root, reassign the root
                self._root = child
        # Number of child nodes = 2
        else:
            # Get the next node in in-order traversal of cur
            tmp: TreeNode = cur.right
            while tmp.left is not None:
                tmp = tmp.left
            # Recursively remove node tmp
            self.remove(tmp.val)
            # Replace cur with tmp
            cur.val = tmp.val

    def find_successor(self, root: TreeNode, num: int) -> TreeNode:
        # Find the node
        cur = root
        while cur and cur.val != num:
            if num < cur.val:
                cur = cur.left
            else:
                cur = cur.right

        if not cur:
            return None  # Node not found

        # Case 1: Node has right subtree
        if cur.right:
            cur = cur.right
            while cur.left:
                cur = cur.left
            return cur

        # Case 2: No right subtree, find the nearest ancestor for which given node would be in left subtree
        successor = None
        ancestor = root
        while ancestor != cur:
            if cur.val < ancestor.val:
                successor = ancestor
                ancestor = ancestor.left
            else:
                ancestor = ancestor.right
        return successor

    def find_predecessor(self, root: TreeNode, num: int) -> TreeNode:
        # Find the node
        cur = root
        while cur and cur.val != num:
            if num < cur.val:
                cur = cur.left
            else:
                cur = cur.right

        if not cur:
            return None  # Node not found

        # Case 1: Node has left subtree
        if cur.left:
            cur = cur.left
            while cur.right:
                cur = cur.right
            return cur

        # Case 2: No left subtree, find the nearest ancestor for which given node would be in right subtree
        predecessor = None
        ancestor = root
        while ancestor != cur:
            if cur.val > ancestor.val:
                predecessor = ancestor
                ancestor = ancestor.right
            else:
                ancestor = ancestor.left
        return predecessor

    def count_nodes(self, node: TreeNode) -> int:
        if node is None:
            return 0
        return 1 + self.count_nodes(node.left) + self.count_nodes(node.right)

    def rank(self, v: int) -> int:
        def rank_helper(node: TreeNode, v: int) -> int:
            if node is None:
                return 0
            if v < node.val:
                return rank_helper(node.left, v)
            elif v > node.val:
                return 1 + self.count_nodes(node.left) + rank_helper(node.right, v)
            else:
                return self.count_nodes(node.left) + 1

        rank_value = rank_helper(self._root, v)
        return rank_value if rank_value > 0 else -1

    def select(self, k: int) -> int:
        def select_helper(node: TreeNode, k: int) -> TreeNode:
            if node is None:
                return None
            left_size = self.count_nodes(node.left)
            if k <= left_size:
                return select_helper(node.left, k)
            elif k == left_size + 1:
                return node
            else:
                return select_helper(node.right, k - left_size - 1)

        result_node = select_helper(self._root, k)
        return result_node.val if result_node else -1
