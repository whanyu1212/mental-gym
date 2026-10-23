def check_kth_bit(n, k):
    """Checks if the k-th bit is set."""
    return (n & (1 << k)) != 0


def set_kth_bit(n, k):
    """Sets the k-th bit to 1."""
    return n | (1 << k)


def clear_kth_bit(n, k):
    """Sets the k-th bit to 0."""
    return n & ~(1 << k)


def toggle_kth_bit(n, k):
    """Toggles the k-th bit."""
    return n ^ (1 << k)
