use std::collections::HashMap;

pub struct Solution;

impl Solution {
    /// Find two indices in nums such that they add up to target.
    ///
    /// Uses a HashMap to track seen values and their indices for O(n) time complexity.
    ///
    /// # Arguments
    /// * `nums` - Vector of integers
    /// * `target` - Target sum
    ///
    /// # Returns
    /// Vector containing two indices [i, j] where nums[i] + nums[j] == target.
    /// Returns empty vector if no solution exists.
    ///
    /// # Examples
    /// ```
    /// use leetcode_rust::arrays_hashing::two_sum::Solution;
    ///
    /// let result = Solution::two_sum(vec![2, 7, 11, 15], 9);
    /// assert_eq!(result, vec![0, 1]);
    /// ```
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<usize> {
        let mut seen: HashMap<i32, usize> = HashMap::new();

        for (i, &num) in nums.iter().enumerate() {
            let difference = target - num;

            if let Some(&j) = seen.get(&difference) {
                return vec![j, i];
            }

            seen.insert(num, i);
        }

        vec![]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_case() {
        assert_eq!(Solution::two_sum(vec![2, 7, 11, 15], 9), vec![0, 1]);
    }

    #[test]
    fn test_middle_indices() {
        assert_eq!(Solution::two_sum(vec![3, 2, 4], 6), vec![1, 2]);
    }

    #[test]
    fn test_duplicate_values() {
        assert_eq!(Solution::two_sum(vec![3, 3], 6), vec![0, 1]);
    }

    #[test]
    fn test_larger_array() {
        assert_eq!(Solution::two_sum(vec![1, 2, 3, 4, 5], 9), vec![3, 4]);
    }

    #[test]
    fn test_no_solution() {
        assert_eq!(Solution::two_sum(vec![1, 2, 3], 10), vec![]);
    }

    #[test]
    fn test_negative_numbers() {
        assert_eq!(Solution::two_sum(vec![-1, -2, -3, -4, -5], -8), vec![2, 4]);
    }
}
