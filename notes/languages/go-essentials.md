---
title: Go Essentials
slug: go-essentials
description: How Go slices and maps with empty struct values correspond to Python lists and sets.
category: Languages
status: stable
kind: concept
tags:
  - go
  - foundations
relatedExercises:
  - domain: algorithm
    slug: 217-contains-duplicate
---

# Go Essentials

Contains Duplicate uses two everyday Go types. A slice holds the input numbers,
and a map keeps track of the distinct numbers.

## Slices and Python lists

`[]int` means a slice of integers. Like a Python list, a slice is ordered and
mutable. You can read `nums[0]`, count elements with `len(nums)`, and loop over
it with `range`. Go enforces the element type.

```go
nums := []int{1, 2, 3}
firstTwo := nums[:2]
firstTwo[0] = 99
fmt.Println(nums) // [99 2 3]
```

`nums` and `firstTwo` share the same underlying array, so changing an element
through either slice is visible through the other wherever they overlap. Taking
`nums[:2]` from a Python list creates a new list, so assigning to an element of
the new list leaves the original list alone.

## Empty structs as set values

A Go map pairs each key with a value of its declared type. A map like
`map[string]int` can store scores by name. For a set of integers, membership is
all we need to track, so `map[int]struct{}` uses the numbers as keys and stores
an empty struct as each value.

Read `struct{}{}` as `struct{}` + `{}`. `struct{}` is the type with zero fields.
The final `{}` creates a value of that type. Think of Python's `seen[7] = None`
when the only question you ask is `7 in seen`.

```go
unique := make(map[int]struct{})
unique[7] = struct{}{}
unique[7] = struct{}{}
_, exists := unique[7]
fmt.Println(len(unique), exists) // 1 true
```

Each key occupies one entry, so adding `7` twice keeps the map length at one.
The `_` discards the placeholder value and `exists` tells you whether the key
is present. Once the map has a key for every number in `nums`, the Go comparison
`len(nums) != len(unique)` answers the same question as Python's
`len(nums) != len(set(nums))`.
