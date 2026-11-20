package arrayshashing

import "testing"

func TestContainsDuplicate(t *testing.T) {
	cases := []struct {
		name string
		nums []int
		want bool
	}{
		{name: "repeated number", nums: []int{1, 2, 3, 1}, want: true},
		{name: "distinct numbers", nums: []int{1, 2, 3, 4}, want: false},
		{name: "empty input", nums: []int{}, want: false},
		{name: "single number", nums: []int{7}, want: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := containsDuplicate(tc.nums); got != tc.want {
				t.Errorf("containsDuplicate(%v) = %t, want %t", tc.nums, got, tc.want)
			}
		})
	}
}
