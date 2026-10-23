// 2D array stored in one flat, contiguous buffer (row-major order).
//
//   logical 3x4 matrix        flat buffer
//   [ a b c d ]
//   [ e f g h ]      ->       [ a b c d e f g h i j k l ]
//   [ i j k l ]
//
// Element (row, col) lives at index `row * cols + col`.
// Compared with `Vec<Vec<i32>>`, one allocation keeps rows adjacent in memory
// (cache friendly), and every row has the same length by construction.
// Iterating row by row walks memory in order; iterating column by column
// jumps `cols` slots each step, which is slower on large matrices.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Matrix {
    rows: usize,
    cols: usize,
    data: Vec<i32>,
}

impl Matrix {
    /// Creates a `rows` x `cols` matrix filled with zeros.
    /// Panics if `rows * cols` overflows `usize`, like `vec!` on a too-large size.
    pub fn new(rows: usize, cols: usize) -> Self {
        // Plain `rows * cols` would wrap in release builds and build a buffer
        // smaller than the recorded shape, so `get` would panic in bounds.
        let len = rows
            .checked_mul(cols)
            .expect("matrix dimensions overflow usize");
        Self {
            rows,
            cols,
            data: vec![0; len],
        }
    }

    /// Builds a matrix from row-major `data`. Returns `None` if the length is
    /// wrong, including when `rows * cols` overflows `usize`.
    pub fn from_vec(rows: usize, cols: usize, data: Vec<i32>) -> Option<Self> {
        if rows.checked_mul(cols) == Some(data.len()) {
            Some(Self { rows, cols, data })
        } else {
            None
        }
    }

    pub fn rows(&self) -> usize {
        self.rows
    }

    pub fn cols(&self) -> usize {
        self.cols
    }

    fn index(&self, row: usize, col: usize) -> usize {
        row * self.cols + col
    }

    pub fn get(&self, row: usize, col: usize) -> Option<i32> {
        if row < self.rows && col < self.cols {
            Some(self.data[self.index(row, col)])
        } else {
            None
        }
    }

    /// Sets (row, col). Panics if out of bounds.
    pub fn set(&mut self, row: usize, col: usize, value: i32) {
        assert!(
            row < self.rows && col < self.cols,
            "matrix index out of bounds"
        );
        let i = self.index(row, col);
        self.data[i] = value;
    }

    /// Borrows one row as a slice, or `None` if out of bounds.
    pub fn row(&self, row: usize) -> Option<&[i32]> {
        if row < self.rows {
            let start = row * self.cols;
            Some(&self.data[start..start + self.cols])
        } else {
            None
        }
    }

    /// Copies one column out (columns are not contiguous, so no slice).
    pub fn column(&self, col: usize) -> Option<Vec<i32>> {
        if col < self.cols {
            Some(
                (0..self.rows)
                    .map(|r| self.data[self.index(r, col)])
                    .collect(),
            )
        } else {
            None
        }
    }

    /// The flat row-major buffer.
    pub fn as_slice(&self) -> &[i32] {
        &self.data
    }

    /// Returns a new matrix where element (r, c) moves to (c, r).
    ///
    /// Walks the flat buffer once, recovering (r, c) from the flat index
    /// i = r * cols + c. That is exactly rows * cols steps, so a shape like
    /// N x 0 costs nothing (a row-by-row loop would still spin N times).
    pub fn transpose(&self) -> Matrix {
        let mut result = Matrix::new(self.cols, self.rows);
        for (i, &value) in self.data.iter().enumerate() {
            let (r, c) = (i / self.cols, i % self.cols); // cols > 0 if data is non-empty
            result.data[c * self.rows + r] = value;
        }
        result
    }

    /// Returns a copy rotated 90 degrees clockwise.
    ///
    /// Clockwise rotation is "transpose, then reverse each row", which sends
    /// (r, c) to (c, rows - 1 - r). Applying that mapping directly takes one
    /// pass over the buffer, again exactly rows * cols steps.
    pub fn rotate_clockwise(&self) -> Matrix {
        let mut result = Matrix::new(self.cols, self.rows);
        for (i, &value) in self.data.iter().enumerate() {
            let (r, c) = (i / self.cols, i % self.cols);
            result.data[c * self.rows + (self.rows - 1 - r)] = value;
        }
        result
    }

    /// Matrix product `self * other`. Returns `None` if `self.cols != other.rows`.
    /// O(rows * cols * other.cols).
    ///
    /// Entries are `i32`, so a product or sum that leaves the `i32` range
    /// follows normal integer rules: it panics in debug builds and wraps in
    /// release builds. Use a wider element type if that can happen.
    pub fn multiply(&self, other: &Matrix) -> Option<Matrix> {
        if self.cols != other.rows {
            return None;
        }
        let mut result = Matrix::new(self.rows, other.cols);
        if result.data.is_empty() {
            // N x 0 or 0 x N result: nothing to compute, and the loops below
            // would otherwise spin over a dimension with no output cells.
            return Some(result);
        }
        for i in 0..self.rows {
            for j in 0..other.cols {
                let mut sum = 0;
                for k in 0..self.cols {
                    sum += self.data[i * self.cols + k] * other.data[k * other.cols + j];
                }
                result.data[i * other.cols + j] = sum;
            }
        }
        Some(result)
    }
}

#[cfg(test)]
mod tests {
    use super::Matrix;

    fn sample() -> Matrix {
        // [1 2 3]
        // [4 5 6]
        Matrix::from_vec(2, 3, vec![1, 2, 3, 4, 5, 6]).unwrap()
    }

    #[test]
    fn new_is_zero_filled() {
        let m = Matrix::new(2, 2);
        assert_eq!(m.as_slice(), &[0, 0, 0, 0]);
    }

    #[test]
    fn from_vec_rejects_wrong_length() {
        assert!(Matrix::from_vec(2, 2, vec![1, 2, 3]).is_none());
    }

    #[test]
    fn get_uses_row_major_indexing() {
        let m = sample();
        assert_eq!(m.get(0, 2), Some(3));
        assert_eq!(m.get(1, 0), Some(4));
        assert_eq!(m.get(2, 0), None);
        assert_eq!(m.get(0, 3), None);
    }

    #[test]
    fn set_changes_only_one_cell() {
        let mut m = sample();
        m.set(1, 1, 50);
        assert_eq!(m.as_slice(), &[1, 2, 3, 4, 50, 6]);
    }

    #[test]
    #[should_panic(expected = "matrix index out of bounds")]
    fn set_out_of_bounds_panics() {
        sample().set(0, 3, 1);
    }

    #[test]
    fn row_and_column_access() {
        let m = sample();
        assert_eq!(m.row(1), Some(&[4, 5, 6][..]));
        assert_eq!(m.row(2), None);
        assert_eq!(m.column(1), Some(vec![2, 5]));
        assert_eq!(m.column(3), None);
    }

    #[test]
    fn transpose_swaps_dimensions() {
        let t = sample().transpose();
        assert_eq!((t.rows(), t.cols()), (3, 2));
        assert_eq!(t.as_slice(), &[1, 4, 2, 5, 3, 6]);
    }

    #[test]
    fn transpose_twice_is_identity() {
        let m = sample();
        assert_eq!(m.transpose().transpose(), m);
    }

    #[test]
    fn rotate_clockwise_turns_90_degrees() {
        // [1 2 3]      [4 1]
        // [4 5 6]  ->  [5 2]
        //              [6 3]
        let r = sample().rotate_clockwise();
        assert_eq!((r.rows(), r.cols()), (3, 2));
        assert_eq!(r.as_slice(), &[4, 1, 5, 2, 6, 3]);
    }

    #[test]
    fn multiply_matches_hand_computation() {
        let a = sample();
        let b = Matrix::from_vec(3, 2, vec![7, 8, 9, 10, 11, 12]).unwrap();
        let product = a.multiply(&b).unwrap();
        assert_eq!((product.rows(), product.cols()), (2, 2));
        assert_eq!(product.as_slice(), &[58, 64, 139, 154]);
    }

    #[test]
    fn multiply_incompatible_shapes_is_none() {
        assert!(sample().multiply(&sample()).is_none());
    }

    #[test]
    fn empty_matrix_is_handled() {
        let m = Matrix::new(0, 3);
        assert_eq!(m.get(0, 0), None);
        assert_eq!(m.transpose().rows(), 3);
    }

    #[test]
    fn degenerate_shapes_swap_dimensions_without_work() {
        // usize::MAX x 0 holds no elements; a row-by-row loop would never finish.
        for (rows, cols) in [(usize::MAX, 0), (0, usize::MAX)] {
            let m = Matrix::new(rows, cols);
            let t = m.transpose();
            assert_eq!((t.rows(), t.cols()), (cols, rows));
            let r = m.rotate_clockwise();
            assert_eq!((r.rows(), r.cols()), (cols, rows));
            assert!(t.as_slice().is_empty() && r.as_slice().is_empty());
        }
        let tall = Matrix::new(usize::MAX, 0);
        let product = tall.multiply(&Matrix::new(0, 0)).unwrap();
        assert_eq!((product.rows(), product.cols()), (usize::MAX, 0));
    }

    #[test]
    fn rotate_clockwise_matches_transpose_then_reverse_rows() {
        let m = Matrix::from_vec(3, 4, (1..=12).collect()).unwrap();
        let mut expected = m.transpose();
        let cols = expected.cols();
        for row in expected.data.chunks_exact_mut(cols) {
            row.reverse();
        }
        assert_eq!(m.rotate_clockwise(), expected);
        // Four quarter turns are the identity.
        let full_turn = m
            .rotate_clockwise()
            .rotate_clockwise()
            .rotate_clockwise()
            .rotate_clockwise();
        assert_eq!(full_turn, m);
    }

    #[test]
    #[should_panic(expected = "matrix dimensions overflow usize")]
    fn new_rejects_overflowing_dimensions() {
        // rows * cols wraps to 0 here; it must not build an empty buffer.
        let half = 1usize << (usize::BITS / 2);
        Matrix::new(half, half);
    }

    #[test]
    fn from_vec_rejects_overflowing_dimensions() {
        let half = 1usize << (usize::BITS / 2);
        assert!(Matrix::from_vec(half, half, Vec::new()).is_none());
        assert!(Matrix::from_vec(usize::MAX, 2, vec![0; 2]).is_none());
    }
}
