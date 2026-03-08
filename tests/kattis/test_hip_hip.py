import sys
from io import StringIO

from hip_hip import hip_hip


def test_hip_hip(monkeypatch):
    # Redirect stdout to capture print output
    captured_output = StringIO()  # works with text in memory
    # `monkeypatch.setattr(sys, "stdout", captured_output) is temporarily setting the
    # stdout attribute of the sys module to the captured_output object.
    monkeypatch.setattr(sys, "stdout", captured_output)

    # Call the function
    hip_hip()

    # Expected output
    expected_output = "Hipp hipp hurra!\n" * 20

    # remove any trailing newline characters
    assert captured_output.getvalue().rstrip() == expected_output.rstrip()
