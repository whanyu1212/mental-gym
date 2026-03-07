# Trees

## Traversals

```python
# Inorder (Left → Root → Right) — gives sorted order for BST
def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

# Preorder (Root → Left → Right) — useful for cloning
def preorder(root):
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

# Level Order (BFS)
from collections import deque
def level_order(root):
    if not root:
        return []
    queue, result = deque([root]), []
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result
```

## Common Patterns

### Max Depth / Height
```python
def max_depth(root) -> int:
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

### Lowest Common Ancestor
```python
def lca(root, p, q):
    if not root or root is p or root is q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    return root if left and right else left or right
```

### BST Insert / Search
```python
def insert(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root
```

## Key Properties
| Property | BST | Balanced BST |
|---|---|---|
| Search | O(h) | O(log n) |
| Insert | O(h) | O(log n) |
| Inorder | Sorted sequence | Sorted sequence |

## Related Problems
- LeetCode 104 — Maximum Depth of Binary Tree
- LeetCode 102 — Binary Tree Level Order Traversal
- LeetCode 236 — Lowest Common Ancestor
- LeetCode 235 — LCA of BST
