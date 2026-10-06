# Implementing a hash table using an array
# index = hash(key) % capacity
#
# Each bucket holds at most ONE pair, so this table does not handle collisions:
# two keys with the same index (e.g. 1 and 101) evict each other on put. That
# limitation is the point of this file. Separate chaining and open addressing
# fix it. Even so, get and remove must check the stored key, or they would
# return or delete the pair of a different key that shares the bucket.


# Create a class Pair with two attributes key and value
class Pair:
    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return f"{self.key} -> {self.value}"


class ArrayHashMap:
    def __init__(self):
        # Fixing capacity to 100, alternatively you can pass capacity as a parameter
        # The entire buckets is a list
        # Each bucket/element is either a Pair object or None
        self.buckets: list[Pair | None] = [None] * 100

    def hash_func(self, key: int) -> int:
        # the naive hash function here is to take the key modulo 100
        index = key % 100
        return index

    def get(self, key: int) -> str | None:
        """Return the value stored for `key`, or None if it is
        absent."""
        pair = self.buckets[self.hash_func(key)]
        # The bucket may hold a different key with the same index.
        if pair is None or pair.key != key:
            return None
        return pair.value

    def put(self, key: int, value: str) -> Pair | None:
        """
        Store the pair and return the pair it displaced, if any.

        The displaced pair has the same key (a plain update) or a
        different key (lost to a collision).
        """
        index = self.hash_func(key)
        displaced = self.buckets[index]
        self.buckets[index] = Pair(key, value)
        return displaced

    def remove(self, key: int) -> None:
        """Remove `key`; a different key in the same bucket is left
        alone."""
        index = self.hash_func(key)
        pair = self.buckets[index]
        if pair is not None and pair.key == key:
            self.buckets[index] = None

    def entry_set(self) -> list[Pair]:
        # The method name is inspired by Java's HashMap interface
        # Return all key-value pairs
        pairs = []
        for pair in self.buckets:
            if pair is not None:
                pairs.append(pair)
        return pairs

    def key_set(self) -> list[int]:
        # Return all keys
        keys = []
        for pair in self.buckets:
            if pair is not None:
                keys.append(pair.key)
        return keys

    def value_set(self) -> list[str]:
        # Return all values
        values = []
        for pair in self.buckets:
            if pair is not None:
                values.append(pair.value)
        return values

    def __str__(self) -> str:
        # Return all key-value pairs as a string
        pairs = []
        for pair in self.buckets:
            if pair is not None:
                pairs.append(f"{pair.key} -> {pair.value}")
        return "\n".join(pairs)


# example usage
if __name__ == "__main__":
    pair1 = Pair(12836, "Xiao Ha")
    pair2 = Pair(15937, "Xiao Luo")
    pair3 = Pair(16750, "Xiao Suan")
    pair4 = Pair(13276, "Xiao Fa")
    pair5 = Pair(10583, "Xiao Ya")

    array_hash_map = ArrayHashMap()
    array_hash_map.put(pair1.key, pair1.value)
    array_hash_map.put(pair2.key, pair2.value)
    array_hash_map.put(pair3.key, pair3.value)
    array_hash_map.put(pair4.key, pair4.value)
    array_hash_map.put(pair5.key, pair5.value)
    print(array_hash_map)
    print(array_hash_map.get(15937))
    array_hash_map.remove(10583)
    print(array_hash_map)

    print(array_hash_map.entry_set())

    # Collisions: 1 and 101 share bucket 1.
    collisions = ArrayHashMap()
    collisions.put(1, "one")
    displaced = collisions.put(101, "hundred-one")
    assert displaced is not None and displaced.key == 1  # key 1 was evicted
    assert collisions.get(1) is None  # not the value of key 101
    assert collisions.get(201) is None  # a key that was never stored
    assert collisions.get(101) == "hundred-one"
    collisions.remove(1)  # must not delete key 101's pair
    assert collisions.get(101) == "hundred-one"
