// Stack on a fixed-capacity array.
//
// `top` is both the number of elements and the index where the next push goes.
// push/pop/peek are all O(1) because only the end of the array is touched.
// This stack never grows; `push` hands the value back when it is full. To get
// a growable stack, back it with `DynamicArray` instead.

#[derive(Debug)]
pub struct ArrayStack {
    buf: Box<[i32]>,
    top: usize,
}

impl ArrayStack {
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            buf: vec![0; capacity].into_boxed_slice(),
            top: 0,
        }
    }

    pub fn len(&self) -> usize {
        self.top
    }

    pub fn is_empty(&self) -> bool {
        self.top == 0
    }

    pub fn is_full(&self) -> bool {
        self.top == self.buf.len()
    }

    /// Pushes `value`, or returns it in `Err` if the stack is full.
    pub fn push(&mut self, value: i32) -> Result<(), i32> {
        if self.is_full() {
            return Err(value);
        }
        self.buf[self.top] = value;
        self.top += 1;
        Ok(())
    }

    pub fn pop(&mut self) -> Option<i32> {
        if self.is_empty() {
            return None;
        }
        self.top -= 1;
        Some(self.buf[self.top])
    }

    pub fn peek(&self) -> Option<i32> {
        if self.is_empty() {
            None
        } else {
            Some(self.buf[self.top - 1])
        }
    }
}

#[cfg(test)]
mod tests {
    use super::ArrayStack;

    #[test]
    fn pops_in_reverse_order() {
        let mut stack = ArrayStack::with_capacity(3);
        for n in [1, 2, 3] {
            stack.push(n).unwrap();
        }
        assert_eq!(stack.pop(), Some(3));
        assert_eq!(stack.pop(), Some(2));
        assert_eq!(stack.pop(), Some(1));
        assert_eq!(stack.pop(), None);
    }

    #[test]
    fn peek_does_not_remove() {
        let mut stack = ArrayStack::with_capacity(2);
        stack.push(5).unwrap();
        assert_eq!(stack.peek(), Some(5));
        assert_eq!(stack.len(), 1);
    }

    #[test]
    fn peek_on_empty_is_none() {
        assert_eq!(ArrayStack::with_capacity(2).peek(), None);
    }

    #[test]
    fn push_on_full_returns_value() {
        let mut stack = ArrayStack::with_capacity(1);
        assert_eq!(stack.push(1), Ok(()));
        assert!(stack.is_full());
        assert_eq!(stack.push(2), Err(2));
    }

    #[test]
    fn zero_capacity_is_always_full_and_empty() {
        let mut stack = ArrayStack::with_capacity(0);
        assert!(stack.is_empty() && stack.is_full());
        assert_eq!(stack.push(1), Err(1));
        assert_eq!(stack.pop(), None);
    }

    #[test]
    fn slot_is_reusable_after_pop() {
        let mut stack = ArrayStack::with_capacity(1);
        stack.push(1).unwrap();
        stack.pop();
        stack.push(2).unwrap();
        assert_eq!(stack.peek(), Some(2));
    }
}
