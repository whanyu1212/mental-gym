// Hash table with separate chaining.
//
// Each bucket holds a small list of every pair whose key hashes to that index,
// so colliding keys simply share a bucket:
//
//   buckets[0] = []
//   buckets[1] = [(1, a), (5, b)]      1 % 4 == 5 % 4
//   buckets[2] = [(2, c)]
//
// Cost per operation = O(bucket length). With a decent hash and the load factor
// held at or below 2/3, buckets stay tiny, so get/put/remove are O(1) on average.
// If every key lands in one bucket, they degrade to O(n).
//
// Resizing: when adding one more pair would push the load factor
// (size / capacity) above 2/3, double the capacity and re-insert everything.
// Re-insertion is O(n), but it happens only after the table doubles, so `put`
// is amortized O(1), the same argument as the dynamic array.
//
// Rust note: each bucket is a `Vec<(i32, i32)>` rather than a linked list.
// It is contiguous in memory and simpler to write safely, and buckets are short.

use super::hash_functions::mod_hash;

const INITIAL_CAPACITY: usize = 4;

#[derive(Debug)]
pub struct HashMapChaining {
    buckets: Vec<Vec<(i32, i32)>>,
    size: usize,
}

impl HashMapChaining {
    pub fn new() -> Self {
        Self {
            buckets: vec![Vec::new(); INITIAL_CAPACITY],
            size: 0,
        }
    }

    pub fn len(&self) -> usize {
        self.size
    }

    pub fn is_empty(&self) -> bool {
        self.size == 0
    }

    pub fn capacity(&self) -> usize {
        self.buckets.len()
    }

    pub fn load_factor(&self) -> f64 {
        self.size as f64 / self.capacity() as f64
    }

    fn bucket_index(&self, key: i32) -> usize {
        mod_hash(key, self.capacity())
    }

    pub fn get(&self, key: i32) -> Option<i32> {
        self.buckets[self.bucket_index(key)]
            .iter()
            .find(|&&(stored_key, _)| stored_key == key)
            .map(|&(_, value)| value)
    }

    pub fn contains_key(&self, key: i32) -> bool {
        self.get(key).is_some()
    }

    /// Inserts or updates `key`. Returns the previous value, like `std::HashMap::insert`.
    pub fn put(&mut self, key: i32, value: i32) -> Option<i32> {
        let index = self.bucket_index(key);
        if let Some(pair) = self.buckets[index].iter_mut().find(|pair| pair.0 == key) {
            return Some(std::mem::replace(&mut pair.1, value));
        }

        // New key: grow first if it would push the load factor above 2/3.
        if (self.size + 1) * 3 > self.capacity() * 2 {
            self.grow();
        }
        let index = self.bucket_index(key); // capacity may have changed
        self.buckets[index].push((key, value));
        self.size += 1;
        None
    }

    /// Removes `key` and returns its value.
    pub fn remove(&mut self, key: i32) -> Option<i32> {
        let index = self.bucket_index(key);
        let bucket = &mut self.buckets[index];
        let position = bucket
            .iter()
            .position(|&(stored_key, _)| stored_key == key)?;
        // Order inside a bucket is irrelevant, so an O(1) swap_remove is fine.
        let (_, value) = bucket.swap_remove(position);
        self.size -= 1;
        Some(value)
    }

    /// Doubles the capacity and re-inserts every pair (indexes change because
    /// they depend on the capacity).
    fn grow(&mut self) {
        let new_capacity = self.capacity() * 2;
        let old = std::mem::replace(&mut self.buckets, vec![Vec::new(); new_capacity]);
        for (key, value) in old.into_iter().flatten() {
            let index = mod_hash(key, new_capacity);
            self.buckets[index].push((key, value));
        }
    }

    /// All pairs in bucket order (not insertion order).
    pub fn entries(&self) -> Vec<(i32, i32)> {
        self.buckets.iter().flatten().copied().collect()
    }

    pub fn keys(&self) -> Vec<i32> {
        self.buckets.iter().flatten().map(|&(key, _)| key).collect()
    }

    /// The length of the longest bucket: a quick measure of how badly keys collide.
    pub fn longest_chain(&self) -> usize {
        self.buckets.iter().map(Vec::len).max().unwrap_or(0)
    }
}

impl Default for HashMapChaining {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::HashMapChaining;
    use std::collections::HashMap;

    #[test]
    fn put_get_remove() {
        let mut map = HashMapChaining::new();
        assert_eq!(map.put(1, 10), None);
        assert_eq!(map.get(1), Some(10));
        assert_eq!(map.remove(1), Some(10));
        assert_eq!(map.get(1), None);
        assert_eq!(map.remove(1), None);
        assert!(map.is_empty());
    }

    #[test]
    fn put_existing_key_updates_without_growing_size() {
        let mut map = HashMapChaining::new();
        map.put(1, 10);
        assert_eq!(map.put(1, 11), Some(10));
        assert_eq!(map.get(1), Some(11));
        assert_eq!(map.len(), 1);
    }

    #[test]
    fn colliding_keys_share_a_bucket_and_all_survive() {
        let mut map = HashMapChaining::new();
        // 1, 5 and 9 are all 1 mod 4, but the table grows along the way, so
        // check they survive every resize too.
        for key in [1, 5, 9, 13, 17] {
            map.put(key, key * 10);
        }
        for key in [1, 5, 9, 13, 17] {
            assert_eq!(map.get(key), Some(key * 10));
        }
    }

    #[test]
    fn capacity_doubles_when_load_factor_would_exceed_two_thirds() {
        let mut map = HashMapChaining::new();
        assert_eq!(map.capacity(), 4);
        map.put(1, 1);
        map.put(2, 2);
        assert_eq!(map.capacity(), 4); // 2/4 = 0.5
        map.put(3, 3);
        assert_eq!(map.capacity(), 8); // 3/4 = 0.75 would exceed 2/3
        assert!(map.load_factor() <= 2.0 / 3.0);
    }

    #[test]
    fn load_factor_never_exceeds_two_thirds() {
        let mut map = HashMapChaining::new();
        for key in 0..1000 {
            map.put(key, key);
            assert!(map.load_factor() <= 2.0 / 3.0);
        }
    }

    #[test]
    fn negative_keys_work() {
        let mut map = HashMapChaining::new();
        map.put(-7, 70);
        map.put(-3, 30);
        assert_eq!(map.get(-7), Some(70));
        assert_eq!(map.get(-3), Some(30));
        assert_eq!(map.get(7), None);
    }

    #[test]
    fn key_zero_and_value_zero_are_distinct_from_absent() {
        let mut map = HashMapChaining::new();
        map.put(0, 0);
        assert_eq!(map.get(0), Some(0));
        assert!(map.contains_key(0));
        assert!(!map.contains_key(1));
    }

    #[test]
    fn entries_and_keys_list_everything() {
        let mut map = HashMapChaining::new();
        for key in [3, 1, 2] {
            map.put(key, key * 2);
        }
        let mut entries = map.entries();
        entries.sort();
        assert_eq!(entries, vec![(1, 2), (2, 4), (3, 6)]);
        let mut keys = map.keys();
        keys.sort();
        assert_eq!(keys, vec![1, 2, 3]);
    }

    #[test]
    fn longest_chain_reflects_collisions() {
        let mut map = HashMapChaining::new();
        assert_eq!(map.longest_chain(), 0);
        // Multiples of 1024 all hash to bucket 0 for every capacity <= 1024.
        for key in 0..6 {
            map.put(key * 1024, 0);
        }
        assert!(map.longest_chain() >= 3);
    }

    #[test]
    fn matches_std_hash_map_under_random_operations() {
        let mut state = 42u64;
        let mut next = || {
            state = state
                .wrapping_mul(6364136223846793005)
                .wrapping_add(1442695040888963407);
            state >> 33
        };
        let mut map = HashMapChaining::new();
        let mut oracle = HashMap::new();
        for _ in 0..5000 {
            let operation = next() % 3;
            let key = (next() % 64) as i32 - 32;
            let value = (next() % 1000) as i32;
            match operation {
                0 => assert_eq!(map.put(key, value), oracle.insert(key, value)),
                1 => assert_eq!(map.remove(key), oracle.remove(&key)),
                _ => assert_eq!(map.get(key), oracle.get(&key).copied()),
            }
            assert_eq!(map.len(), oracle.len());
        }
    }
}
