// SPDX-License-Identifier: BSD-2-Clause
pragma solidity ^0.8.16;

contract CountByX {
    function countBy(int x, int n) public pure returns (int[] memory) {
        require(n > 0, "n must be positive");

        int[] memory z = new int[](uint(n)); // Cast n to uint for array size
        // cannot use push on memory array
        for (uint i = 0; i < uint(n); i++) {
            // Cast n to uint for loop condition
            z[i] = x * int(i + 1); // Cast i to int for multiplication
        }
        return z;
    }
}
