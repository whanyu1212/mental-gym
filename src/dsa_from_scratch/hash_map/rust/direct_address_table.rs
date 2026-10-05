// Direct addressing table: the key IS the array index. No hash function, no
// collisions, every operation is O(1) worst case.
//
//   keys 0..size  ->  slots[key]
//
// Limitations:
// - Keys must be (or map to) non-negative integers.
// - The key range must be small: memory is O(range), not O(number of keys).
// - Keys should be dense; otherwise most slots stay empty and are wasted.
// A hash table fixes the range problem by compressing keys with `hash % capacity`,
// at the cost of having to handle collisions.
//
// A table of `bool` is a set over a small range; this one stores a value per key.

#[derive(Debug)]
pub struct DirectAddressTable {
    slots: Vec<Option<i32>>,
}

impl DirectAddressTable {
    /// Creates a table that accepts keys in `0..size`.
    pub fn new(size: usize) -> Self {
        Self {
            slots: vec![None; size],
        }
    }

    /// The number of valid keys (keys are `0..size`).
    pub fn size(&self) -> usize {
        self.slots.len()
    }

    /// Stores `value` under `key` and returns the previous value, if any.
    /// Panics if `key` is outside `0..size`.
    pub fn insert(&mut self, key: usize, value: i32) -> Option<i32> {
        assert!(key < self.slots.len(), "key out of range");
        self.slots[key].replace(value)
    }

    /// Removes `key` and returns its value, or `None` if absent or out of range.
    pub fn delete(&mut self, key: usize) -> Option<i32> {
        self.slots.get_mut(key).and_then(Option::take)
    }

    /// Looks up `key`. Out-of-range keys are simply absent.
    pub fn search(&self, key: usize) -> Option<i32> {
        self.slots.get(key).copied().flatten()
    }

    pub fn contains(&self, key: usize) -> bool {
        self.search(key).is_some()
    }

    /// Number of stored keys. O(size), since nothing tracks the count.
    pub fn len(&self) -> usize {
        self.slots.iter().filter(|slot| slot.is_some()).count()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

#[cfg(test)]
mod tests {
    use super::DirectAddressTable;

    #[test]
    fn insert_search_delete() {
        let mut table = DirectAddressTable::new(10);
        assert_eq!(table.insert(3, 30), None);
        assert_eq!(table.search(3), Some(30));
        assert_eq!(table.delete(3), Some(30));
        assert_eq!(table.search(3), None);
        assert_eq!(table.delete(3), None);
    }

    #[test]
    fn insert_returns_previous_value() {
        let mut table = DirectAddressTable::new(4);
        table.insert(1, 10);
        assert_eq!(table.insert(1, 11), Some(10));
        assert_eq!(table.search(1), Some(11));
    }

    #[test]
    fn out_of_range_reads_are_absent() {
        let mut table = DirectAddressTable::new(4);
        assert_eq!(table.search(4), None);
        assert_eq!(table.delete(100), None);
        assert!(!table.contains(4));
    }

    #[test]
    #[should_panic(expected = "key out of range")]
    fn out_of_range_insert_panics() {
        DirectAddressTable::new(4).insert(4, 1);
    }

    #[test]
    fn zero_is_a_valid_key_and_value() {
        let mut table = DirectAddressTable::new(1);
        table.insert(0, 0);
        assert_eq!(table.search(0), Some(0));
        assert!(table.contains(0));
    }

    #[test]
    fn len_counts_only_filled_slots() {
        let mut table = DirectAddressTable::new(10);
        assert!(table.is_empty());
        for key in [1, 3, 5, 7] {
            table.insert(key, 1);
        }
        table.delete(5);
        assert_eq!(table.len(), 3);
        assert_eq!(table.size(), 10);
    }
}
