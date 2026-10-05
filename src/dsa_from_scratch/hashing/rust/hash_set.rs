// Hash set: a hash map that keeps only the keys.
//
// Built on `HashMapChaining` with a dummy value of 0, so it inherits average
// O(1) insert / contains / remove. This is the same relationship `std::HashSet<T>`
// has with `std::HashMap<T, ()>`.
//
// A set answers "have I seen this before?" and removes duplicates; it is the
// workhorse behind many array problems (contains-duplicate, intersection, ...).

use super::separate_chaining::HashMapChaining;

#[derive(Debug, Default)]
pub struct HashSet {
    map: HashMapChaining,
}

impl HashSet {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn from_slice(values: &[i32]) -> Self {
        let mut set = Self::new();
        for &value in values {
            set.insert(value);
        }
        set
    }

    pub fn len(&self) -> usize {
        self.map.len()
    }

    pub fn is_empty(&self) -> bool {
        self.map.is_empty()
    }

    /// Adds `value`. Returns `true` if it was not already present.
    pub fn insert(&mut self, value: i32) -> bool {
        self.map.put(value, 0).is_none()
    }

    pub fn contains(&self, value: i32) -> bool {
        self.map.contains_key(value)
    }

    /// Removes `value`. Returns `true` if it was present.
    pub fn remove(&mut self, value: i32) -> bool {
        self.map.remove(value).is_some()
    }

    /// Elements in bucket order (not insertion order).
    pub fn to_vec(&self) -> Vec<i32> {
        self.map.keys()
    }

    /// Elements in `self` or `other`. O(n + m) average.
    pub fn union(&self, other: &HashSet) -> HashSet {
        let mut result = HashSet::new();
        for value in self.to_vec().into_iter().chain(other.to_vec()) {
            result.insert(value);
        }
        result
    }

    /// Elements in both. Iterates the smaller set and probes the larger one.
    pub fn intersection(&self, other: &HashSet) -> HashSet {
        let (small, large) = if self.len() <= other.len() {
            (self, other)
        } else {
            (other, self)
        };
        let mut result = HashSet::new();
        for value in small.to_vec() {
            if large.contains(value) {
                result.insert(value);
            }
        }
        result
    }

    /// Elements in `self` but not in `other`.
    pub fn difference(&self, other: &HashSet) -> HashSet {
        let mut result = HashSet::new();
        for value in self.to_vec() {
            if !other.contains(value) {
                result.insert(value);
            }
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::HashSet;

    fn sorted(set: &HashSet) -> Vec<i32> {
        let mut values = set.to_vec();
        values.sort();
        values
    }

    #[test]
    fn insert_reports_whether_value_was_new() {
        let mut set = HashSet::new();
        assert!(set.insert(5));
        assert!(!set.insert(5));
        assert_eq!(set.len(), 1);
    }

    #[test]
    fn contains_and_remove() {
        let mut set = HashSet::from_slice(&[1, 2, 3]);
        assert!(set.contains(2));
        assert!(set.remove(2));
        assert!(!set.contains(2));
        assert!(!set.remove(2));
        assert_eq!(set.len(), 2);
    }

    #[test]
    fn from_slice_drops_duplicates() {
        let set = HashSet::from_slice(&[3, 1, 3, 2, 1]);
        assert_eq!(sorted(&set), vec![1, 2, 3]);
    }

    #[test]
    fn zero_and_negatives_are_valid_members() {
        let set = HashSet::from_slice(&[0, -1, -2]);
        assert!(set.contains(0) && set.contains(-1) && set.contains(-2));
        assert!(!set.contains(1));
    }

    #[test]
    fn union_intersection_difference() {
        let a = HashSet::from_slice(&[1, 2, 3, 4]);
        let b = HashSet::from_slice(&[3, 4, 5]);
        assert_eq!(sorted(&a.union(&b)), vec![1, 2, 3, 4, 5]);
        assert_eq!(sorted(&a.intersection(&b)), vec![3, 4]);
        assert_eq!(sorted(&b.intersection(&a)), vec![3, 4]);
        assert_eq!(sorted(&a.difference(&b)), vec![1, 2]);
        assert_eq!(sorted(&b.difference(&a)), vec![5]);
    }

    #[test]
    fn set_operations_with_empty_sets() {
        let a = HashSet::from_slice(&[1, 2]);
        let empty = HashSet::new();
        assert_eq!(sorted(&a.union(&empty)), vec![1, 2]);
        assert!(a.intersection(&empty).is_empty());
        assert_eq!(sorted(&a.difference(&empty)), vec![1, 2]);
        assert!(empty.difference(&a).is_empty());
    }

    #[test]
    fn large_set_keeps_every_element() {
        let values: Vec<i32> = (0..1000).collect();
        let set = HashSet::from_slice(&values);
        assert_eq!(set.len(), 1000);
        assert_eq!(sorted(&set), values);
    }
}
