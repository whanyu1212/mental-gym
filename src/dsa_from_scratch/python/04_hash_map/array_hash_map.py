# Implementing a hash table using an array
# index = hash(key) % capacity


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

    def get(self, key: int) -> str:
        index = self.hash_func(key)
        pair = self.buckets[index]
        if pair is None:
            return "Key not found"
        return pair.value

    def put(self, key: int, value: str) -> None:
        pair = Pair(key, value)
        index = self.hash_func(key)
        self.buckets[index] = pair

    def remove(self, key: int) -> None:
        # Setting the bucket to None
        index = self.hash_func(key)
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
