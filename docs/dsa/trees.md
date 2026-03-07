# Trees

> Implementation: `src/dsa_from_scratch/python/tree/`

## Binary Search Tree (BST)

### Properties
- Left subtree values < node value
- Right subtree values > node value
- Inorder traversal yields sorted sequence

### Operations & Complexity

| Operation | Average | Worst (degenerate) |
|-----------|---------|-------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |

### Deletion Cases
1. **Leaf node**: Simply remove
2. **One child**: Replace node with child
3. **Two children**: Replace with inorder successor (leftmost of right subtree)

## AVL Tree (Self-Balancing BST)

### Balance Factor
`balance = height(left) - height(right)`

A node is **balanced** if `balance ∈ {-1, 0, 1}`.

### Rotations

**Right rotation** (left-heavy):
```
    y              x
   / \            / \
  x   C   →     A   y
 / \                / \
A   B              B   C
```

**Left rotation** (right-heavy): Mirror of above.

**Left-Right** (double rotation): Left rotate child, then right rotate node.
**Right-Left** (double rotation): Right rotate child, then left rotate node.

### Complexity
All operations guaranteed O(log n) — height bounded by 1.44 log₂(n).
