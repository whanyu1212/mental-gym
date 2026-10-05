class Pair:
    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return f"{self.key} -> {self.value}"


class HashMapOpenAddressing:
    def __init__(self):
        self.size = 0  # Number of key-value pairs, 0 to begin with
        self.tombstones = 0  # Number of removal marks currently in the table
        self.capacity = 4  # Hash table capacity
        self.load_thres = 2.0 / 3.0  # Load factor threshold for triggering expansion
        self.extend_ratio = 2  # Expansion multiplier
        self.buckets: list[Pair | None] = [None] * self.capacity  # Bucket array
        self.TOMBSTONE = Pair(-1, "-1")  # Removal mark

    def hash_func(self, key: int) -> int:
        # Remains the same as the original hash table
        return key % self.capacity

    def load_factor(self) -> float:
        # Tombstones count too: a search stops only at a None bucket, so if
        # removal marks filled every None bucket, find_bucket would loop forever.
        return (self.size + self.tombstones) / self.capacity

    def find_bucket(self, key: int) -> int:
        index = self.hash_func(key)
        first_tombstone = -1  # a marker for a deleted element
        # Linear probing, break when encountering an empty bucket
        while self.buckets[index] is not None:
            # If the key is encountered, return the corresponding bucket index
            if self.buckets[index].key == key:
                # If a removal mark was encountered earlier, move the key-value pair to
                # that index
                if first_tombstone != -1:
                    self.buckets[first_tombstone] = self.buckets[index]
                    self.buckets[index] = self.TOMBSTONE
                    return first_tombstone  # Return the moved bucket index
                return index  # Return bucket index
            # Record the first encountered removal mark
            if first_tombstone == -1 and self.buckets[index] is self.TOMBSTONE:
                first_tombstone = index
            # Calculate the bucket index, return to the head if exceeding the tail
            index = (index + 1) % self.capacity
        # If the key does not exist, return the index of the insertion point
        return index if first_tombstone == -1 else first_tombstone

    def find_bucket_quadratic(self, key: int, c1: int = 1, c2: int = 3) -> int:
        index = self.hash_func(key)
        first_tombstone = -1
        i = 0  # Probe count
        while self.buckets[index] is not None:
            if self.buckets[index].key == key:
                if first_tombstone != -1:
                    self.buckets[first_tombstone] = self.buckets[index]
                    self.buckets[index] = self.TOMBSTONE
                    return first_tombstone
                return index
            if first_tombstone == -1 and self.buckets[index] is self.TOMBSTONE:
                first_tombstone = index
            i += 1
            index = (self.hash_func(key) + c1 * i + c2 * i * i) % self.capacity
        return index if first_tombstone == -1 else first_tombstone

    def find_bucket_double_hashing(self, key: int) -> int:
        index = self.hash_func(key)
        hash2 = 1 + (key % (self.capacity - 1))  # Second hash function
        first_tombstone = -1
        i = 0  # Probe count
        while self.buckets[index] is not None:
            if self.buckets[index].key == key:
                if first_tombstone != -1:
                    self.buckets[first_tombstone] = self.buckets[index]
                    self.buckets[index] = self.TOMBSTONE
                    return first_tombstone
                return index
            if first_tombstone == -1 and self.buckets[index] is self.TOMBSTONE:
                first_tombstone = index
            i += 1
            index = (self.hash_func(key) + i * hash2) % self.capacity
        return index if first_tombstone == -1 else first_tombstone

    def get(self, key: int) -> str:
        # Search for the bucket index corresponding to key
        index = self.find_bucket(key)
        # If the key-value pair is found, return the corresponding val
        if self.buckets[index] not in [None, self.TOMBSTONE]:
            return self.buckets[index].value
        # If the key-value pair does not exist, return None
        return None

    def put(self, key: int, val: str):
        # When the load factor exceeds the threshold, perform expansion
        if self.load_factor() > self.load_thres:
            self.extend()
        # Search for the bucket index corresponding to key
        index = self.find_bucket(key)
        # If the key-value pair is found, overwrite val and return
        if self.buckets[index] not in [None, self.TOMBSTONE]:
            self.buckets[index].value = val
            return
        # If the key-value pair does not exist, add the key-value pair
        if self.buckets[index] is self.TOMBSTONE:
            self.tombstones -= 1  # reusing a removal mark
        self.buckets[index] = Pair(key, val)
        self.size += 1

    def remove(self, key: int):
        # Search for the bucket index corresponding to key
        index = self.find_bucket(key)
        # If the key-value pair is found, cover it with a removal mark
        if self.buckets[index] not in [None, self.TOMBSTONE]:
            self.buckets[index] = self.TOMBSTONE
            self.size -= 1
            self.tombstones += 1

    def extend(self):
        """
        Rebuild the table, dropping every removal mark.

        Only grow when live pairs fill at least a third of the table. If
        the load comes mostly from tombstones, rebuilding at the same
        capacity is enough; otherwise repeated put/remove would grow the
        table forever.
        """
        # Temporarily store the original hash table
        buckets_tmp = self.buckets
        # Initialize the new hash table
        if self.size * 3 >= self.capacity:
            self.capacity *= self.extend_ratio
        self.buckets = [None] * self.capacity
        self.size = 0
        self.tombstones = 0
        # Move key-value pairs from the original hash table to the new hash table
        for pair in buckets_tmp:
            if pair not in [None, self.TOMBSTONE]:
                self.put(pair.key, pair.value)

    def print(self):
        for pair in self.buckets:
            if pair is None:
                print("None")
            elif pair is self.TOMBSTONE:
                print("TOMBSTONE")
            else:
                print(pair.key, "->", pair.value)


# example usage
if __name__ == "__main__":
    hash_map = HashMapOpenAddressing()
    for key, name in [(1, "one"), (5, "five"), (9, "nine"), (2, "two")]:
        hash_map.put(key, name)
    hash_map.put(5, "FIVE")  # update an existing key
    hash_map.remove(9)  # leaves a tombstone

    assert hash_map.get(1) == "one"
    assert hash_map.get(5) == "FIVE"
    assert hash_map.get(9) is None
    assert hash_map.get(2) == "two"
    assert hash_map.size == 3

    # Repeated put/remove must not fill the table with removal marks.
    for key in range(100, 200):
        hash_map.put(key, "x")
        hash_map.remove(key)
    assert hash_map.size == 3
    assert hash_map.capacity <= 16

    hash_map.print()
