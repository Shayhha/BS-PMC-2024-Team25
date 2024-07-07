import pytest
from main import add

def test_add_positive_numbers():
    assert add(2,2) == 4

def test_add_negative_numbers():
    result = add(-1, -1)
    assert result == -2

def test_add_zero():
    result = add(0, 0)
    assert result == 0