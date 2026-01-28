class MyHashMap:

    def __init__(self):
        # Similar to HashSet, we use a fixed size array for buckets.
        self.key_space = 1000000
        # Initialize buckets. 
        # DIFFERENCE: Each bucket will store pairs (tuples or objects) of (key, value).
        # e.g., bucket = [(key1, val1), (key2, val2)]
        self.hash_table = [[] for _ in range(self.key_space)]

    def hash_function(self, key: int) -> int:
        return key % self.key_space

    def put(self, key: int, value: int) -> None:
        hash_key = self.hash_function(key)
        bucket = self.hash_table[hash_key]

        # DIFFERENCE: We must iterate to find if the key ALREADY exists.
        # If found, UPDATE the value. If not found, APPEND the new pair.
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)  # Update existing key's value
                return
        
        # If loop finishes without returning, key is new.
        bucket.append((key, value))

    def get(self, key: int) -> int:
        hash_key = self.hash_function(key)
        bucket = self.hash_table[hash_key]

        # DIFFERENCE: Iterate to find the key and RETURN ITS VALUE.
        for k, v in bucket:
            if k == key:
                return v
        
        # If not found, return -1 (standard HashMap behavior for missing keys in LeetCode)
        return -1

    def remove(self, key: int) -> None:
        hash_key = self.hash_function(key)
        bucket = self.hash_table[hash_key]

        # Iterate to find and remove the pair.
        for i, (k, v) in enumerate(bucket):
            if k == key:
                del bucket[i] # Remove the pair from the list
                return


if __name__ == "__main__":
    hashMap = MyHashMap()
    hashMap.put(1, 1)
    hashMap.put(2, 2)
    print(f"Get 1: {hashMap.get(1)}")            # returns 1
    print(f"Get 3 (not found): {hashMap.get(3)}") # returns -1 (not found)
    hashMap.put(2, 1)                             # update the existing value
    print(f"Get 2 (updated): {hashMap.get(2)}")   # returns 1 
    hashMap.remove(2)                             # remove the mapping for 2
    print(f"Get 2 (removed): {hashMap.get(2)}")   # returns -1 (not found)
