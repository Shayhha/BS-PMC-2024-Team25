import pytest
from main import add

def test_add_positive_numbers():
    result = add(2, 3)
    assert result == 5, f"Expected 5, but got {result}"

def test_add_negative_numbers():
    result = add(-1, -1)
    assert result == -2, f"Expected -2, but got {result}"

def test_add_zero():
    result = add(0, 0)
    assert result == 0, f"Expected 0, but got {result}"