# In the original hash table, each bucket can store only one key-value pair.
# Separate chaining converts a single element into a linked list, treating
# key-value pairs as list nodes, storing all colliding key-value pairs in the same linked list.


# It is worth noting that when the linked list/list becomes too long, the performance of the hash table will degrade.
# This is because the time complexity of the get, put, and remove methods will be O(n) in the worst case.


class Pair:
    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return f"{self.key} -> {self.value}"


class HashMapChaining:
    def __init__(self):
        self.size = 0  # Number of key-value pairs
        self.capacity = 4  # Hash table capacity
        self.load_thres = 2.0 / 3.0  # Load factor threshold for triggering expansion
        self.extend_ratio = 2  # Expansion multiplier
        self.buckets = [[] for _ in range(self.capacity)]  # Bucket array

    def hash_func(self, key):
        # Same as the original hash table
        return key % self.capacity

    def load_factor(self):
        # Something that we consider when we want to expand the hash table
        return self.size / self.capacity

    def get(self, key: int) -> str | None:
        # Same as the original hash table
        index = self.hash_func(key)
        bucket = self.buckets[index]
        # Traverse the bucket, if the key is found, return the corresponding val
        for pair in bucket:
            if pair.key == key:
                return pair.value
        # If the key is not found, return None
        return None

    def put(self, key: int, val: str):
        # When the load factor exceeds the threshold, perform expansion
        if self.load_factor() > self.load_thres:
            self.extend()
        index = self.hash_func(key)
        bucket = self.buckets[index]
        # Traverse the bucket, if the specified key is encountered, update the corresponding val and return
        for pair in bucket:
            if pair.key == key:
                pair.value = val
                return
        # If the key is not found, add the key-value pair to the end
        pair = Pair(key, val)
        bucket.append(pair)
        self.size += 1

    def remove(self, key: int):
        index = self.hash_func(key)
        bucket = self.buckets[index]
        # Traverse the bucket, remove the key-value pair from it
        for pair in bucket:
            if pair.key == key:
                bucket.remove(pair)  # list operation
                self.size -= 1
                break

    def extend(self):
        # Temporarily store the original hash table
        buckets = self.buckets
        # Initialize the extended new hash table
        self.capacity *= self.extend_ratio
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        # Move key-value pairs from the original hash table to the new hash table
        for bucket in buckets:
            for pair in bucket:
                self.put(pair.key, pair.value)

    def __str__(self) -> str:
        # Return all key-value pairs as a string
        pairs = []
        for bucket in self.buckets:
            for pair in bucket:
                pairs.append(f"{pair.key} -> {pair.value}")
        return "\n".join(pairs)


# example usage
if __name__ == "__main__":
    pair1 = Pair(1, "one")
    pair2 = Pair(2, "two")
    pair3 = Pair(3, "three")
    pair4 = Pair(4, "four")
    pair5 = Pair(5, "five")
    pair6 = Pair(6, "six")

    hash_map = HashMapChaining()
    hash_map.put(pair1.key, pair1.value)
    hash_map.put(pair2.key, pair2.value)
    hash_map.put(pair3.key, pair3.value)
    hash_map.put(pair4.key, pair4.value)
    hash_map.put(pair5.key, pair5.value)
    hash_map.put(pair6.key, pair6.value)
    print(hash_map)
    print(hash_map.get(3))
    print(hash_map.size)
    print(hash_map.capacity)
