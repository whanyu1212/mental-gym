from io import StringIO

from fyrirtaekjanafn import filter_consonants


def run_test(monkeypatch, input_str, expected_output):
    monkeypatch.setattr("sys.stdin", StringIO(input_str))
    captured_output = StringIO()
    monkeypatch.setattr("sys.stdout", captured_output)
    filter_consonants()
    assert captured_output.getvalue().strip() == expected_output


def test_fyrirtaekjanafn(monkeypatch):
    test_cases = [("facebook\n", "aeoo"), ("google\n", "ooe"), ("microsoft\n", "ioo")]

    for input_str, expected_output in test_cases:
        run_test(monkeypatch, input_str, expected_output)
