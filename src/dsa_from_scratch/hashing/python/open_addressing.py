class Pair:
    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return f"{self.key} -> {self.value}"


class HashMapOpenAddressing:
    """
    Hash map with open addressing.

    Probing strategies (the i-th probe for a key whose home slot is h):
    - "linear":    h + i
    - "quadratic": h + i * (i + 1) / 2   (triangular numbers)
    - "double":    h + i * step, where step = 2 * (key % (capacity // 2)) + 1

    The capacity is always a power of two (4, 8, 16, ...). That is what makes
    triangular offsets and an odd step visit every slot exactly once in
    `capacity` probes, so a search can never cycle forever over a subset.
    """

    PROBINGS = ("linear", "quadratic", "double")

    def __init__(self, probing: str = "linear"):
        if probing not in self.PROBINGS:
            raise ValueError(f"probing must be one of {self.PROBINGS}")
        self.probing = probing
        self.size = 0  # Number of key-value pairs, 0 to begin with
        self.tombstones = 0  # Number of removal marks currently in the table
        self.capacity = 4  # Hash table capacity, always a power of two
        self.load_thres = 2.0 / 3.0  # Load factor threshold for triggering expansion
        self.extend_ratio = 2  # Expansion multiplier (keeps a power of two)
        self.buckets: list[Pair | None] = [None] * self.capacity  # Bucket array
        self.TOMBSTONE = Pair(-1, "-1")  # Removal mark

    def hash_func(self, key: int) -> int:
        # Python's % is always non-negative for a positive divisor,
        # so negative keys still give a valid index.
        return key % self.capacity

    def load_factor(self) -> float:
        # Tombstones count too: a search stops only at a None bucket, so if
        # removal marks filled every None bucket, find_bucket would loop forever.
        return (self.size + self.tombstones) / self.capacity

    def probe(self, key: int, i: int) -> int:
        """Return the bucket index of the i-th probe (i = 0 is the home slot)."""
        home = self.hash_func(key)
        if self.probing == "linear":
            offset = i
        elif self.probing == "quadratic":
            offset = i * (i + 1) // 2
        else:
            # An odd step is coprime with a power-of-two capacity.
            offset = i * (2 * (key % (self.capacity // 2)) + 1)
        return (home + offset) % self.capacity

    def find_bucket(self, key: int) -> int:
        """
        Return the bucket holding `key`, or the bucket to insert it
        into.

        The insertion point is the first removal mark on the probe path
        if there is one, otherwise the empty bucket that ended the
        search.
        """
        first_tombstone = -1  # a marker for a deleted element
        # At most `capacity` probes: the sequence visits each bucket once.
        for i in range(self.capacity):
            index = self.probe(key, i)
            bucket = self.buckets[index]
            if bucket is None:
                # Key is absent. Prefer reusing an earlier removal mark.
                return index if first_tombstone == -1 else first_tombstone
            if bucket is self.TOMBSTONE:
                # Record the first encountered removal mark
                if first_tombstone == -1:
                    first_tombstone = index
            elif bucket.key == key:
                # If a removal mark was encountered earlier, move the key-value
                # pair there so the next lookup finds it sooner.
                if first_tombstone != -1:
                    self.buckets[first_tombstone] = bucket
                    self.buckets[index] = self.TOMBSTONE
                    return first_tombstone
                return index
        # Every bucket was probed without finding the key or an empty bucket.
        if first_tombstone != -1:
            return first_tombstone
        raise RuntimeError("hash table is full; the load factor should prevent this")

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
    for probing in HashMapOpenAddressing.PROBINGS:
        hash_map = HashMapOpenAddressing(probing)
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

        print(f"--- {probing} probing")
        hash_map.print()
