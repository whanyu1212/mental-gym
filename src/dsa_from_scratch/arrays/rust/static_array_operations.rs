// Layout (example: N = 4, len = 2):
//
//   buf: [ 7 | 3 | 0 | 0 ]
//          ^^^^^   ^^^^^
//          used    spare room (zeros are meaningless filler)
//
// - `buf` is the buffer: the block of memory that holds the elements.
//   Its length is always exactly `N`, so `N` is the maximum number of
//   elements (the capacity). It never grows.
// - `len` is how many slots at the front of `buf` hold real elements.
//   It starts at 0 and moves up to at most `N` as we insert.
// - Slots at index >= `len` are spare room, not elements.
//
// That is why `insert_end` checks `self.len == N`: the buffer is full.
#[derive(Debug)]
pub struct StaticArray<const N: usize> {
    /// The buffer: `N` slots of storage. `N` is the maximum length.
    buf: [i32; N],
    /// How many slots at the front of `buf` are in use (always `<= N`).
    len: usize,
}

// Python equivalent:
//
// class StaticArray:
//     # `impl<const N: usize> StaticArray<N>` has no direct Python counterpart:
//     # Python has no compile-time type parameters. Here `N` is fixed in the
//     # type (`StaticArray<5>` and `StaticArray<6>` are different types). In
//     # Python the capacity is just a runtime value passed to the constructor.
//
//     def __init__(self, n):       # `pub fn new() -> Self`  (N comes from the type)
//         self.n = n               # `N`
//         self.buf = [0] * n       # `buf: [0; N]`  (N zeros, fixed length)
//         self.len = 0             # `len: 0`
//
//     def insert_end(self, value): # `pub fn insert_end(&mut self, value: i32)`
//         if self.len == self.n:   # `if self.len == N`
//             raise IndexError(    # `panic!(...)`; Rust has no try/except, so a
//                 f"cannot insert into a full StaticArray of capacity {self.n}"
//             )                    # panic means "caller broke the contract"
//         self.buf[self.len] = value   # `self.buf[self.len] = value`
//         self.len += 1                # `self.len += 1`
//
// arr = StaticArray(5)             # Rust: let mut arr = StaticArray::<5>::new();
// arr.insert_end(7)                # Rust: arr.insert_end(7);  (needs `mut`)
impl<const N: usize> StaticArray<N> {
    /// Creates an empty array with room for `N` elements.
    pub fn new() -> Self {
        Self {
            buf: [0; N],
            len: 0,
        }
    }

    /// Appends `value` after the last element. Panics if the array is full.
    pub fn insert_end(&mut self, value: i32) {
        if self.len == N {
            panic!("cannot insert into a full StaticArray of capacity {N}");
        }
        self.buf[self.len] = value;
        self.len += 1;
    }

    pub fn remove_end(&mut self) {
        if self.len == 0 {
            panic!("cannot remove from an empty StaticArray");
        }
        self.len -= 1;
        self.buf[self.len] = 0;
    }

    /// Inserts `value` at `index`, shifting later elements one slot right.
    /// Panics if the array is full or `index > len`.
    /// `index == len` is allowed and behaves like `insert_end`.
    ///
    /// Cost: O(n), because up to `len` elements move.
    ///
    /// Example (N = 5): buf = [7, 3, 9, 0, 0], len = 3, insert_middle(1, 5)
    ///   shift right, starting from the back:
    ///     buf[3] = buf[2]  -> [7, 3, 9, 9, 0]
    ///     buf[2] = buf[1]  -> [7, 3, 3, 9, 0]
    ///   then write the new value into the gap:
    ///     buf[1] = 5       -> [7, 5, 3, 9, 0], len = 4
    pub fn insert_middle(&mut self, index: usize, value: i32) {
        if self.len == N {
            panic!("cannot insert into a full StaticArray of capacity {N}");
        }
        if index > self.len {
            panic!("index {index} is out of bounds for length {}", self.len);
        }

        // Walk from the back so each element is copied before it is overwritten.
        // `j` is the destination slot; `j - 1` is its source. Stop at `index`.
        let mut j = self.len;
        while j > index {
            self.buf[j] = self.buf[j - 1];
            j -= 1;
        }

        self.buf[index] = value;
        self.len += 1;
    }
}
