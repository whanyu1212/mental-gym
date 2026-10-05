"""
Tests for src/dsa_from_scratch/hash_map/python.

Each hash table is checked on the edge cases that used to be bugs, and
the resizing tables are compared with a plain dict on a fixed random
workload.
"""

import random

import pytest
from array_hash_map import ArrayHashMap
from direct_addressing_table import DirectAddressingTable
from open_addressing import HashMapOpenAddressing, Pair
from sample_hash_functions import hash_function
from separate_chaining import HashMapChaining

PROBINGS = HashMapOpenAddressing.PROBINGS


def random_workload(table, seed: int, operations: int = 5000) -> None:
    """Run random put/remove/get on `table` and check it against a
    dict."""
    rng = random.Random(seed)
    oracle: dict[int, str] = {}
    for _ in range(operations):
        key = rng.randint(-40, 40)
        operation = rng.randint(0, 2)
        if operation == 0:
            table.put(key, str(key))
            oracle[key] = str(key)
        elif operation == 1:
            table.remove(key)
            oracle.pop(key, None)
        else:
            assert table.get(key) == oracle.get(key)
        assert table.size == len(oracle)


# --- open addressing -------------------------------------------------------


@pytest.mark.parametrize("probing", PROBINGS)
def test_open_addressing_put_get_update_remove(probing):
    table = HashMapOpenAddressing(probing)
    table.put(1, "one")
    table.put(1, "ONE")
    assert table.get(1) == "ONE"
    assert table.size == 1
    table.remove(1)
    assert table.get(1) is None
    assert table.size == 0


@pytest.mark.parametrize("probing", PROBINGS)
def test_open_addressing_colliding_keys_survive_growth(probing):
    table = HashMapOpenAddressing(probing)
    keys = [1, 9, 17, 25, 33, 41, 49]  # all congruent mod 4 and mod 8
    for key in keys:
        table.put(key, str(key))
    for key in keys:
        assert table.get(key) == str(key)


@pytest.mark.parametrize("probing", PROBINGS)
def test_open_addressing_churn_does_not_hang_or_grow(probing):
    # Used to loop forever: removal marks filled every empty bucket.
    table = HashMapOpenAddressing(probing)
    for key in range(1000):
        table.put(key, "x")
        table.remove(key)
    assert table.size == 0
    assert table.capacity <= 8


@pytest.mark.parametrize("probing", PROBINGS)
def test_open_addressing_tombstone_count_matches_buckets(probing):
    table = HashMapOpenAddressing(probing)
    rng = random.Random(5)
    for _ in range(2000):
        key = rng.randint(0, 30)
        if rng.random() < 0.5:
            table.put(key, "x")
        else:
            table.remove(key)
        marks = sum(1 for bucket in table.buckets if bucket is table.TOMBSTONE)
        assert table.tombstones == marks


@pytest.mark.parametrize("probing", PROBINGS)
def test_probe_sequence_visits_every_bucket(probing):
    # Used to cycle over a subset of buckets (e.g. only 0 and 2 of 4).
    table = HashMapOpenAddressing(probing)
    for capacity in (4, 8, 16, 64):
        table.capacity = capacity
        for key in range(-20, 20):
            visited = {table.probe(key, i) for i in range(capacity)}
            assert visited == set(range(capacity))


@pytest.mark.parametrize("probing", PROBINGS)
def test_find_bucket_reaches_the_only_free_bucket(probing):
    table = HashMapOpenAddressing(probing)
    table.capacity = 4
    table.buckets = [Pair(0, "x"), None, Pair(2, "x"), Pair(6, "x")]
    assert table.find_bucket(4) == 1  # 4 hashes to the occupied slot 0


@pytest.mark.parametrize("probing", PROBINGS)
def test_open_addressing_matches_dict(probing):
    random_workload(HashMapOpenAddressing(probing), seed=7)


def test_open_addressing_rejects_unknown_probing():
    with pytest.raises(ValueError):
        HashMapOpenAddressing("cubic")


# --- separate chaining -----------------------------------------------------


def test_separate_chaining_matches_dict():
    random_workload(HashMapChaining(), seed=3)


# --- array hash map --------------------------------------------------------


def test_array_hash_map_get_checks_the_stored_key():
    table = ArrayHashMap()
    table.put(101, "hundred-one")
    assert table.get(1) is None  # same bucket, different key
    assert table.get(201) is None
    assert table.get(101) == "hundred-one"


def test_array_hash_map_remove_leaves_other_keys_alone():
    table = ArrayHashMap()
    table.put(101, "hundred-one")
    table.remove(1)
    assert table.get(101) == "hundred-one"
    table.remove(101)
    assert table.get(101) is None


def test_array_hash_map_put_returns_the_displaced_pair():
    table = ArrayHashMap()
    assert table.put(1, "one") is None
    displaced = table.put(101, "hundred-one")
    assert (displaced.key, displaced.value) == (1, "one")


def test_array_hash_map_missing_key_is_none():
    assert ArrayHashMap().get(42) is None


# --- direct addressing table -----------------------------------------------


def test_direct_addressing_insert_search_delete():
    table = DirectAddressingTable(5)
    table.insert(3)
    assert table.search(3) is True
    table.delete(3)
    assert table.search(3) is False


@pytest.mark.parametrize("key", [-1, -5, 5, 100])
def test_direct_addressing_rejects_out_of_range_writes(key):
    table = DirectAddressingTable(5)
    with pytest.raises(IndexError):
        table.insert(key)
    with pytest.raises(IndexError):
        table.delete(key)
    assert table.table == [False] * 5  # negative keys did not wrap around


@pytest.mark.parametrize("key", [-1, 5, 100])
def test_direct_addressing_out_of_range_search_is_absent(key):
    assert DirectAddressingTable(5).search(key) is False


# --- hash function ---------------------------------------------------------


def test_hash_function_matches_hand_computation():
    assert hash_function("KY", 1000) == 11 * 26 + 25
    assert hash_function("", 1000) == 0
    assert hash_function("A", 1000) != hash_function("AA", 1000)


@pytest.mark.parametrize("text", ["ky", "K Y", "K1"])
def test_hash_function_rejects_non_uppercase(text):
    with pytest.raises(ValueError):
        hash_function(text, 1000)


def test_hash_function_rejects_bad_table_size():
    with pytest.raises(ValueError):
        hash_function("KY", 0)
