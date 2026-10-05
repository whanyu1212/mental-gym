// Hash table with open addressing: every pair lives directly in the slot
// array, and a collision is resolved by probing for another free slot.
//
//   slots = [ Empty, Occupied(1,a), Occupied(5,b), Tombstone, Empty, ... ]
//   key 5 hashes to slot 1, finds it taken, probes on to slot 2.
//
// Probing strategies (the i-th attempt for a key whose home slot is h):
// - Linear:         h + i             simple and cache friendly, but clumps
//                                     into long runs ("primary clustering").
// - Quadratic:      h + i(i+1)/2      spreads a cluster out. With a power-of-two
//                                     capacity, these triangular offsets visit
//                                     every slot before repeating.
// - Double hashing: h + i * step(key) a second hash picks the stride. The stride
//                                     is odd, so it is coprime with a power-of-
//                                     two capacity and also reaches every slot.
//
// Deletion needs a TOMBSTONE. If `remove` just emptied the slot, a later lookup
// for a key that probed past it would stop early and wrongly report "absent".
// A tombstone means "something was here": lookups keep probing through it, and
// inserts may reuse it.
//
// Tombstones eat free slots, so they count toward the load factor. A search ends
// at the first Empty slot, so at least one slot must always stay Empty. When
// (size + tombstones) would pass 2/3 of capacity, the table is rebuilt: it
// doubles if it really is full of live pairs, otherwise it rebuilds at the same
// capacity just to clear the tombstones.

use super::hash_functions::mod_hash;

const INITIAL_CAPACITY: usize = 4; // must stay a power of two

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Probing {
    Linear,
    Quadratic,
    DoubleHashing,
}

#[derive(Debug, Clone, Copy)]
enum Slot {
    Empty,
    Tombstone,
    Occupied { key: i32, value: i32 },
}

/// Result of probing for a key.
enum Search {
    Found(usize),
    /// Key absent; this is the slot to insert into (the first tombstone seen,
    /// or else the Empty slot that ended the search).
    Vacant(usize),
    /// Every probe hit a live pair of another key. Cannot happen while the
    /// load factor is kept below 1.
    Full,
}

#[derive(Debug)]
pub struct HashMapOpenAddressing {
    slots: Vec<Slot>,
    size: usize,
    tombstones: usize,
    probing: Probing,
}

impl HashMapOpenAddressing {
    pub fn new(probing: Probing) -> Self {
        Self {
            slots: vec![Slot::Empty; INITIAL_CAPACITY],
            size: 0,
            tombstones: 0,
            probing,
        }
    }

    pub fn len(&self) -> usize {
        self.size
    }

    pub fn is_empty(&self) -> bool {
        self.size == 0
    }

    pub fn capacity(&self) -> usize {
        self.slots.len()
    }

    pub fn tombstones(&self) -> usize {
        self.tombstones
    }

    /// Slot index for the `attempt`-th probe (attempt 0 is the home slot).
    fn probe(&self, key: i32, attempt: usize) -> usize {
        let capacity = self.capacity();
        let home = mod_hash(key, capacity);
        let offset = match self.probing {
            Probing::Linear => attempt,
            Probing::Quadratic => attempt * (attempt + 1) / 2,
            // Odd stride, always in 1..capacity, so it is coprime with capacity.
            Probing::DoubleHashing => attempt * (2 * mod_hash(key, capacity / 2) + 1),
        };
        (home + offset) % capacity
    }

    fn search(&self, key: i32) -> Search {
        let mut first_tombstone = None;
        for attempt in 0..self.capacity() {
            let index = self.probe(key, attempt);
            match self.slots[index] {
                Slot::Empty => return Search::Vacant(first_tombstone.unwrap_or(index)),
                Slot::Tombstone => {
                    first_tombstone.get_or_insert(index);
                }
                Slot::Occupied {
                    key: stored_key, ..
                } if stored_key == key => {
                    return Search::Found(index);
                }
                Slot::Occupied { .. } => {}
            }
        }
        match first_tombstone {
            Some(index) => Search::Vacant(index),
            None => Search::Full,
        }
    }

    pub fn get(&self, key: i32) -> Option<i32> {
        match self.search(key) {
            Search::Found(index) => match self.slots[index] {
                Slot::Occupied { value, .. } => Some(value),
                _ => unreachable!("Found always points at an occupied slot"),
            },
            _ => None,
        }
    }

    pub fn contains_key(&self, key: i32) -> bool {
        self.get(key).is_some()
    }

    /// Inserts or updates `key`. Returns the previous value, like `std::HashMap::insert`.
    pub fn put(&mut self, key: i32, value: i32) -> Option<i32> {
        if let Search::Found(index) = self.search(key)
            && let Slot::Occupied { value: stored, .. } = &mut self.slots[index]
        {
            return Some(std::mem::replace(stored, value));
        }

        // New key: keep (live + tombstones) at or below 2/3 so an Empty slot
        // always exists to end searches.
        if (self.size + self.tombstones + 1) * 3 > self.capacity() * 2 {
            self.rebuild();
        }

        match self.search(key) {
            Search::Vacant(index) => {
                if matches!(self.slots[index], Slot::Tombstone) {
                    self.tombstones -= 1;
                }
                self.slots[index] = Slot::Occupied { key, value };
                self.size += 1;
                None
            }
            Search::Found(_) | Search::Full => unreachable!("load factor keeps a free slot"),
        }
    }

    /// Removes `key` and returns its value, leaving a tombstone behind.
    pub fn remove(&mut self, key: i32) -> Option<i32> {
        match self.search(key) {
            Search::Found(index) => {
                let Slot::Occupied { value, .. } = self.slots[index] else {
                    unreachable!("Found always points at an occupied slot");
                };
                self.slots[index] = Slot::Tombstone;
                self.size -= 1;
                self.tombstones += 1;
                Some(value)
            }
            _ => None,
        }
    }

    /// Re-inserts all live pairs into a fresh table, dropping every tombstone.
    /// Doubles the capacity if live pairs alone fill a third of it; otherwise
    /// the table is mostly tombstones, so rebuilding at the same size is enough.
    fn rebuild(&mut self) {
        let new_capacity = if self.size * 3 >= self.capacity() {
            self.capacity() * 2
        } else {
            self.capacity()
        };
        let old = std::mem::replace(&mut self.slots, vec![Slot::Empty; new_capacity]);
        self.size = 0;
        self.tombstones = 0;
        for slot in old {
            if let Slot::Occupied { key, value } = slot {
                self.put(key, value);
            }
        }
    }

    /// All pairs in slot order (not insertion order).
    pub fn entries(&self) -> Vec<(i32, i32)> {
        self.slots
            .iter()
            .filter_map(|slot| match *slot {
                Slot::Occupied { key, value } => Some((key, value)),
                _ => None,
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::{HashMapOpenAddressing, Probing};
    use std::collections::HashMap;

    const ALL_PROBINGS: [Probing; 3] =
        [Probing::Linear, Probing::Quadratic, Probing::DoubleHashing];

    #[test]
    fn put_get_remove_for_every_probing() {
        for probing in ALL_PROBINGS {
            let mut map = HashMapOpenAddressing::new(probing);
            assert_eq!(map.put(1, 10), None);
            assert_eq!(map.put(1, 11), Some(10));
            assert_eq!(map.get(1), Some(11));
            assert_eq!(map.remove(1), Some(11));
            assert_eq!(map.get(1), None);
            assert_eq!(map.remove(1), None);
            assert!(map.is_empty(), "{probing:?}");
        }
    }

    #[test]
    fn colliding_keys_all_survive_growth() {
        for probing in ALL_PROBINGS {
            let mut map = HashMapOpenAddressing::new(probing);
            // All congruent mod 4 and mod 8, so they collide at the start.
            let keys = [1, 9, 17, 25, 33, 41, 49];
            for key in keys {
                map.put(key, key * 10);
            }
            for key in keys {
                assert_eq!(map.get(key), Some(key * 10), "{probing:?}");
            }
        }
    }

    #[test]
    fn lookup_probes_past_a_tombstone() {
        let mut map = HashMapOpenAddressing::new(Probing::Linear);
        // 1, 9, 17 collide; after growth to 8 slots they sit in slots 1, 2, 3.
        for key in [1, 9, 17] {
            map.put(key, key);
        }
        assert_eq!(map.remove(9), Some(9));
        assert_eq!(map.tombstones(), 1);
        // 17 sits behind the tombstone; an emptied slot would hide it.
        assert_eq!(map.get(17), Some(17));
        assert_eq!(map.get(9), None);
    }

    #[test]
    fn insert_reuses_the_first_tombstone() {
        let mut map = HashMapOpenAddressing::new(Probing::Linear);
        for key in [1, 9, 17] {
            map.put(key, key);
        }
        map.remove(9);
        assert_eq!(map.tombstones(), 1);
        map.put(25, 25); // also collides; should land in the tombstone slot
        assert_eq!(map.tombstones(), 0);
        assert_eq!(map.get(25), Some(25));
        assert_eq!(map.get(17), Some(17));
    }

    #[test]
    fn updating_a_key_behind_a_tombstone_does_not_duplicate_it() {
        let mut map = HashMapOpenAddressing::new(Probing::Linear);
        for key in [1, 9, 17] {
            map.put(key, 0);
        }
        map.remove(9);
        assert_eq!(map.put(17, 99), Some(0));
        assert_eq!(map.len(), 2);
        assert_eq!(map.get(17), Some(99));
    }

    #[test]
    fn churn_on_few_keys_does_not_grow_without_bound() {
        for probing in ALL_PROBINGS {
            let mut map = HashMapOpenAddressing::new(probing);
            for round in 0..10_000 {
                map.put(round, round);
                map.remove(round);
            }
            assert!(map.is_empty());
            assert!(
                map.capacity() <= 8,
                "{probing:?} grew to {}",
                map.capacity()
            );
        }
    }

    #[test]
    fn negative_keys_work_for_every_probing() {
        for probing in ALL_PROBINGS {
            let mut map = HashMapOpenAddressing::new(probing);
            for key in -20..0 {
                map.put(key, key * 2);
            }
            for key in -20..0 {
                assert_eq!(map.get(key), Some(key * 2), "{probing:?}");
            }
        }
    }

    #[test]
    fn entries_lists_live_pairs_only() {
        let mut map = HashMapOpenAddressing::new(Probing::Quadratic);
        for key in 1..=5 {
            map.put(key, key);
        }
        map.remove(3);
        let mut entries = map.entries();
        entries.sort();
        assert_eq!(entries, vec![(1, 1), (2, 2), (4, 4), (5, 5)]);
    }

    #[test]
    fn matches_std_hash_map_under_random_operations() {
        for probing in ALL_PROBINGS {
            let mut state = 7u64;
            let mut next = || {
                state = state
                    .wrapping_mul(6364136223846793005)
                    .wrapping_add(1442695040888963407);
                state >> 33
            };
            let mut map = HashMapOpenAddressing::new(probing);
            let mut oracle = HashMap::new();
            for _ in 0..5000 {
                let operation = next() % 3;
                let key = (next() % 64) as i32 - 32;
                let value = (next() % 1000) as i32;
                match operation {
                    0 => assert_eq!(
                        map.put(key, value),
                        oracle.insert(key, value),
                        "{probing:?}"
                    ),
                    1 => assert_eq!(map.remove(key), oracle.remove(&key), "{probing:?}"),
                    _ => assert_eq!(map.get(key), oracle.get(&key).copied(), "{probing:?}"),
                }
                assert_eq!(map.len(), oracle.len(), "{probing:?}");
            }
        }
    }
}
