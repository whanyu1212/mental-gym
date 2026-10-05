// Dynamic array built from scratch (a tiny `Vec<i32>`).
//
// Layout:
// - `buf`: a fixed-size heap buffer. Its length is the *capacity*.
// - `len`: how many slots at the front of `buf` hold real elements.
// Slots at index >= len are spare room and hold meaningless zeros.
//
// Growth: when `buf` is full, allocate a buffer twice as large, copy the old
// elements over, and drop the old buffer. The copy costs O(n), but it happens
// only after capacity doubles, so the cost averages out:
//   pushing n items copies at most 1 + 2 + 4 + ... + n/2 < n elements in total,
//   which makes `push` amortized O(1).
//
// Rust note: `Box<[i32]>` is an owned slice that cannot change size, so it
// behaves like a C array. Growing means building a new `Box`.

#[derive(Debug)]
pub struct DynamicArray {
    buf: Box<[i32]>,
    len: usize,
}

impl DynamicArray {
    const INITIAL_CAPACITY: usize = 4;

    /// Creates an empty array with no allocation.
    pub fn new() -> Self {
        Self::with_capacity(0)
    }

    /// Creates an empty array with room for `capacity` elements.
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            buf: vec![0; capacity].into_boxed_slice(),
            len: 0,
        }
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn capacity(&self) -> usize {
        self.buf.len()
    }

    /// Returns the element at `index`, or `None` if it is out of bounds.
    pub fn get(&self, index: usize) -> Option<i32> {
        if index < self.len {
            Some(self.buf[index])
        } else {
            None
        }
    }

    /// Overwrites the element at `index`. Panics if out of bounds.
    pub fn set(&mut self, index: usize, value: i32) {
        assert!(index < self.len, "set index out of bounds");
        self.buf[index] = value;
    }

    /// Appends `value`. Amortized O(1).
    pub fn push(&mut self, value: i32) {
        if self.len == self.capacity() {
            self.grow();
        }
        self.buf[self.len] = value;
        self.len += 1;
    }

    /// Removes and returns the last element, or `None` if empty. O(1).
    pub fn pop(&mut self) -> Option<i32> {
        if self.len == 0 {
            return None;
        }
        self.len -= 1;
        // No need to clear the slot: anything at index >= len is ignored.
        Some(self.buf[self.len])
    }

    /// Inserts `value` at `index`, shifting later elements right. O(n).
    pub fn insert(&mut self, index: usize, value: i32) {
        assert!(index <= self.len, "insertion index out of bounds");
        if self.len == self.capacity() {
            self.grow();
        }
        for i in (index..self.len).rev() {
            self.buf[i + 1] = self.buf[i];
        }
        self.buf[index] = value;
        self.len += 1;
    }

    /// Removes and returns the element at `index`, shifting later elements left. O(n).
    pub fn remove(&mut self, index: usize) -> i32 {
        assert!(index < self.len, "removal index out of bounds");
        let removed = self.buf[index];
        for i in index..self.len - 1 {
            self.buf[i] = self.buf[i + 1];
        }
        self.len -= 1;
        removed
    }

    /// Releases spare capacity so that capacity == len.
    pub fn shrink_to_fit(&mut self) {
        if self.capacity() > self.len {
            self.reallocate(self.len);
        }
    }

    /// Borrows the live elements as a read-only slice.
    pub fn as_slice(&self) -> &[i32] {
        &self.buf[..self.len]
    }

    fn grow(&mut self) {
        let new_capacity = if self.capacity() == 0 {
            Self::INITIAL_CAPACITY
        } else {
            self.capacity() * 2
        };
        self.reallocate(new_capacity);
    }

    /// Moves the live elements into a new buffer of exactly `new_capacity`.
    fn reallocate(&mut self, new_capacity: usize) {
        debug_assert!(new_capacity >= self.len);
        let mut new_buf = vec![0; new_capacity].into_boxed_slice();
        new_buf[..self.len].copy_from_slice(&self.buf[..self.len]);
        self.buf = new_buf;
    }
}

impl Default for DynamicArray {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::DynamicArray;

    #[test]
    fn new_array_is_empty_with_no_allocation() {
        let arr = DynamicArray::new();
        assert!(arr.is_empty());
        assert_eq!(arr.capacity(), 0);
    }

    #[test]
    fn push_and_get() {
        let mut arr = DynamicArray::new();
        arr.push(10);
        arr.push(20);
        assert_eq!(arr.len(), 2);
        assert_eq!(arr.get(0), Some(10));
        assert_eq!(arr.get(1), Some(20));
        assert_eq!(arr.get(2), None);
    }

    #[test]
    fn capacity_doubles_when_full() {
        let mut arr = DynamicArray::new();
        let mut capacities = Vec::new();
        for i in 0..9 {
            arr.push(i);
            if capacities.last() != Some(&arr.capacity()) {
                capacities.push(arr.capacity());
            }
        }
        assert_eq!(capacities, vec![4, 8, 16]);
    }

    #[test]
    fn growth_preserves_elements() {
        let mut arr = DynamicArray::new();
        for i in 0..100 {
            arr.push(i);
        }
        let expected: Vec<i32> = (0..100).collect();
        assert_eq!(arr.as_slice(), expected.as_slice());
    }

    #[test]
    fn pop_returns_last_then_none() {
        let mut arr = DynamicArray::new();
        arr.push(1);
        arr.push(2);
        assert_eq!(arr.pop(), Some(2));
        assert_eq!(arr.pop(), Some(1));
        assert_eq!(arr.pop(), None);
    }

    #[test]
    fn pop_does_not_shrink_capacity() {
        let mut arr = DynamicArray::new();
        for i in 0..5 {
            arr.push(i);
        }
        let capacity = arr.capacity();
        arr.pop();
        assert_eq!(arr.capacity(), capacity);
    }

    #[test]
    fn set_overwrites_element() {
        let mut arr = DynamicArray::new();
        arr.push(1);
        arr.set(0, 9);
        assert_eq!(arr.get(0), Some(9));
    }

    #[test]
    #[should_panic(expected = "set index out of bounds")]
    fn set_past_len_panics() {
        let mut arr = DynamicArray::with_capacity(4);
        arr.set(0, 1);
    }

    #[test]
    fn insert_in_middle_shifts_right() {
        let mut arr = DynamicArray::new();
        for n in [1, 2, 4] {
            arr.push(n);
        }
        arr.insert(2, 3);
        assert_eq!(arr.as_slice(), &[1, 2, 3, 4]);
    }

    #[test]
    fn insert_into_full_buffer_grows() {
        let mut arr = DynamicArray::new();
        for n in 0..4 {
            arr.push(n);
        }
        assert_eq!(arr.capacity(), 4);
        arr.insert(0, 99);
        assert_eq!(arr.capacity(), 8);
        assert_eq!(arr.as_slice(), &[99, 0, 1, 2, 3]);
    }

    #[test]
    fn insert_at_end_and_into_empty() {
        let mut arr = DynamicArray::new();
        arr.insert(0, 1);
        arr.insert(1, 2);
        assert_eq!(arr.as_slice(), &[1, 2]);
    }

    #[test]
    #[should_panic(expected = "insertion index out of bounds")]
    fn insert_past_end_panics() {
        let mut arr = DynamicArray::new();
        arr.insert(1, 5);
    }

    #[test]
    fn remove_shifts_left_and_returns_value() {
        let mut arr = DynamicArray::new();
        for n in [1, 2, 3, 4] {
            arr.push(n);
        }
        assert_eq!(arr.remove(1), 2);
        assert_eq!(arr.as_slice(), &[1, 3, 4]);
    }

    #[test]
    fn remove_last_element() {
        let mut arr = DynamicArray::new();
        arr.push(7);
        assert_eq!(arr.remove(0), 7);
        assert!(arr.is_empty());
    }

    #[test]
    #[should_panic(expected = "removal index out of bounds")]
    fn remove_from_empty_panics() {
        let mut arr = DynamicArray::new();
        arr.remove(0);
    }

    #[test]
    fn shrink_to_fit_matches_len() {
        let mut arr = DynamicArray::new();
        for n in 0..5 {
            arr.push(n);
        }
        assert_eq!(arr.capacity(), 8);
        arr.shrink_to_fit();
        assert_eq!(arr.capacity(), 5);
        assert_eq!(arr.as_slice(), &[0, 1, 2, 3, 4]);
    }

    #[test]
    fn push_after_shrink_to_zero_capacity_regrows() {
        let mut arr = DynamicArray::new();
        arr.push(1);
        arr.pop();
        arr.shrink_to_fit();
        assert_eq!(arr.capacity(), 0);
        arr.push(2);
        assert_eq!(arr.as_slice(), &[2]);
    }
}
