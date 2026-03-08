class MyHashSet:

    def __init__(self):
        # Choose a large prime or power of 10 to minimize collisions.
        # Trade-off: Larger key_space uses more memory but reduces collisions (faster
        # access).
        self.key_space = 1000000
        # Initialize buckets: list of empty lists.
        # CRITICAL: Use [[] for _ in range(n)] NOT [[]] * n to avoid shared references.
        # Each bucket will store a LIST of keys that hash to the same index (Separate
        # Chaining).
        self.hash_table = [[] for _ in range(self.key_space)]

    def hash_function(self, key: int) -> int:
        # Simple modulo hash function maps any integer key to a valid index [0,
        # key_space-1].
        return key % self.key_space

    def add(self, key: int) -> None:
        hash_key = self.hash_function(key)
        bucket = self.hash_table[hash_key]

        # HashSet Requirement: No duplicates.
        # Check if key exists in the specific bucket before appending.
        if key not in bucket:
            bucket.append(key)

    def remove(self, key: int) -> None:
        hash_key = self.hash_function(key)
        bucket = self.hash_table[hash_key]

        # Check existence before removal to avoid errors.
        if key in bucket:
            bucket.remove(key)

    def contains(self, key: int) -> bool:
        hash_key = self.hash_function(key)
        bucket = self.hash_table[hash_key]

        # Search linearly within the specific bucket (efficient if collisions are low).
        return key in bucket


if __name__ == "__main__":
    hashSet = MyHashSet()
    hashSet.add(1)
    hashSet.add(2)
    print(f"Contains 1: {hashSet.contains(1)}")  # Expected: True
    print(f"Contains 3: {hashSet.contains(3)}")  # Expected: False
    hashSet.add(2)
    print(f"Contains 2: {hashSet.contains(2)}")  # Expected: True
    hashSet.remove(2)
    print(f"Contains 2 after removal: {hashSet.contains(2)}")  # Expected: False
    print(f"Contains 1 after removal of 2: {hashSet.contains(1)}")  # Expected: True
