#include <iostream>
#include <vector>

// =============================================================================
// SPACE COMPLEXITY EXAMPLES
// =============================================================================
//
// KEY CONCEPTS:
//
// 1. SPACE COMPLEXITY - measures memory usage as a function of input size (n)
//    - We focus on AUXILIARY space (extra space beyond the input itself)
//    - Common complexities: O(1) < O(log n) < O(n) < O(n^2)
//
// 2. WHAT COUNTS AS SPACE:
//    - Variables and data structures you create
//    - Recursion stack frames (each call uses memory!)
//    - NOT the input itself (unless you modify it in-place)
//
// 3. MEMORY ADDRESSES & ARRAYS:
//    - &arr[i]      : Get address of element at index i
//    - ptr + i      : Pointer arithmetic (moves by sizeof(element) bytes)
//    - sizeof(T)    : Size of type T in bytes (int = 4 bytes typically)
//
// 4. WHY ARRAYS ENABLE O(1) ACCESS:
//    - Arrays are CONTIGUOUS: elements stored side-by-side in memory
//    - Address formula: base_address + (index * sizeof(element))
//    - No traversal needed - just calculate the address directly!
//
// 5. RECURSION SPACE:
//    - Each recursive call adds a stack frame
//    - Linear recursion (factorial): O(n) space
//    - Divide-and-conquer (binary search): O(log n) space
//
// =============================================================================

// -----------------------------------------------------------------------------
// O(1) - Constant Space
// -----------------------------------------------------------------------------
// Uses fixed amount of memory regardless of input size.
int sumArray(const std::vector<int> &arr)
{
    int sum = 0; // Only one variable, no matter how large arr is
    for (int num : arr)
    {
        sum += num;
    }
    return sum;
}

// -----------------------------------------------------------------------------
// O(n) - Linear Space
// -----------------------------------------------------------------------------
// Memory grows proportionally with input size.
std::vector<int> copyArray(const std::vector<int> &arr)
{
    std::vector<int> copy(arr.size()); // New array of same size as input
    for (size_t i = 0; i < arr.size(); i++)
    {
        copy[i] = arr[i];
    }
    return copy;
}

// Another O(n) example: recursion with n stack frames
int factorial(int n)
{
    if (n <= 1)
        return 1;
    return n * factorial(n - 1); // Each call adds a stack frame
    // Stack: factorial(5) -> factorial(4) -> factorial(3) -> factorial(2) -> factorial(1)
    // That's n stack frames = O(n) space
}

// -----------------------------------------------------------------------------
// O(n^2) - Quadratic Space
// -----------------------------------------------------------------------------
// Memory grows with square of input size.
std::vector<std::vector<int>> createMatrix(int n)
{
    // Creates n x n matrix = n^2 elements
    std::vector<std::vector<int>> matrix(n, std::vector<int>(n, 0));
    return matrix;
}

// -----------------------------------------------------------------------------
// O(log n) - Logarithmic Space
// -----------------------------------------------------------------------------
// Common in divide-and-conquer with tail recursion optimization,
// or iterative binary search.
int binarySearch(const std::vector<int> &arr, int target)
{
    int left = 0, right = arr.size() - 1; // Only a few variables
    while (left <= right)
    {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1; // O(1) space - iterative version
}

// Recursive binary search: O(log n) space due to stack frames
int binarySearchRecursive(const std::vector<int> &arr, int target, int left, int right)
{
    if (left > right)
        return -1;
    int mid = left + (right - left) / 2;
    if (arr[mid] == target)
        return mid;
    if (arr[mid] < target)
        return binarySearchRecursive(arr, target, mid + 1, right);
    return binarySearchRecursive(arr, target, left, mid - 1);
    // Each recursive call halves the search space -> log(n) stack frames
}

// -----------------------------------------------------------------------------
// DEMONSTRATION
// -----------------------------------------------------------------------------
int main()
{
    std::cout << "=== Space Complexity Examples ===\n\n";

    std::vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    // O(1) Space - Constant
    std::cout << "O(1) - Sum of array: " << sumArray(arr) << "\n";
    std::cout << "       Uses only one 'sum' variable regardless of array size.\n\n";

    // O(n) Space - Linear
    std::vector<int> copied = copyArray(arr);
    std::cout << "O(n) - Copied array size: " << copied.size() << "\n";
    std::cout << "       Created new array of same size as input.\n\n";

    // O(n) Space - Recursion
    std::cout << "O(n) - Factorial(5): " << factorial(5) << "\n";
    std::cout << "       Uses 5 stack frames for recursion depth.\n\n";

    // O(n^2) Space - Quadratic
    int n = 4;
    auto matrix = createMatrix(n);
    std::cout << "O(n^2) - Matrix " << n << "x" << n << " = " << n * n << " elements\n";
    std::cout << "         Memory grows quadratically with n.\n\n";

    // O(1) vs O(log n) Space - Binary Search
    std::vector<int> sorted = {1, 3, 5, 7, 9, 11, 13, 15};
    std::cout << "O(1) - Iterative binary search for 7: index "
              << binarySearch(sorted, 7) << "\n";
    std::cout << "O(log n) - Recursive binary search for 7: index "
              << binarySearchRecursive(sorted, 7, 0, sorted.size() - 1) << "\n";
    std::cout << "           Recursive version uses log(n) stack frames.\n\n";

    // -------------------------------------------------------------------------
    // Memory Addresses of Array Elements
    // -------------------------------------------------------------------------
    std::cout << "=== Memory Layout of Array Elements ===\n\n";

    // Using C-style array
    int cArray[5] = {10, 20, 30, 40, 50};
    std::cout << "C-style array (int cArray[5]):\n";
    for (int i = 0; i < 5; i++)
    {
        std::cout << "  cArray[" << i << "] = " << cArray[i]
                  << "  at address: " << &cArray[i] << "\n";
    }
    std::cout << "  Note: Each int is " << sizeof(int) << " bytes apart.\n\n";

    // Using std::vector
    std::cout << "std::vector<int>:\n";
    for (size_t i = 0; i < arr.size(); i++)
    {
        std::cout << "  arr[" << i << "] = " << arr[i]
                  << "  at address: " << &arr[i] << "\n";
    }
    std::cout << "\n";

    // Pointer arithmetic demonstration
    std::cout << "Pointer arithmetic:\n";
    int *ptr = cArray; // Points to first element
    std::cout << "  ptr (base address):     " << ptr << "\n";
    std::cout << "  ptr + 1 (next int):     " << (ptr + 1) << "\n";
    std::cout << "  ptr + 2 (2 ints away):  " << (ptr + 2) << "\n";
    std::cout << "  Difference: " << ((char *)(ptr + 1) - (char *)ptr) << " bytes\n\n";

    // Why this matters for space complexity:
    std::cout << "Why memory layout matters:\n";
    std::cout << "  - Arrays are CONTIGUOUS: elements stored side-by-side\n";
    std::cout << "  - Address of arr[i] = base_address + (i * sizeof(element))\n";
    std::cout << "  - This enables O(1) random access by index!\n\n";

    // Summary
    std::cout << "=== Summary ===\n";
    std::cout << "O(1)     : Fixed variables, in-place algorithms\n";
    std::cout << "O(log n) : Divide-and-conquer recursion\n";
    std::cout << "O(n)     : Arrays/lists proportional to input, linear recursion\n";
    std::cout << "O(n^2)   : 2D matrices, nested data structures\n";

    return 0;
}
