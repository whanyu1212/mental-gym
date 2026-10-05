// The simplest hash table: a fixed array of 100 buckets where
//   index = hash(key) % capacity
// and each bucket holds at most ONE key-value pair.
//
// This deliberately ignores collisions. Two different keys with the same index
// (for example 1 and 101) fight over one bucket, and the later `put` evicts the
// earlier pair. `put` returns whatever it displaced, so the data loss is visible.
// Separate chaining and open addressing are the two standard ways to fix this.

use super::hash_functions::mod_hash;

const CAPACITY: usize = 100;

#[derive(Debug)]
pub struct ArrayHashMap {
    buckets: Vec<Option<(i32, i32)>>,
}

impl ArrayHashMap {
    pub fn new() -> Self {
        Self {
            buckets: vec![None; CAPACITY],
        }
    }

    /// Stores the pair and returns the pair it displaced. The displaced pair
    /// has the same key (a plain update) or a different key (a collision loss).
    pub fn put(&mut self, key: i32, value: i32) -> Option<(i32, i32)> {
        let index = mod_hash(key, CAPACITY);
        self.buckets[index].replace((key, value))
    }

    /// Returns the value for `key`. Checks the stored key too: another key may
    /// occupy the same bucket, and returning its value would be wrong.
    pub fn get(&self, key: i32) -> Option<i32> {
        match self.buckets[mod_hash(key, CAPACITY)] {
            Some((stored_key, value)) if stored_key == key => Some(value),
            _ => None,
        }
    }

    /// Removes `key` and returns its value. A different key in the same
    /// bucket is left alone.
    pub fn remove(&mut self, key: i32) -> Option<i32> {
        let index = mod_hash(key, CAPACITY);
        match self.buckets[index] {
            Some((stored_key, value)) if stored_key == key => {
                self.buckets[index] = None;
                Some(value)
            }
            _ => None,
        }
    }

    pub fn len(&self) -> usize {
        self.buckets.iter().flatten().count()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// All stored pairs in bucket order (not insertion order).
    pub fn entry_set(&self) -> Vec<(i32, i32)> {
        self.buckets.iter().flatten().copied().collect()
    }

    pub fn key_set(&self) -> Vec<i32> {
        self.buckets.iter().flatten().map(|&(key, _)| key).collect()
    }

    pub fn value_set(&self) -> Vec<i32> {
        self.buckets
            .iter()
            .flatten()
            .map(|&(_, value)| value)
            .collect()
    }
}

impl Default for ArrayHashMap {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::ArrayHashMap;

    #[test]
    fn put_get_remove() {
        let mut map = ArrayHashMap::new();
        assert_eq!(map.put(12836, 1), None);
        assert_eq!(map.get(12836), Some(1));
        assert_eq!(map.remove(12836), Some(1));
        assert_eq!(map.get(12836), None);
    }

    #[test]
    fn put_same_key_returns_old_pair() {
        let mut map = ArrayHashMap::new();
        map.put(5, 50);
        assert_eq!(map.put(5, 51), Some((5, 50)));
        assert_eq!(map.get(5), Some(51));
    }

    #[test]
    fn colliding_keys_evict_each_other() {
        let mut map = ArrayHashMap::new();
        map.put(1, 10);
        // 101 % 100 == 1, so it lands in the same bucket and replaces key 1.
        assert_eq!(map.put(101, 20), Some((1, 10)));
        assert_eq!(map.get(1), None);
        assert_eq!(map.get(101), Some(20));
        assert_eq!(map.len(), 1);
    }

    #[test]
    fn get_and_remove_ignore_other_keys_in_the_bucket() {
        let mut map = ArrayHashMap::new();
        map.put(101, 20);
        assert_eq!(map.get(1), None);
        assert_eq!(map.remove(1), None);
        assert_eq!(map.get(101), Some(20));
    }

    #[test]
    fn negative_keys_work() {
        let mut map = ArrayHashMap::new();
        map.put(-1, 7);
        assert_eq!(map.get(-1), Some(7));
        assert_eq!(map.get(99), None);
    }

    #[test]
    fn entry_key_and_value_sets_follow_bucket_order() {
        let mut map = ArrayHashMap::new();
        map.put(30, 3);
        map.put(10, 1);
        map.put(20, 2);
        assert_eq!(map.entry_set(), vec![(10, 1), (20, 2), (30, 3)]);
        assert_eq!(map.key_set(), vec![10, 20, 30]);
        assert_eq!(map.value_set(), vec![1, 2, 3]);
    }
}
