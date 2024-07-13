import pytest
from main import HelperFunctions as HF, SQLHelper
db = None


def test_add_positive_numbers():
    assert HF.add(2,2) == 4

def test_add_negative_numbers():
    result = HF.add(-1, -1)
    assert result == -2

def test_add_zero():
    result = HF.add(0, 0)
    assert result == 0

# def test_search_bug_1():
#     db = SQLHelper()
#     db.connect()
#     try:
#         if len(db.searchBug('bug')) == 0:
#             raise
#     except Exception as e:
#         pytest.fail(f"searchBug raised an exception: {e}")
#     finally:
#         db.close()

# def test_search_bug_2():
#     db = SQLHelper()
#     db.connect()
#     try:
#         if len(db.searchBug('B')) == 0:
#             raise
#     except Exception as e:
#         pytest.fail(f"searchBug raised an exception: {e}")
#     finally:
#         db.close()

# def test_search_bug_3():
#     db = SQLHelper()
#     db.connect()
#     try:
#         if len(db.searchBug('aux')) is not 0:
#             raise
#     except Exception as e:
#         pytest.fail(f"searchBug raised an exception: {e}")
#     finally:
#         db.close()

def test_check_User_Name_1():
    try:
        if not HF.checkUserName('Shay12'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")

def test_check_User_Name_2():
    try:
        if not HF.checkUserName('MaxSu'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")

def test_check_User_Name_3():
    try:
        if HF.checkUserName('Shay*&'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")

def test_check_fName_1():
    try:
        if not HF.checkFname('Shay'):
            raise 
    except:
        pytest.fail(f"checkFname raised an exception: firstName regex is not valid.")

def test_check_fName_2():
    try:
        if not HF.checkFname('Maxim'):
            raise 
    except:
        pytest.fail(f"checkFname raised an exception: firstName regex is not valid.")

def test_check_fName_3():
    try:
        if HF.checkFname('Sh4y'):
            raise 
    except:
        pytest.fail(f"checkFname raised an exception: firstName regex is not valid.")

def test_check_lName_1():
    try:
        if not HF.checkLname('Hahiashvili'):
            raise 
    except:
        pytest.fail(f"checkLname raised an exception: lastName regex is not valid.")

def test_check_lName_2():
    try:
        if not HF.checkLname('Subotin'):
            raise 
    except:
        pytest.fail(f"checkLname raised an exception: lastName regex is not valid.")

def test_check_lName_3():
    try:
        if HF.checkLname('S3btus4'):
            raise 
    except:
        pytest.fail(f"checkLname raised an exception: lastName regex is not valid.")

def test_check_password_1():
    try:
        if not HF.checkPassword('Apple123'):
            raise 
    except:
        pytest.fail(f"checkPassword raised an exception: password regex is not valid.")

def test_check_password_2():
    try:
        if not HF.checkPassword('CatDog22'):
            raise 
    except:
        pytest.fail(f"checkPassword raised an exception: password regex is not valid.")

def test_check_password_3():
    try:
        if HF.checkPassword('tomcruize21'):
            raise 
    except:
        pytest.fail(f"checkPassword raised an exception: password regex is not valid.")

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
#     db.connect2()

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
#     db.connect2()

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