import pytest
from main import add, SQLHelper

def test_add_positive_numbers():
    assert add(2,2) == 4

def test_add_negative_numbers():
    result = add(-1, -1)
    assert result == -2

def test_add_zero():
    result = add(0, 0)
    assert result == 0


# db = None

# def test_insert_bug_1():
#     db = SQLHelper()
#     db.connect()

#     try:
#         # Insert the bug into the database
#         db.insertBug(
#             "TESTING_BUG_TESTING",
#             1,
#             1,
#             2,
#             "This is the description for bug.",
#             "New",
#             1,
#             2,
#             0,
#             "01/01/2024",
#             "02/01/2024",
#             "03/01/2024"
#         )

#         # Clean up: Delete the inserted bug from the database
#         delete_sql = "DELETE FROM Bugs WHERE bugName = ?"
#         db.cursor.execute(delete_sql, ("TESTING_BUG_TESTING",))
#         db.connection.commit()
#         print(f"Test bug was deleted successfully")

#     except Exception as e:
#         pytest.fail(f"insertBug raised an exception: {e}")

#     finally:
#         db.close()


# def test_insert_bug_2():
#     db = SQLHelper()
#     db.connect()

#     try:
#         # Insert the bug into the database
#         db.insertBug(
#             "TESTING_BUG_TESTING",
#             1,
#             1,
#             2,
#             "The description.",
#             "Done",
#             1,
#             2,
#             0,
#             "01/01/2024",
#             "03/01/2024",
#             "06/01/2024"
#         )

#         # Clean up: Delete the inserted bug from the database
#         delete_sql = "DELETE FROM Bugs WHERE bugName = ?"
#         db.cursor.execute(delete_sql, ("TESTING_BUG_TESTING",))
#         db.connection.commit()
#         print(f"Test bug was deleted successfully")

#     except Exception as e:
#         pytest.fail(f"insertBug raised an exception: {e}")

#     finally:
#         db.close()

# def test_insert_bug_3():
#     db = SQLHelper() 
#     db.connect()

#     try:
#         # Insert the bug into the database
#         db.insertBug(
#             "TESTING_BUG_TESTING",
#             1,
#             1,
#             2,
#             "This is the description for bug.",
#             "New",
#             1,
#             "NOT GOOD",
#             0,
#             "01/01/2024",
#             "02/01/2024",
#             "03/01/2024"
#         )
     
#         # If insertBug succeeds and doesn't raise an exception, fail the test
#         pytest.fail("Expected insertBug to raise an exception but it succeeded")

#     except Exception as e:
#         # Check that the exception message indicates the expected data type conversion error
#         assert "Conversion failed when converting the nvarchar value 'NOT GOOD' to data type int" in str(e)

#     finally:
#         try:
#             # Clean up: Delete the inserted bug from the database
#             delete_sql = "DELETE FROM Bugs WHERE bugName = ?"
#             db.cursor.execute(delete_sql, ("TESTING_BUG_TESTING",))
#             db.connection.commit()
#             print(f"Test bug was deleted successfully")
#         except Exception as e:
#             print(f"Error occurred while deleting test bug: {e}")
#             raise

#         db.close()