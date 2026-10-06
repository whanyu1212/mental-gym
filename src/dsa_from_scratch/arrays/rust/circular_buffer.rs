// Circular buffer (ring buffer) on a fixed-capacity array.
//
// A plain array-backed queue wastes space: popping from the front leaves
// unused slots at the start, or forces an O(n) shift. A ring buffer instead
// treats the array as a circle and wraps indexes with modulo.
//
//   buf  = [ d  e  _  _  a  b  c ]      capacity = 7
//                      ^head           head = 4, len = 5
//   logical index i lives at physical slot (head + i) % capacity
//   -> a b c (slots 4,5,6) then wraps to d e (slots 0,1)
//
// - `head`: physical index of the logical first element.
// - `len`: number of live elements. Tracking `len` (instead of a tail index)
//   removes the "full vs empty look identical" ambiguity.
// Pushing, popping and peeking at either end, and `get`, are O(1). `to_vec`
// copies every live element into a new Vec, so it is O(n) time and space.
// Operating on both ends makes it a deque; using only push_back + pop_front
// makes it a FIFO queue.

#[derive(Debug)]
pub struct CircularBuffer {
    buf: Box<[i32]>,
    head: usize,
    len: usize,
}

impl CircularBuffer {
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            buf: vec![0; capacity].into_boxed_slice(),
            head: 0,
            len: 0,
        }
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn capacity(&self) -> usize {
        self.buf.len()
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn is_full(&self) -> bool {
        self.len == self.capacity()
    }

    /// Maps a logical index to its physical slot. Caller guarantees capacity > 0.
    fn physical(&self, logical: usize) -> usize {
        (self.head + logical) % self.capacity()
    }

    /// Adds to the back, or returns the value in `Err` if full.
    pub fn push_back(&mut self, value: i32) -> Result<(), i32> {
        if self.is_full() {
            return Err(value);
        }
        let slot = self.physical(self.len);
        self.buf[slot] = value;
        self.len += 1;
        Ok(())
    }

    /// Adds to the front, or returns the value in `Err` if full.
    pub fn push_front(&mut self, value: i32) -> Result<(), i32> {
        if self.is_full() {
            return Err(value);
        }
        // Step back one slot, wrapping below 0 without underflowing usize.
        self.head = (self.head + self.capacity() - 1) % self.capacity();
        self.buf[self.head] = value;
        self.len += 1;
        Ok(())
    }

    pub fn pop_front(&mut self) -> Option<i32> {
        if self.is_empty() {
            return None;
        }
        let value = self.buf[self.head];
        self.head = (self.head + 1) % self.capacity();
        self.len -= 1;
        Some(value)
    }

    pub fn pop_back(&mut self) -> Option<i32> {
        if self.is_empty() {
            return None;
        }
        self.len -= 1;
        Some(self.buf[self.physical(self.len)])
    }

    pub fn front(&self) -> Option<i32> {
        self.get(0)
    }

    pub fn back(&self) -> Option<i32> {
        self.len.checked_sub(1).and_then(|i| self.get(i))
    }

    /// Returns the element at logical `index` (0 = front).
    pub fn get(&self, index: usize) -> Option<i32> {
        if index < self.len {
            Some(self.buf[self.physical(index)])
        } else {
            None
        }
    }

    /// Copies the elements out in logical order (front to back). O(n).
    pub fn to_vec(&self) -> Vec<i32> {
        (0..self.len).map(|i| self.buf[self.physical(i)]).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::CircularBuffer;

    #[test]
    fn behaves_like_a_fifo_queue() {
        let mut ring = CircularBuffer::with_capacity(3);
        for n in [1, 2, 3] {
            ring.push_back(n).unwrap();
        }
        assert_eq!(ring.pop_front(), Some(1));
        assert_eq!(ring.pop_front(), Some(2));
        assert_eq!(ring.pop_front(), Some(3));
        assert_eq!(ring.pop_front(), None);
    }

    #[test]
    fn push_on_full_returns_value() {
        let mut ring = CircularBuffer::with_capacity(2);
        ring.push_back(1).unwrap();
        ring.push_back(2).unwrap();
        assert_eq!(ring.push_back(3), Err(3));
        assert_eq!(ring.push_front(4), Err(4));
    }

    #[test]
    fn wraps_around_and_reuses_freed_slots() {
        let mut ring = CircularBuffer::with_capacity(3);
        for n in [1, 2, 3] {
            ring.push_back(n).unwrap();
        }
        ring.pop_front();
        ring.pop_front();
        ring.push_back(4).unwrap();
        ring.push_back(5).unwrap();
        assert!(ring.is_full());
        assert_eq!(ring.to_vec(), vec![3, 4, 5]);
    }

    #[test]
    fn push_front_wraps_below_zero() {
        let mut ring = CircularBuffer::with_capacity(3);
        ring.push_front(1).unwrap();
        ring.push_front(2).unwrap();
        ring.push_front(3).unwrap();
        assert_eq!(ring.to_vec(), vec![3, 2, 1]);
    }

    #[test]
    fn pop_back_removes_newest() {
        let mut ring = CircularBuffer::with_capacity(3);
        ring.push_back(1).unwrap();
        ring.push_back(2).unwrap();
        assert_eq!(ring.pop_back(), Some(2));
        assert_eq!(ring.pop_back(), Some(1));
        assert_eq!(ring.pop_back(), None);
    }

    #[test]
    fn front_back_and_get() {
        let mut ring = CircularBuffer::with_capacity(4);
        assert_eq!((ring.front(), ring.back()), (None, None));
        for n in [10, 20, 30] {
            ring.push_back(n).unwrap();
        }
        assert_eq!(ring.front(), Some(10));
        assert_eq!(ring.back(), Some(30));
        assert_eq!(ring.get(1), Some(20));
        assert_eq!(ring.get(3), None);
    }

    #[test]
    fn mixed_deque_operations_stay_in_order() {
        let mut ring = CircularBuffer::with_capacity(4);
        ring.push_back(2).unwrap();
        ring.push_back(3).unwrap();
        ring.push_front(1).unwrap();
        ring.push_back(4).unwrap();
        assert_eq!(ring.to_vec(), vec![1, 2, 3, 4]);
        ring.pop_front();
        ring.push_back(5).unwrap();
        assert_eq!(ring.to_vec(), vec![2, 3, 4, 5]);
    }

    #[test]
    fn zero_capacity_never_panics() {
        let mut ring = CircularBuffer::with_capacity(0);
        assert_eq!(ring.push_back(1), Err(1));
        assert_eq!(ring.push_front(1), Err(1));
        assert_eq!(ring.pop_front(), None);
        assert_eq!(ring.pop_back(), None);
        assert_eq!(ring.front(), None);
        assert_eq!(ring.back(), None);
    }

    #[test]
    fn many_cycles_keep_consistent_state() {
        let mut ring = CircularBuffer::with_capacity(3);
        for n in 0..100 {
            ring.push_back(n).unwrap();
            assert_eq!(ring.pop_front(), Some(n));
        }
        assert!(ring.is_empty());
    }
}
