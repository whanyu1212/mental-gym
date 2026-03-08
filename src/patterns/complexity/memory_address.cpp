#include <iostream>
#include <cstdint>

// =============================================================================
// MEMORY ADDRESS CALCULATION IN ARRAYS
// =============================================================================
//
// KEY FORMULA:
//   address(arr[i]) = base_address + (i * sizeof(element))
//
// This is why array access is O(1) - we calculate the address directly!
//
// =============================================================================

// Calculate the memory address of an element at a given index
// Returns the computed address as a uintptr_t (integer type for addresses)
template <typename T>
uintptr_t calculateAddress(const T *baseAddress, size_t index)
{
    // The formula: base + (index * size_of_each_element)
    uintptr_t base = reinterpret_cast<uintptr_t>(baseAddress);
    uintptr_t offset = index * sizeof(T);
    return base + offset;
}

// Verify our calculation matches the actual address
template <typename T>
bool verifyAddress(const T *arr, size_t index)
{
    uintptr_t calculated = calculateAddress(arr, index);
    uintptr_t actual = reinterpret_cast<uintptr_t>(&arr[index]);
    return calculated == actual;
}

// Print detailed breakdown of address calculation
template <typename T>
void explainAddressCalculation(const T *arr, size_t index, const char *typeName)
{
    uintptr_t base = reinterpret_cast<uintptr_t>(arr);
    size_t elementSize = sizeof(T);
    uintptr_t offset = index * elementSize;
    uintptr_t calculated = base + offset;
    uintptr_t actual = reinterpret_cast<uintptr_t>(&arr[index]);

    std::cout << "Calculating address of " << typeName << "[" << index << "]:\n";
    std::cout << "  Base address:      0x" << std::hex << base << std::dec << "\n";
    std::cout << "  Element size:      " << elementSize << " bytes\n";
    std::cout << "  Index:             " << index << "\n";
    std::cout << "  Offset:            " << index << " * " << elementSize << " = " << offset << " bytes\n";
    std::cout << "  Calculated:        0x" << std::hex << calculated << std::dec << "\n";
    std::cout << "  Actual (&arr[i]):  0x" << std::hex << actual << std::dec << "\n";
    std::cout << "  Match:             " << (calculated == actual ? "YES" : "NO") << "\n\n";
}

int main()
{
    std::cout << "=== Memory Address Calculation in Arrays ===\n\n";

    // ---------------------------------------------------------------------
    // Example 1: int array (4 bytes per element typically)
    // ---------------------------------------------------------------------
    int intArr[5] = {10, 20, 30, 40, 50};

    std::cout << "--- int array (sizeof(int) = " << sizeof(int) << " bytes) ---\n\n";
    explainAddressCalculation(intArr, 0, "intArr");
    explainAddressCalculation(intArr, 3, "intArr");

    // ---------------------------------------------------------------------
    // Example 2: char array (1 byte per element)
    // ---------------------------------------------------------------------
    char charArr[5] = {'a', 'b', 'c', 'd', 'e'};

    std::cout << "--- char array (sizeof(char) = " << sizeof(char) << " byte) ---\n\n";
    explainAddressCalculation(charArr, 0, "charArr");
    explainAddressCalculation(charArr, 3, "charArr");

    // ---------------------------------------------------------------------
    // Example 3: double array (8 bytes per element typically)
    // ---------------------------------------------------------------------
    double doubleArr[5] = {1.1, 2.2, 3.3, 4.4, 5.5};

    std::cout << "--- double array (sizeof(double) = " << sizeof(double) << " bytes) ---\n\n";
    explainAddressCalculation(doubleArr, 0, "doubleArr");
    explainAddressCalculation(doubleArr, 3, "doubleArr");

    // ---------------------------------------------------------------------
    // Example 4: Custom struct
    // ---------------------------------------------------------------------
    struct Point
    {
        int x;
        int y;
        int z;
    };

    Point pointArr[3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};

    std::cout << "--- struct Point array (sizeof(Point) = " << sizeof(Point) << " bytes) ---\n\n";
    explainAddressCalculation(pointArr, 0, "pointArr");
    explainAddressCalculation(pointArr, 2, "pointArr");

    // ---------------------------------------------------------------------
    // Verification: Test all indices
    // ---------------------------------------------------------------------
    std::cout << "=== Verification: All calculations match actual addresses ===\n\n";

    bool allMatch = true;
    for (size_t i = 0; i < 5; i++)
    {
        if (!verifyAddress(intArr, i))
            allMatch = false;
        if (!verifyAddress(charArr, i))
            allMatch = false;
        if (!verifyAddress(doubleArr, i))
            allMatch = false;
    }
    for (size_t i = 0; i < 3; i++)
    {
        if (!verifyAddress(pointArr, i))
            allMatch = false;
    }

    std::cout << "All address calculations: " << (allMatch ? "PASSED" : "FAILED") << "\n\n";

    // ---------------------------------------------------------------------
    // Summary
    // ---------------------------------------------------------------------
    std::cout << "=== Summary ===\n";
    std::cout << "Formula: address(arr[i]) = base + (i * sizeof(element))\n\n";
    std::cout << "Type sizes on this system:\n";
    std::cout << "  char:   " << sizeof(char) << " byte(s)\n";
    std::cout << "  int:    " << sizeof(int) << " bytes\n";
    std::cout << "  double: " << sizeof(double) << " bytes\n";
    std::cout << "  Point:  " << sizeof(Point) << " bytes (3 ints)\n";

    return 0;
}
