/**
 * Check whether nums has two equal values within index distance k.
 *
 * Membership in `window` is exactly "have I seen this value within the
 * last k positions", so a hit on nums[right] is a valid answer.
 */
function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const window = new Set<number>();
  let left = 0;

  for (let right = 0; right < nums.length; right++) {
    // Window grew to k+2 values: evict the old left bound FIRST.
    // Incrementing left before delete() evicts the wrong element and
    // leaves a stale value in the set — false positives on pairs
    // farther apart than k.
    if (right - left > k) {
      window.delete(nums[left]);
      left += 1;
    }

    if (window.has(nums[right])) {
      return true;
    }

    window.add(nums[right]);
  }

  return false;
}

if (import.meta.main) {
  // Expected: true  (nums[0] == nums[3] == 1, |0 - 3| = 3 <= k)
  console.log(containsNearbyDuplicate([1, 2, 3, 1], 3));

  // Expected: true  (nums[2] == nums[3] == 1, |2 - 3| = 1 <= k)
  console.log(containsNearbyDuplicate([1, 0, 1, 1], 1));

  // Expected: false (only matching pair is farther apart than k)
  console.log(containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2));

  // Expected: false (no duplicates at all)
  console.log(containsNearbyDuplicate([1, 2, 3, 4], 2));

  // Expected: false (k = 0 means indices must be identical)
  console.log(containsNearbyDuplicate([1, 1], 0));

  // Expected: false (empty input)
  console.log(containsNearbyDuplicate([], 1));
}
