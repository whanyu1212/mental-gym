package arrayshashing

// containsDuplicate reports whether any integer in nums appears more than once.
// It returns false when all elements are distinct.
// The Python equivalent is len(nums) != len(set(nums)).
func containsDuplicate(nums []int) bool {
	// make creates an empty map, and := declares unique with the inferred type.
	// In map[int]struct{}, int is the key type and struct{} is the value type.
	// An empty struct has zero fields. Only the keys matter for a set.
	unique := make(map[int]struct{})

	// range gives us an index and a value. _ discards the index.
	for _, num := range nums {
		// In struct{}{}, struct{} names the type and the final {} creates a value.
		// This works like adding num to a Python set. Repeated keys occupy one entry.
		unique[num] = struct{}{}
	}

	// len(nums) counts all elements. len(unique) counts the distinct keys.
	return len(nums) != len(unique)
}
