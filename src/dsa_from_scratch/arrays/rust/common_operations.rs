// Rust collection reminder:
// - Vec<i32>: owns a growable collection; supports push/pop/insert/remove.
// - [i32; N]: owns a fixed-size array with N elements.
// - [i32]: a slice type whose length is not part of its type; normally borrowed.
// - &[i32]: a read-only borrowed view of some or all elements of a Vec or array.
// - &mut [i32]: a borrowed view that can change elements, but not the length.
// - &mut Vec<i32>: borrows the vector itself; can change elements AND length.
// Borrowing does not copy the collection or transfer ownership from the caller.
// Example: &nums[1..3] views elements at indexes 1 and 2 without copying them.
// Here, random_access/traverse use &[i32] because they only read elements;
// insert/remove use &mut Vec<i32> because they change the vector's length.

/// This function initializes an array of a given length with all elements set to zero.
/// # Arguments
/// * `length` - The length of the array to be initialized.
/// # Returns
/// A vector of integers with the specified length, all initialized to zero.
///
fn initialize_array(length: usize) -> Vec<i32> {
    vec![0; length]
}

// every element can either be None or Some(i32)
// fn initialize_option_array(length: usize) -> Vec<Option<i32>> {
//     vec![None; length]
// }

/// This function performs a random access operation on an array of integers.
/// # Arguments
/// * `nums` - A slice of integers representing the array.
/// # Returns
/// An `Option<i32>` which is `Some(value)` if the random access was successful, or `None` if the array is empty.
///
fn random_access(nums: &[i32]) -> Option<i32> {
    if nums.is_empty() {
        return None;
    }

    let index = rand::random_range(0..nums.len());
    nums.get(index).copied()
}

/// Inserts a value at the specified index, shifting later elements to the right.
///
/// The vector grows by one element.
///
/// # Arguments
/// * `nums` - The vector to modify.
/// * `value` - The integer to insert.
/// * `index` - The insertion position; may equal the vector's length to append.
///
/// # Panics
/// Panics if `index` is greater than the vector's length.
fn insert(nums: &mut Vec<i32>, value: i32, index: usize) {
    let original_len = nums.len();
    assert!(index <= original_len, "insertion index out of bounds");

    // Create an extra element before shifting into it.
    nums.push(0);
    for i in (index..original_len).rev() {
        nums[i + 1] = nums[i];
    }
    nums[index] = value;
}

/// Removes the element at the specified index, shifting later elements to the left.
///
/// The vector shrinks by one element.
///
/// # Arguments
/// * `nums` - The vector to modify.
/// * `index` - The index of the element to remove.
///
/// # Panics
/// Panics if `index` is outside the vector, including when the vector is empty.
fn remove(nums: &mut Vec<i32>, index: usize) {
    let original_len = nums.len();
    assert!(index < original_len, "removal index out of bounds");

    for i in index..original_len - 1 {
        nums[i] = nums[i + 1];
    }
    nums.pop();
}

/// Traverses a borrowed slice and prints each integer on its own line.
///
/// Does not modify the input. An empty slice produces no output.
fn traverse(nums: &[i32]) {
    for num in nums {
        println!("{}", num);
    }
}

/// Finds the first occurrence of a target using a linear search.
///
/// # Arguments
/// * `nums` - The slice to search; it does not need to be sorted.
/// * `target` - The integer to find.
///
/// # Returns
/// `Some(index)` for the first match, or `None` if the target is absent.
///
/// Takes O(n) time in the worst case and O(1) extra space.
fn find(nums: &[i32], target: i32) -> Option<usize> {
    for (index, &num) in nums.iter().enumerate() {
        if num == target {
            return Some(index);
        }
    }
    None
}

/// Creates a new vector containing the input followed by additional zeros.
///
/// # Arguments
/// * `nums` - The slice to copy; the original collection is not modified.
/// * `enlarge` - The number of zero-filled elements to append.
///
/// # Returns
/// A new vector of length `nums.len() + enlarge`.
///
/// Takes O(n + enlarge) time and space, where n is the input length.
fn extend(nums: &[i32], enlarge: usize) -> Vec<i32> {
    let mut result = nums.to_vec();
    result.resize(nums.len() + enlarge, 0);
    result
}

#[cfg(test)]
mod tests {
    use super::{extend, find, insert, random_access};

    #[test]
    fn find_returns_matching_index() {
        assert_eq!(find(&[10, 20, 30], 20), Some(1));
    }

    #[test]
    fn find_returns_first_duplicate() {
        assert_eq!(find(&[10, 20, 10], 10), Some(0));
    }

    #[test]
    fn find_missing_target_returns_none() {
        assert_eq!(find(&[10, 20, 30], 99), None);
    }

    #[test]
    fn find_in_empty_slice_returns_none() {
        assert_eq!(find(&[], 10), None);
    }

    #[test]
    fn extend_appends_zeros_without_changing_input() {
        let nums = vec![10, -20, 0];
        let result = extend(&nums, 2);
        assert_eq!(result, vec![10, -20, 0, 0, 0]);
        assert_eq!(nums, vec![10, -20, 0]);
    }

    #[test]
    fn extend_by_zero_copies_input() {
        let nums = vec![10, 20];
        let mut result = extend(&nums, 0);
        assert_eq!(result, nums);
        result[0] = 99;
        assert_eq!(nums, vec![10, 20]);
    }

    #[test]
    fn extend_empty_slice_creates_zeros() {
        assert_eq!(extend(&[], 3), vec![0, 0, 0]);
    }

    #[test]
    fn extend_empty_slice_by_zero_stays_empty() {
        assert_eq!(extend(&[], 0), Vec::<i32>::new());
    }

    #[test]
    fn insert_in_middle() {
        let mut nums = vec![10, 20, 30];
        insert(&mut nums, 99, 1);
        assert_eq!(nums, vec![10, 99, 20, 30]);
    }

    #[test]
    fn insert_at_beginning() {
        let mut nums = vec![10, 20, 30];
        insert(&mut nums, 99, 0);
        assert_eq!(nums, vec![99, 10, 20, 30]);
    }

    #[test]
    fn insert_at_end() {
        let mut nums = vec![10, 20, 30];
        let index = nums.len();
        insert(&mut nums, 99, index);
        assert_eq!(nums, vec![10, 20, 30, 99]);
    }

    #[test]
    fn insert_into_empty_vector() {
        let mut nums = vec![];
        insert(&mut nums, 99, 0);
        assert_eq!(nums, vec![99]);
    }

    #[test]
    #[should_panic(expected = "insertion index out of bounds")]
    fn insert_past_end_panics() {
        let mut nums = vec![10, 20, 30];
        insert(&mut nums, 99, 4);
    }

    #[test]
    fn empty_slice_returns_none() {
        assert_eq!(random_access(&[]), None);
    }

    #[test]
    fn single_element_returns_that_value() {
        assert_eq!(random_access(&[42]), Some(42));
    }

    #[test]
    fn returned_value_belongs_to_input() {
        let nums = [10, 20, 30];
        for _ in 0..100 {
            let value = random_access(&nums).expect("input is non-empty");
            assert!(nums.contains(&value));
        }
    }

    #[test]
    fn returned_value_is_within_bounds() {
        let nums = [1, 2, 3, 4, 5];

        for _ in 0..100 {
            let value = random_access(&nums).expect("input is non-empty");
            assert!(value >= 1 && value <= 5);
        }
    }
}
