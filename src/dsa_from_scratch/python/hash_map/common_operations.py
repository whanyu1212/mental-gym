## The following code snippet is taken from hello-algo

# Initialize hash table
hmap: dict = {}

# Add operation
# Add key-value pair (key, value) to the hash table
hmap[12836] = "Xiao Ha"
hmap[15937] = "Xiao Luo"
hmap[16750] = "Xiao Suan"
hmap[13276] = "Xiao Fa"
hmap[10583] = "Xiao Ya"

# Query operation
# Input key into hash table, get value
name: str = hmap[15937]

# Delete operation
# Delete key-value pair (key, value) from hash table
hmap.pop(10583)


# Traverse hash table
# Traverse key-value pairs key->value
for key, value in hmap.items():
    print(key, "->", value)
# Traverse keys only
for key in hmap.keys():
    print(key)
# Traverse values only
for value in hmap.values():
    print(value)
