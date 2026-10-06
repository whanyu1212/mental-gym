// Classic in-place array algorithms, written from scratch.
// These work on the array itself (not on a problem's wording), which is why
// they live here and not in the leetcode crate.

/// Reverses `nums` in place with two converging indexes. O(n) time, O(1) space.
pub fn reverse(nums: &mut [i32]) {
    if nums.is_empty() {
        return;
    }
    let mut left = 0;
    let mut right = nums.len() - 1;
    while left < right {
        nums.swap(left, right);
        left += 1;
        right -= 1;
    }
}

/// Rotates right by `k`: the last `k` elements move to the front.
/// Three-reversal trick: reverse all, then reverse the first k, then the rest.
///   [1 2 3 4 5], k=2 -> [5 4 3 2 1] -> [4 5 | 3 2 1] -> [4 5 1 2 3]
/// O(n) time, O(1) space.
pub fn rotate_right(nums: &mut [i32], k: usize) {
    if nums.is_empty() {
        return;
    }
    let k = k % nums.len();
    reverse(nums);
    reverse(&mut nums[..k]);
    reverse(&mut nums[k..]);
}

/// Rotates left by `k`: the first `k` elements move to the back.
pub fn rotate_left(nums: &mut [i32], k: usize) {
    if nums.is_empty() {
        return;
    }
    let k = k % nums.len();
    rotate_right(nums, nums.len() - k);
}

/// Merges two sorted slices into one sorted Vec with two pointers. O(n + m).
/// Uses `<=` on ties, taking from `a` first, so the merge is stable.
pub fn merge_sorted(a: &[i32], b: &[i32]) -> Vec<i32> {
    let mut merged = Vec::with_capacity(a.len() + b.len());
    let (mut i, mut j) = (0, 0);
    while i < a.len() && j < b.len() {
        if a[i] <= b[j] {
            merged.push(a[i]);
            i += 1;
        } else {
            merged.push(b[j]);
            j += 1;
        }
    }
    merged.extend_from_slice(&a[i..]);
    merged.extend_from_slice(&b[j..]);
    merged
}

/// Index of the first element >= `target` in a sorted slice, or `nums.len()`
/// if every element is smaller. This is the insertion point that keeps order.
/// Search window is half-open [lo, hi), which avoids usize underflow at 0.
pub fn lower_bound(nums: &[i32], target: i32) -> usize {
    let (mut lo, mut hi) = (0, nums.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2; // avoids overflow of lo + hi
        if nums[mid] < target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

/// Index of the first element > `target` in a sorted slice, or `nums.len()`.
pub fn upper_bound(nums: &[i32], target: i32) -> usize {
    let (mut lo, mut hi) = (0, nums.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if nums[mid] <= target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

/// Finds the index of `target` in a sorted slice, or `None`.
/// With duplicates this returns the leftmost match. O(log n).
pub fn binary_search(nums: &[i32], target: i32) -> Option<usize> {
    let index = lower_bound(nums, target);
    if index < nums.len() && nums[index] == target {
        Some(index)
    } else {
        None
    }
}

/// Dutch national flag partition around `pivot`, in one pass and in place.
/// Afterwards: [ < pivot | == pivot | > pivot ].
/// Returns (lt_end, gt_start): the `== pivot` block is nums[lt_end..gt_start].
///
/// Invariants while running:
///   nums[..low]      < pivot
///   nums[low..mid]   == pivot
///   nums[mid..high]  unknown (still to inspect)
///   nums[high..]     > pivot
pub fn partition_three_way(nums: &mut [i32], pivot: i32) -> (usize, usize) {
    let (mut low, mut mid, mut high) = (0, 0, nums.len());
    while mid < high {
        if nums[mid] < pivot {
            nums.swap(low, mid);
            low += 1;
            mid += 1;
        } else if nums[mid] > pivot {
            high -= 1;
            nums.swap(mid, high);
            // Do not advance mid: the swapped-in value is not inspected yet.
        } else {
            mid += 1;
        }
    }
    (low, high)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reverse_handles_even_odd_and_tiny_inputs() {
        let mut even = [1, 2, 3, 4];
        reverse(&mut even);
        assert_eq!(even, [4, 3, 2, 1]);

        let mut odd = [1, 2, 3];
        reverse(&mut odd);
        assert_eq!(odd, [3, 2, 1]);

        let mut single = [7];
        reverse(&mut single);
        assert_eq!(single, [7]);

        let mut empty: [i32; 0] = [];
        reverse(&mut empty);
    }

    #[test]
    fn rotate_right_moves_tail_to_front() {
        let mut nums = [1, 2, 3, 4, 5];
        rotate_right(&mut nums, 2);
        assert_eq!(nums, [4, 5, 1, 2, 3]);
    }

    #[test]
    fn rotate_left_moves_head_to_back() {
        let mut nums = [1, 2, 3, 4, 5];
        rotate_left(&mut nums, 2);
        assert_eq!(nums, [3, 4, 5, 1, 2]);
    }

    #[test]
    fn rotate_by_zero_or_multiple_of_len_is_noop() {
        let mut nums = [1, 2, 3];
        rotate_right(&mut nums, 0);
        assert_eq!(nums, [1, 2, 3]);
        rotate_right(&mut nums, 6);
        assert_eq!(nums, [1, 2, 3]);
        rotate_left(&mut nums, 3);
        assert_eq!(nums, [1, 2, 3]);
    }

    #[test]
    fn rotate_larger_than_len_wraps() {
        let mut nums = [1, 2, 3, 4];
        rotate_right(&mut nums, 5); // same as 1
        assert_eq!(nums, [4, 1, 2, 3]);
    }

    #[test]
    fn rotate_empty_does_not_panic() {
        let mut empty: [i32; 0] = [];
        rotate_right(&mut empty, 3);
        rotate_left(&mut empty, 3);
    }

    #[test]
    fn rotate_left_undoes_rotate_right() {
        let original = [1, 2, 3, 4, 5, 6];
        let mut nums = original;
        rotate_right(&mut nums, 4);
        rotate_left(&mut nums, 4);
        assert_eq!(nums, original);
    }

    #[test]
    fn merge_interleaves_sorted_inputs() {
        assert_eq!(merge_sorted(&[1, 3, 5], &[2, 4, 6]), vec![1, 2, 3, 4, 5, 6]);
    }

    #[test]
    fn merge_handles_empty_uneven_and_duplicate_inputs() {
        assert_eq!(merge_sorted(&[], &[1, 2]), vec![1, 2]);
        assert_eq!(merge_sorted(&[1, 2], &[]), vec![1, 2]);
        assert_eq!(merge_sorted(&[], &[]), Vec::<i32>::new());
        assert_eq!(merge_sorted(&[1, 1, 5], &[1, 2]), vec![1, 1, 1, 2, 5]);
        assert_eq!(merge_sorted(&[1], &[2, 3, 4, 5]), vec![1, 2, 3, 4, 5]);
    }

    #[test]
    fn lower_and_upper_bound_with_duplicates() {
        let nums = [1, 2, 2, 2, 5];
        assert_eq!(lower_bound(&nums, 2), 1);
        assert_eq!(upper_bound(&nums, 2), 4);
    }

    #[test]
    fn bounds_for_missing_and_out_of_range_targets() {
        let nums = [10, 20, 30];
        assert_eq!(lower_bound(&nums, 25), 2);
        assert_eq!(upper_bound(&nums, 25), 2);
        assert_eq!(lower_bound(&nums, 0), 0);
        assert_eq!(lower_bound(&nums, 99), 3);
        assert_eq!(upper_bound(&nums, 99), 3);
        assert_eq!(lower_bound(&[], 1), 0);
    }

    #[test]
    fn binary_search_finds_every_element() {
        let nums = [-5, 0, 3, 8, 13, 21];
        for (i, &n) in nums.iter().enumerate() {
            assert_eq!(binary_search(&nums, n), Some(i));
        }
    }

    #[test]
    fn binary_search_misses_return_none() {
        let nums = [1, 3, 5];
        assert_eq!(binary_search(&nums, 0), None);
        assert_eq!(binary_search(&nums, 4), None);
        assert_eq!(binary_search(&nums, 6), None);
        assert_eq!(binary_search(&[], 1), None);
    }

    #[test]
    fn binary_search_returns_leftmost_duplicate() {
        assert_eq!(binary_search(&[1, 2, 2, 2, 3], 2), Some(1));
    }

    #[test]
    fn partition_groups_smaller_equal_larger() {
        let mut nums = [2, 0, 1, 2, 1, 0, 1];
        let (lt_end, gt_start) = partition_three_way(&mut nums, 1);
        assert!(nums[..lt_end].iter().all(|&n| n < 1));
        assert!(nums[lt_end..gt_start].iter().all(|&n| n == 1));
        assert!(nums[gt_start..].iter().all(|&n| n > 1));
        assert_eq!((lt_end, gt_start), (2, 5));
    }

    #[test]
    fn partition_edge_cases() {
        let mut empty: [i32; 0] = [];
        assert_eq!(partition_three_way(&mut empty, 1), (0, 0));

        let mut all_equal = [4, 4, 4];
        assert_eq!(partition_three_way(&mut all_equal, 4), (0, 3));

        let mut all_small = [1, 2, 3];
        assert_eq!(partition_three_way(&mut all_small, 10), (3, 3));

        let mut all_large = [7, 8, 9];
        assert_eq!(partition_three_way(&mut all_large, 0), (0, 0));
    }

    #[test]
    fn partition_keeps_the_same_elements() {
        let mut nums = [5, -1, 3, 5, 0, 9, 3];
        let mut expected = nums;
        partition_three_way(&mut nums, 3);
        nums.sort();
        expected.sort();
        assert_eq!(nums, expected);
    }
}
