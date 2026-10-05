// Hash functions: turn a key into an integer, then into a bucket index.
//
// Desirable traits of a hash function:
// - Fast to compute (O(1) for an integer, O(length) for a string).
// - Deterministic: the same key always gives the same hash.
// - Spreads keys uniformly across the table, so few keys collide.
// Equal keys MUST hash equal; different keys MAY hash equal (a collision).
//
// A hash table does two steps: key -> big integer hash -> `hash % capacity`.
// The functions below cover both steps.

/// Maps an integer key to a bucket index in `0..table_size`.
/// `rem_euclid` keeps the result non-negative for negative keys, where
/// the plain `%` operator would return a negative remainder.
pub fn mod_hash(key: i32, table_size: usize) -> usize {
    assert!(table_size > 0, "table size must be positive");
    (key as i64).rem_euclid(table_size as i64) as usize
}

/// Hashes a string of uppercase letters: A=1 .. Z=26, read as a base-26
/// number and reduced mod `table_size` after every step so it never overflows.
/// The +1 keeps 'A' from hashing like a missing digit (so "A" != "AA" != "").
pub fn hash_uppercase(text: &str, table_size: usize) -> usize {
    assert!(table_size > 0, "table size must be positive");
    let mut hash = 0;
    for byte in text.bytes() {
        assert!(byte.is_ascii_uppercase(), "only A-Z is supported");
        hash = (hash * 26 + (byte - b'A' + 1) as usize) % table_size;
    }
    hash
}

/// Polynomial rolling hash for any string: sum of byte * base^(n-1-i), mod
/// `modulus`, evaluated with Horner's rule.
///   hash("abc") = ((a * base) + b) * base + c
/// `modulus` must stay below 2^32 so `hash * base + byte` fits in a u64.
pub fn polynomial_hash(text: &str, base: u64, modulus: u64) -> u64 {
    assert!(
        modulus > 0 && modulus < (1 << 32),
        "modulus must be in 1..2^32"
    );
    let mut hash = 0u64;
    for byte in text.bytes() {
        hash = (hash * base + byte as u64) % modulus;
    }
    hash
}

/// FNV-1a, a simple and well-mixed 64-bit hash for byte strings:
/// start from an offset basis, then for each byte XOR it in and multiply by
/// a prime. `wrapping_mul` lets the multiplication overflow on purpose, which
/// is part of the mixing (plain `*` would panic in debug builds).
pub fn fnv1a_64(bytes: &[u8]) -> u64 {
    const OFFSET_BASIS: u64 = 0xcbf2_9ce4_8422_2325;
    const PRIME: u64 = 0x0000_0100_0000_01b3;

    let mut hash = OFFSET_BASIS;
    for &byte in bytes {
        hash ^= byte as u64;
        hash = hash.wrapping_mul(PRIME);
    }
    hash
}

/// Multiplicative (Knuth) hash: multiply by 2^32 / golden ratio and keep the
/// top `bits` bits. Gives `2^bits` buckets with no division, and it mixes
/// well even for keys that are multiples of each other.
pub fn multiplicative_hash(key: u32, bits: u32) -> u32 {
    assert!((1..=32).contains(&bits), "bits must be in 1..=32");
    key.wrapping_mul(2_654_435_769) >> (32 - bits)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mod_hash_stays_in_range_for_negative_keys() {
        assert_eq!(mod_hash(7, 5), 2);
        assert_eq!(mod_hash(-1, 5), 4);
        assert_eq!(
            mod_hash(i32::MIN, 7),
            (i32::MIN as i64).rem_euclid(7) as usize
        );
        for key in -50..50 {
            assert!(mod_hash(key, 8) < 8);
        }
    }

    #[test]
    #[should_panic(expected = "table size must be positive")]
    fn mod_hash_rejects_zero_table() {
        mod_hash(1, 0);
    }

    #[test]
    fn hash_uppercase_matches_hand_computation() {
        // K = 11, Y = 25 -> 11 * 26 + 25 = 311
        assert_eq!(hash_uppercase("KY", 1000), 311);
        assert_eq!(hash_uppercase("KY", 100), 11);
    }

    #[test]
    fn hash_uppercase_distinguishes_lengths() {
        assert_ne!(hash_uppercase("A", 1000), hash_uppercase("AA", 1000));
        assert_eq!(hash_uppercase("", 1000), 0);
    }

    #[test]
    #[should_panic(expected = "only A-Z is supported")]
    fn hash_uppercase_rejects_lowercase() {
        hash_uppercase("ky", 10);
    }

    #[test]
    fn polynomial_hash_matches_horner_by_hand() {
        // a=97, b=98: 97 * 31 + 98 = 3105
        assert_eq!(polynomial_hash("ab", 31, 1_000_003), 3105);
        assert_eq!(polynomial_hash("", 31, 1_000_003), 0);
    }

    #[test]
    fn polynomial_hash_is_deterministic_and_order_sensitive() {
        assert_eq!(
            polynomial_hash("abc", 31, 1_000_003),
            polynomial_hash("abc", 31, 1_000_003)
        );
        assert_ne!(
            polynomial_hash("abc", 31, 1_000_003),
            polynomial_hash("cba", 31, 1_000_003)
        );
    }

    #[test]
    fn fnv1a_matches_published_test_vectors() {
        assert_eq!(fnv1a_64(b""), 0xcbf2_9ce4_8422_2325);
        assert_eq!(fnv1a_64(b"a"), 0xaf63_dc4c_8601_ec8c);
        assert_eq!(fnv1a_64(b"foobar"), 0x8594_4171_f739_67e8);
    }

    #[test]
    fn multiplicative_hash_fits_requested_bits() {
        for key in 0..1000 {
            assert!(multiplicative_hash(key, 4) < 16);
        }
        // Full width keeps the whole product.
        assert_eq!(multiplicative_hash(1, 32), 2_654_435_769);
    }

    #[test]
    fn multiplicative_hash_spreads_sequential_keys() {
        let mut buckets = [0usize; 8];
        for key in 0..800 {
            buckets[multiplicative_hash(key, 3) as usize] += 1;
        }
        // Perfectly even would be 100 each; require every bucket within 2x.
        assert!(buckets.iter().all(|&count| (50..=200).contains(&count)));
    }
}
