import pytest
from main import SQLHelper, UserNameChecker, FnameChecker, LnameChecker, PasswordChecker, EmailChecker, BugTitleOrDescriptionChecker, BugPriorityOrImportanceChecker, BugOpenCreationDateChecker, BugCloseDateChecker
from main import HelperFunctions as HF
from dotenv import load_dotenv
from datetime import datetime

# global object for database 
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

def test_to_sha256_1():
    try:
        if HF.toSHA256('Shay123') != 'a0ae799a2910f035b250e5175a02576f0ed0970c18ece1e65ce706767fa85c72':
            raise 
    except:
        pytest.fail(f"toSHA256 raised an exception: SHA does not match expected hex.")

def test_to_sha256_2():
    try:
        if HF.toSHA256('Ayman123') != '31b9d9d5e64cf62ecc7228e5f9861a7a1a994af39e52c70b137e2e38ba6c112d':
            raise 
    except:
        pytest.fail(f"toSHA256 raised an exception: SHA does not match expected hex.")

def test_to_sha256_3():
    try:
        if HF.toSHA256('ShayShay') == 'a0ae799a2910f035b250e5175a02576f0ed0970c18ece1e65ce706767fa85c72':
            raise 
    except:
        pytest.fail(f"toSHA256 raised an exception: SHA returned unexpected hex.")

def test_check_User_Name_1():
    try:
        if not UserNameChecker.checkInput('Shay12'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")

def test_check_User_Name_2():
    try:
        if not UserNameChecker.checkInput('MaxSu'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")

def test_check_User_Name_3():
    try:
        if UserNameChecker.checkInput('Shay*&'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")


def test_check_User_Name_4():
    try:
        if UserNameChecker.checkInput('*₪12'):
            raise 
    except:
        pytest.fail(f"checkUserName raised an exception: username regex is not valid.")


def test_check_fName_1():
    try:
        if not FnameChecker.checkInput('Shay'):
            raise 
    except:
        pytest.fail(f"checkFname raised an exception: firstName regex is not valid.")

def test_check_fName_2():
    try:
        if not FnameChecker.checkInput('Maxim'):
            raise 
    except:
        pytest.fail(f"checkFname raised an exception: firstName regex is not valid.")

def test_check_fName_3():
    try:
        if FnameChecker.checkInput('Sh4y'):
            raise 
    except:
        pytest.fail(f"checkFname raised an exception: firstName regex is not valid.")

def test_check_lName_1():
    try:
        if not LnameChecker.checkInput('Hahiashvili'):
            raise 
    except:
        pytest.fail(f"checkLname raised an exception: lastName regex is not valid.")

def test_check_lName_2():
    try:
        if not LnameChecker.checkInput('Subotin'):
            raise 
    except:
        pytest.fail(f"checkLname raised an exception: lastName regex is not valid.")

def test_check_lName_3():
    try:
        if LnameChecker.checkInput('S3btus4'):
            raise 
    except:
        pytest.fail(f"checkLname raised an exception: lastName regex is not valid.")

def test_check_password_1():
    try:
        if not PasswordChecker.checkInput('Apple123'):
            raise 
    except:
        pytest.fail(f"checkPassword raised an exception: password regex is not valid.")

def test_check_password_2():
    try:
        if not PasswordChecker.checkInput('CatDog22'):
            raise 
    except:
        pytest.fail(f"checkPassword raised an exception: password regex is not valid.")

def test_check_password_3():
    try:
        if PasswordChecker.checkInput('tomcruize21'):
            raise 
    except:
        pytest.fail(f"checkPassword raised an exception: password regex is not valid.")

def test_check_email1():
    try:
        if EmailChecker.checkInput("plainaddress"):
            raise
    except:
        pytest.fail(f"checkEmail raised an exception: password regex is not valid.")

def test_check_email2():
    try:
        if not EmailChecker.checkInput("ayman@gmail.com"):
            raise
    except:
        pytest.fail(f"checkEmail raised an exception: password regex is not valid.")

def test_check_email3():
    try:
        if not EmailChecker.checkInput("user.name+tag+sorting@example.com"):
            raise
    except:
        pytest.fail(f"checkEmail raised an exception: password regex is not valid.")

def test_check_email4():
    try:
        if not EmailChecker.checkInput("user_name@sub.example.org"):
            raise
    except:
        pytest.fail(f"checkEmail raised an exception: password regex is not valid.")

def test_check_email5():
    try:
        if  EmailChecker.checkInput("@missingusername.com"):
            raise
    except:
        pytest.fail(f"checkEmail raised an exception: password regex is not valid.")


def test_check_email6():
    try:
        if  EmailChecker.checkInput("shay@.com"):
            raise
    except:
        pytest.fail(f"checkEmail raised an exception: password regex is not valid.")

def test_check_bug_clsoe_1():
    try:
        if not BugCloseDateChecker.checkInput('16/01/2009', '08/07/2012'):
            raise 
    except:
        pytest.fail(f"checkBugCloseDate raised an exception: close date is  not valid.")
    
def test_check_bug_clsoe_2():
    try:
        if not BugCloseDateChecker.checkInput('16/01/2009', '16/01/2009'):
            raise 
    except:
        pytest.fail(f"checkBugCloseDate raised an exception: close date is  not valid.")

def test_check_bug_clsoe_3():
    try:
        if BugCloseDateChecker.checkInput('20/02/2012', '16/01/2009'):
            raise 
    except:
        pytest.fail(f"checkBugCloseDate raised an exception: close date is  not valid.")


def test_check_bug_clsoe_4():
    try:
        if BugCloseDateChecker.checkInput('10/04/2009', '16/01/2009'):
            raise 
    except:
        pytest.fail(f"checkBugCloseDate raised an exception: close date is  not valid.")


def test_check_bug_title_or_description_1():
    try:
        if not BugTitleOrDescriptionChecker.checkInput('Bug 1'):
            raise 
    except:
        pytest.fail(f"checkBugTitleOrDescription raised an exception.")

def test_check_bug_title_or_description_2():
    try:
        if not BugTitleOrDescriptionChecker.checkInput('(Test1) good title 123'):
            raise 
    except:
        pytest.fail(f"checkBugTitleOrDescription raised an exception.")

def test_check_bug_title_or_description_3():
    try:
        if not BugTitleOrDescriptionChecker.checkInput('Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reprehenderit repellat tenetur eos a tempora velit ipsa dolore error nihil, blanditiis debitis expedita repudiandae praesentium! Mollitia aut fuga laborum repudiandae enim.'):
            raise 
    except:
        pytest.fail(f"checkBugTitleOrDescription raised an exception.")

def test_check_bug_title_or_description_4():
    try:
        if BugTitleOrDescriptionChecker.checkInput('`SELECT * FROM Users`'):
            raise 
    except:
        pytest.fail(f"checkBugTitleOrDescription raised an exception.")

def test_check_bug_title_or_description_5():
    try:
        if BugTitleOrDescriptionChecker.checkInput('`@)*&$VJ@*&JC&Shfsjhcajsh~`-182u`s\n\t`'):
            raise 
    except:
        pytest.fail(f"checkBugTitleOrDescription raised an exception.")

def test_check_bug_priority_or_importance_1():
    try:
        if not BugPriorityOrImportanceChecker.checkInput(3):
            raise 
    except:
        pytest.fail(f"checkBugPriorityOrImportance raised an exception.")

def test_check_bug_priority_or_importance_2():
    try:
        if not BugPriorityOrImportanceChecker.checkInput(10):
            raise 
    except:
        pytest.fail(f"checkBugPriorityOrImportance raised an exception.")

def test_check_bug_priority_or_importance_3():
    try:
        if not BugPriorityOrImportanceChecker.checkInput(0):
            raise 
    except:
        pytest.fail(f"checkBugPriorityOrImportance raised an exception.")

def test_check_bug_priority_or_importance_4():
    try:
        if BugPriorityOrImportanceChecker.checkInput(-25):
            raise 
    except:
        pytest.fail(f"checkBugPriorityOrImportance raised an exception.")

def test_check_bug_priority_or_importance_5():
    try:
        if BugPriorityOrImportanceChecker.checkInput(425):
            raise 
    except:
        pytest.fail(f"checkBugPriorityOrImportance raised an exception.")

def test_check_bug_open_creation_date_1():
    try:
        if not BugOpenCreationDateChecker.checkInput('24/04/2022', '12/04/2022'):
            raise 
    except:
        pytest.fail(f"checkBugOpenCreationDate raised an exception: open and creation dates are not valid.")

def test_check_bug_open_creation_date_2():
    try:
        if not BugOpenCreationDateChecker.checkInput('01/12/2023', '01/12/2023'):
            raise 
    except:
        pytest.fail(f"checkBugOpenCreationDate raised an exception: open and creation dates are not valid.")

def test_check_bug_open_creation_date_3():
    try:
        if BugOpenCreationDateChecker.checkInput('16/01/2009', '18/06/2011'):
            raise 
    except:
        pytest.fail(f"checkBugOpenCreationDate raised an exception: open and creation dates are not valid.")

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
#             "03/01/2024",
#             "Ui",
#             "these are some suggestions: 1,2,3",
#             0,
#             ""
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
#             "06/01/2024",
#             "Performance",
#             "these are some suggestions: 1,2,3",
#                         0,
#             ""
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
#             "03/01/2024",
#             "Performance",
#             "these are some suggestions: 1,2,3",
#             0,
#             ""
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

def test_check_bug_priority_or_importance_valid():
    assert BugPriorityOrImportanceChecker.checkInput(0)
    assert BugPriorityOrImportanceChecker.checkInput(1)
    assert BugPriorityOrImportanceChecker.checkInput(10)

def test_check_bug_priority_or_importance_invalid():
    assert not BugPriorityOrImportanceChecker.checkInput(-1)
    assert not BugPriorityOrImportanceChecker.checkInput(11)
    assert not BugPriorityOrImportanceChecker.checkInput(999)

# def test_sort_bugs_newest_to_oldest():
#     db = SQLHelper()
#     db.connect()
#     try:
#         bugs = db.searchBug('Bug')  # Fetch all bugs
#         sorted_bugs = sorted(bugs, key=lambda x: x['openDate'], reverse=True)
#         assert bugs == sorted_bugs
#     except Exception as e:
#         pytest.fail(f"Sorting bugs from newest to oldest raised an exception: {e}")
#     finally:
#         db.close()

# def test_sort_bugs_oldest_to_newest():
#     db = SQLHelper()
#     db.connect()
#     try:
#         bugs = db.searchBug('Bug')  # Fetch all bugs
#         sorted_bugs = sorted(bugs, key=lambda x: x['openDate'])
#         assert bugs == sorted_bugs
#     except Exception as e:
#         pytest.fail(f"Sorting bugs from oldest to newest raised an exception: {e}")
#     finally:
#         db.close()

def test_handle_bug_importance_1():
    title = 'Color of save button is blue istead of green'
    desc = 'Color of save buttun is blue instead of green, but app works fine and it does not affact anything.'

    groqResponse = int(HF.handleBugImportance(title, desc)) # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse > 6
    except Exception as e:
        pytest.fail(f"handleBugImportance raised an exception: {e}")

def test_handle_bug_importance_2():
    title = 'User profile picture is incorrect'
    desc = 'User profile picture is incorrect, but app works fine and it does not affact anything.'

    groqResponse = int(HF.handleBugImportance(title, desc)) # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse > 6
    except Exception as e:
        pytest.fail(f"handleBugImportance raised an exception: {e}")

def test_handle_bug_importance_3():
    title = 'User cannot login to website'
    desc = 'User cannot login to website, user is unable to access his projects and tasks.'

    groqResponse = int(HF.handleBugImportance(title, desc)) # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse < 6
    except Exception as e:
        pytest.fail(f"handleBugImportance raised an exception: {e}")

# def test_delete_user():
#     db = SQLHelper()
#     db.connect()
#     try:
#         db.addUser('test@test.com', 'test', 'test', 'test', 'Coder', 'Test123')
#         user = db.searchUser('test@test.com', 'Test123')
#         if not db.deleteUser(user.userId):
#             raise RuntimeError('Failed to perform database query to delete user.')
#     except Exception as e:
#         pytest.fail(f"deleteUser raised an exception: {e}")
#     finally:
#         db.cursor.execute('DELETE FROM Users WHERE email = \'test@test.com\'') 
#         db.connection.commit()
#         db.close()

def test_handle_bug_priority_1():
    title = 'Color of save button is blue instead of green'
    desc = 'Color of save button is blue instead of green, but app works fine and it does not affect anything.'

    groqResponse = int(HF.handleBugPriority(title, desc))  # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse > 6
    except Exception as e:
        pytest.fail(f"handleBugPriority raised an exception: {e}")

def test_handle_bug_priority_2():
    title = 'User profile picture is incorrect'
    desc = 'User profile picture is incorrect, but app works fine and it does not affect anything.'

    groqResponse = int(HF.handleBugPriority(title, desc))  # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse > 6
    except Exception as e:
        pytest.fail(f"handleBugPriority raised an exception: {e}")

def test_handle_bug_priority_3():
    title = 'User cannot login to website'
    desc = 'User cannot login to website, user is unable to access his projects and tasks.'

    groqResponse = int(HF.handleBugPriority(title, desc))  # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse < 6
    except Exception as e:
        pytest.fail(f"handleBugPriority raised an exception: {e}")

def test_handle_bug_priority_4():
    title = 'Database backup failure'
    desc = 'Database backup failed. There is a risk of data loss if an issue occurs.'

    groqResponse = int(HF.handleBugPriority(title, desc))  # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse < 6
    except Exception as e:
        pytest.fail(f"handleBugPriority raised an exception: {e}")

def test_handle_bug_priority_5():
    title = 'Typo in user welcome message'
    desc = 'There is a typo in the user welcome message displayed on login. The app works fine'

    groqResponse = int(HF.handleBugPriority(title, desc))  # send query to Groq and get the response
    print(groqResponse)
    try:
        assert not groqResponse > 6
    except Exception as e:
        pytest.fail(f"handleBugPriority raised an exception: {e}")


# def test_get_username_by_id_1():
#     userId = 34
#     db = SQLHelper()
#     db.connect()
#     try:
#         res = db.getUsernameById(userId)
#         assert res != True, f"Failed to find user with userId {userId}."
#     except Exception as e:
#         pytest.fail(f"Assigning the result has failed: {e}")
#     finally:
#         db.close()

# def test_get_username_by_id_2():
#     userId = 33
#     db = SQLHelper()
#     db.connect()
#     try:
#         res = db.getUsernameById(userId)
#         assert res != True, f"Failed to assign userId {userId} to bugId "
#     except Exception as e:
#         pytest.fail(f"Assigning the result has failed: {e}")
#     finally:
#         db.close()


# def test_get_username_by_id_3():
#     userId = 5555
#     db = SQLHelper()
#     db.connect()
#     try:
#         res = db.getUsernameById(userId)
#         assert res != True, f"Failed to assign userId {userId} to bugId "
#     except Exception as e:
#         pytest.fail(f"Assigning the result has failed: {e}")
#     finally:
#         db.close()

def test_handle_bug_suggestion():
    title = 'Color of save button is blue instead of green'
    desc = 'Color of save button is blue instead of green, but app works fine and it does not affect anything.'

    groqResponse = HF.handleBugSuggestion(title, desc)  # send query to Groq and get the response
    try:
        assert str(groqResponse).isprintable()
    except Exception as e:
        pytest.fail(f"handleSuggestion raised an exception: {e}")

def should_send_notification(close_date_str, last_notification_date_str):
    today = datetime.now().date()
    close_date = datetime.strptime(close_date_str, '%Y-%m-%d').date()
    last_notification_date = datetime.strptime(last_notification_date_str, '%Y-%m-%d').date() if last_notification_date_str else None
    
    if close_date == today and (last_notification_date is None or last_notification_date != today):
        return True
    return False    

def test_send_message_empty():
    try:
        db = SQLHelper()  
        db.connect()  
        response = HF.sendMessage(1, 2, "", db)
        if response != "Message cannot be empty.":
            raise AssertionError()
    except Exception:
        pytest.fail(f"sendMessage raised an exception on empty message.")

def test_send_message_invalid_ids():
    try:
        db = SQLHelper()  
        db.connect()  
        response = HF.sendMessage("one", 2, "Hello, World!", db)
        if response != "Invalid user IDs.":
            raise AssertionError()
    except Exception:
        pytest.fail(f"sendMessage raised an exception on invalid user IDs.")

def test_send_message_whitespace_message():
    try:
        db = SQLHelper()  
        db.connect()  
        response = HF.sendMessage(1, 2, "   ", db)
        if response != "Message cannot be empty.":
            raise AssertionError()
    except Exception:
        pytest.fail(f"sendMessage raised an exception on whitespace message.")    

# def test_edit_comment_on_bug():
#    commentId = 60
#    newCommentInfo = "This is the new comment info"
#    db = SQLHelper()
#    db.connect()
#    try:
#        res = db.editCommentOnBug(commentId, newCommentInfo)
#        assert res, f"Failed to edit comment info on comment with id {commentId} "
#    except Exception as e:
#        pytest.fail(f"Assigning the result has failed: {e}")
#    finally:
#        db.close()
#    return False     

# def test_get_reports():
#     db = SQLHelper()
#     db.connect()
#     managerId = 3
#     try:
#         reportList = db.getReports(managerId)
#         assert reportList != None, 'Failed to perform database query to get reports.'
#     except Exception as e:
#         pytest.fail(f"getReports raised an exception: {e}")
#     finally:
#         db.close()

# def test_create_report():
#     db = SQLHelper()
#     db.connect()
#     currentDate = datetime.today().strftime('%d/%m/%Y') # get current date
#     currentTime = datetime.now().strftime("%H:%M:%S") # get current time
#     managerId = 3
#     try:
#         if not db.createReport(managerId, currentDate, currentTime): # call db function to create report
#             raise RuntimeError('Failed to perform database query to create report.')
#     except Exception as e:
#         pytest.fail(f"createReport raised an exception: {e}")
#     finally:
#         db.cursor.execute('DELETE FROM Reports WHERE creationDate = ? AND creationTime = ?', currentDate, currentTime) 
#         db.connection.commit()
#         db.close()

# def test_get_managers_id():
#     db = SQLHelper()
#     db.connect()
#     try:
#         managersList = db.getManagersId()
#         assert managersList != None, 'Failed to perform database query to get managers.'
#     except Exception as e:
#         pytest.fail(f"getManagersId raised an exception: {e}")
#     finally:
#         db.close()

