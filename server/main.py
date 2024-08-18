from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from abc import ABC, abstractmethod
from datetime import datetime
from groq import Groq
from random import randint
import pyodbc
import hashlib
import os
import re
 

# initialize app with flask for backend connection with front end react
app = Flask(__name__)
cors = CORS(app, origins='*')
globalUser = None # this is global user for logged in user
db = None # this is sql database instance for making queries 

# ====================================================SQLHelper-Class================================================== #

# class for handling SQL commands for various features in website
class SQLHelper(ABC):
    connection = None # connecction string for SQL server database
    cursor = None # cursor for executig SQL commands

    # method for connecting to SQL server database
    def connect(self):
        # load environment variables from env file
        load_dotenv()  
        # getting necessary database credentials from env file for database connection
        connectionString = os.getenv('DB_CONNECTION_STRING')
        self.connection = pyodbc.connect(connectionString)
        self.cursor = self.connection.cursor() #initialize cursor 


    # method for closing database connection
    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()


    # method for checking if user exists by email
    def searchUserByEmail(self, email):
        try:
            query = 'SELECT * FROM Users WHERE email = ?'
            self.cursor.execute(query, (email,))
            user = self.cursor.fetchone()
            if user:
                return True
            else:
                return False
        except Exception as e:
            print(f'Error: {e}')
            return False


    # method for searching user in db, returns user obj if found else returns none
    def searchUser(self, email, password):
        try:
            query = 'SELECT * FROM Users WHERE email = ? AND password = ? AND isDeleted = 0'
            passSha = HelperFunctions.toSHA256(password)
            self.cursor.execute(query, (email, passSha,))
            user = self.cursor.fetchone() # use fetchone to find single user 
            if user: # if user found
                if user[5] == "Coder":
                    return Coder(user[0], user[1], user[2], user[3], user[4]) # return Coder obj
                elif user[5] == "Tester":
                    return Tester(user[0], user[1], user[2], user[3], user[4]) # return Tester obj
                elif user[5] == "Manager":
                    return Manager(user[0], user[1], user[2], user[3], user[4]) # return Manager object
                else:
                    raise
            else: # else return none 
                return None
        except Exception as e:
            print(f'Error: {e}')
            return None
        

    # method for updating user userName, fName, lName  in db, returns true or false
    def updateUserInfo(self, userId, newUserName, newFname, newLname):
        try:
            query = 'UPDATE Users SET userName = ?, fname = ?, lname = ? WHERE userId = ?'
            self.cursor.execute(query, (newUserName, newFname, newLname, userId))
            self.connection.commit()  # commit the transaction for update
            if self.cursor.rowcount > 0:
                return True  # Updated successfully
            else:
                return False  # No user found with the given userId
        except Exception as e:
            print(f'Error updating user info: {e}')
            return False  # Error occurred during update


    def updateUserEmail(self, userId, newEmail):
        try:
            query = 'UPDATE Users SET email = ? WHERE userId = ?'
            self.cursor.execute(query, (newEmail, userId))
            self.connection.commit()  # commit the transaction for update
            if self.cursor.rowcount > 0:
                return True  # Updated successfully
            else:
                return False  # No user found with the given userId
        except Exception as e:
            print(f'Error updating user email: {e}')
            return False  # Error occurred during update

        
    # method for adding a new user to the Users table
    def addUser(self, email, userName, fName, lName, userType,password):
        try:
            query = 'INSERT INTO Users (email, userName, fname, lname, userType,password) VALUES (?, ?, ?, ?, ?,?)'
            passSha = HelperFunctions.toSHA256(password)
            self.cursor.execute(query, (email, userName, fName, lName, userType,passSha))
            self.connection.commit()  # commit the transaction for insert
            if self.cursor.rowcount > 0:
                return True
            else:
                return False  # user not inserted

        except Exception as e:
            print(f'Error adding user: {e}')
            self.connection.rollback()  # rollback changes if there's an error
            return False

    
    # method for checking passowrd of user in db, returns true or false
    def checkPassword(self, userId, password):
        try:
            query = 'SELECT * FROM Users WHERE userId = ? AND password = ?'
            passSha = HelperFunctions.toSHA256(password) # get sha256 representation
            self.cursor.execute(query, (userId, passSha,))
            user = self.cursor.fetchone()
            if user:
                return True
            else:
                return False
        except Exception as e:
            print(f'Error: {e}')
            return False
        

    # method for updating passowrd of user in db, returns true or false
    def updatePassword(self, userId, newPassword, oldPassword):
        try:
            query = 'UPDATE Users SET password = ? WHERE userId = ? AND password = ?'
            oldPassSha = HelperFunctions.toSHA256(oldPassword) # get old pass sha256 representation
            newPassSha = HelperFunctions.toSHA256(newPassword) # get new pass sha256 representation
            self.cursor.execute(query, (newPassSha, userId, oldPassSha,))
            self.connection.commit()  # commit the transaction for update
            if self.cursor.rowcount > 0:
                return True
            else:
                return False 
        except Exception as e:
            print(f'Error: {e}')
            return False

        
    # method for searching bug in db by its name\title, returns bug dict, else none
    def searchBug(self, bugName):
        try:
            query = 'SELECT * FROM Bugs WHERE bugName LIKE ?'
            self.cursor.execute(query, ('%' + bugName + '%',))
            bugs = self.cursor.fetchall()
            bugDict = [dict(zip([column[0] for column in self.cursor.description], row)) for row in bugs]

            #checking the return value of the assignedId and get the name of the user. this is needed later in the UI side of things...
            for bug in bugDict:
                if (bug['assignedId'] == None):
                    bug['assignedUsername'] = "Unassigned"
                    bug['assignedId'] = 0
                else:
                    bug['assignedUsername'] = self.getUsernameById(bug['assignedId'])

            return bugDict
        except Exception as e:
            print(f'Error: {e}')
            return None


    # fucntion for getting bugs from database
    def getBugs(self):
        try:
            self.cursor.execute('SELECT * FROM Bugs') 
            bugs = self.cursor.fetchall()
            bugList = [dict(zip([column[0] for column in self.cursor.description], row)) for row in bugs]

            #checking the return value of the assignedId and get the name of the user. this is needed later in the UI side of things...
            for bug in bugList:
                if (bug['assignedId'] == None):
                    bug['assignedUsername'] = "Unassigned"
                    bug['assignedId'] = 0
                else:
                    bug['assignedUsername'] = self.getUsernameById(bug['assignedId'])
                    
            print('Fetched bugs successfully from database')
            return jsonify(bugList)
        except Exception as e:
            return jsonify(f'Error: {e}')


    # insert given bug into the database     
    def insertBug(self, bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, numOfComments, creationDate, openDate, closeDate, category, bugSuggest, updateCounter, updateDates):
        try:
            insert_sql = """
            INSERT INTO Bugs (bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, numOfComments, creationDate, openDate, closeDate, category, bugSuggest, updateCounter, updateDates)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """

            self.cursor.execute(insert_sql, (bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, numOfComments, creationDate, openDate, closeDate, category, bugSuggest, updateCounter, updateDates))
            self.connection.commit()
            print("\nData inserted successfully")
        except Exception as e:
            print(f"Error occurred: {e}")
            raise


    #updating email in edituser
    def updateEmail(self, userId, newEmail):
            try:
                query = 'UPDATE Users SET email = ? WHERE userId = ?'
                self.cursor.execute(query, (newEmail, userId,))
                self.connection.commit()  # commit the transaction for update
                if self.cursor.rowcount > 0:
                    return True
                else:
                    return False 
            except Exception as e:
                print(f'Error: {e}')
                return False
            

    # method for removing a bug from the database using the bug id
    def removeBug(self, bugId):
         try:
             self.cursor.execute('DELETE FROM Bugs WHERE bugId = ?', (bugId,)) 
             self.connection.commit()
             return True
         except Exception as e:
             print(f"Error occurred: {e}")
             raise


    def updateBug(self, bug_id, bugName=None, bugDesc=None, status=None, importance=None, priority=None, assignedId=None, category=None, bugSuggest=None, updateCounter=None, updateDates=None):
        try:
            fields = []
            values = []

            if bugName is not None:
                fields.append("bugName = ?")
                values.append(bugName)

            if bugDesc is not None:
                fields.append("bugDesc = ?")
                values.append(bugDesc)

            if status is not None:
                fields.append("status = ?")
                values.append(status)

            if importance is not None:
                fields.append("importance = ?")
                values.append(importance)

            if priority is not None:
                fields.append("priority = ?")
                values.append(priority)

            if assignedId is not None:
                fields.append("assignedId = ?")
                values.append(assignedId)

            if category is not None:
                fields.append("category = ?")
                values.append(category)

            if bugSuggest is not None:
                fields.append("bugSuggest = ?")
                values.append(bugSuggest)

            if updateCounter is not None:
                fields.append("updateCounter = ?")
                values.append(updateCounter)

            if updateDates is not None:
                fields.append("updateDates = ?")
                temp=','.join(updateDates)
                values.append(temp)  # שמירת תאריכים כטקסט מופרד בפסיקים

            values.append(bug_id)

            if not fields:
                return False

            set_clause = ', '.join(fields)
            query = f"UPDATE Bugs SET {set_clause} WHERE bugId = ?"  # Adjusted to bugId

            self.cursor.execute(query, values)
            self.connection.commit()

            return self.cursor.rowcount > 0
        except Exception as e:
            print(f'Error: {e}')
            return False
        

    # fucntion for getting users from database
    def getUsers(self):
        try:
            self.cursor.execute('SELECT * FROM Users WHERE userType <> \'Manager\' AND isDeleted = 0') 
            users = self.cursor.fetchall()
            userList = [dict(zip([column[0] for column in self.cursor.description], row)) for row in users]
            return jsonify(userList)
        except Exception as e:
            return jsonify(f'Error: {e}')


    # fucntion for deleting user from database
    def deleteUser(self, userId):
        try:
            self.cursor.execute('UPDATE Users SET isDeleted = 1 WHERE userId = ?', (userId,)) 
            self.connection.commit()
            return True
        except Exception as e:
            return False


    def getAllCoders(self):
        try:
            # Establish a new connection for this specific
            load_dotenv()  
            connectionString = os.getenv('DB_CONNECTION_STRING')
            with pyodbc.connect(connectionString) as connection: # this connection and cursor will automatically close at the end of the block
                with connection.cursor() as cursor:
                    self.cursor.execute('SELECT * FROM Users WHERE userType = ?', "Coder")
                    users = cursor.fetchall()
                    print('Fetched data successfully from database')
                    userList = [dict(zip([column[0] for column in self.cursor.description], row)) for row in users]
                    return userList
        except:
            return False
        

    def getUsernameById(self, userId): 
        try:
            self.cursor.execute('SELECT userName FROM Users WHERE userId = ?', (userId,))
            row = self.cursor.fetchone()
            if row is None:
                print(f'No user found with userId: {userId}')
                return None
            userName = row[0]
            return userName
        except:
            return False
        

    def assignUserToBug(self, bugId, userId):
        try:
            query = f"UPDATE Bugs SET assignedId = ? WHERE bugId = ?" 

            self.cursor.execute(query, (userId, bugId,))
            self.connection.commit()

            if self.cursor.rowcount > 0:
                return True
            else:
                return False
        except:
            return False
        

    # Function for getting notifications for a specific user
    def getNotifications(self, user_id):
        try:
            # Establish a new connection for this specific
            load_dotenv()  
            connectionString = os.getenv('DB_CONNECTION_STRING')
            with pyodbc.connect(connectionString) as connection: # this connection and cursor will automatically close at the end of the block
                with connection.cursor() as cursor:
                    self.cursor.execute('SELECT * FROM Notifications WHERE userId = ?', (user_id,))
                    notifications = self.cursor.fetchall()
                    notificationsList = [dict(zip([column[0] for column in self.cursor.description], row)) for row in notifications]
                    return jsonify(notificationsList)
        except Exception as e:
            print(f"An error occurred while fetching notifications: {e}")
            return False


    def markNotificationsAsRead(self,notification_id, read_status):
        try:
            load_dotenv()
            connectionString = os.getenv('DB_CONNECTION_STRING')
            
            with pyodbc.connect(connectionString) as connection:
                with connection.cursor() as cursor:
                    query = """
                    UPDATE Notifications
                    SET [read] = 1
                    WHERE id = ? AND [read] = 0
                    """
                    cursor.execute(query, (notification_id,))
                    connection.commit()
                    
                    if cursor.rowcount > 0:
                        return True
                    else:
                        return False
        except Exception as e:
            print(f"An error occurred while updating notifications: {e}")
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500
        
                
    # Function for pushing notifications for a specific user
    def pushNotificationToUser(self, userId, message):
        sql_query = """
            INSERT INTO Notifications (userId, message, creationDate, creationHour, [read]) 
            VALUES (?, ?, CONVERT(VARCHAR(10), GETDATE(), 120), CONVERT(VARCHAR(8), GETDATE(), 108), 0);
        """
        try:
            self.cursor.execute(sql_query, (userId, message, ))
            self.connection.commit()
            return True
        except Exception as e:
            print(f"An error occurred while pushing a notification to user: {e}")
            return False
        

    # Function for pushing notifications for all user
    def pushNotificationsToAllUsers(self, message):
        sql_query = """
            INSERT INTO Notifications (userId, message, creationDate, creationHour, [read])
            SELECT 
                userId, 
                ?, 
                CONVERT(VARCHAR(10), GETDATE(), 120), 
                CONVERT(VARCHAR(8), GETDATE(), 108),  
                0 
            FROM 
                Users
            WHERE 
                isDeleted = 0; 
        """
        try:
            self.cursor.execute(sql_query, (message, ))
            self.connection.commit()
            return True
        except Exception as e:
            print(f"An error occurred while pushing notifications to all users: {e}")
            return False
        

    # function for getting all reports of desired manager
    def getReports(self, managerId):
        try:
            self.cursor.execute('SELECT * FROM Reports WHERE managerId = ?', (managerId,)) 
            reports = self.cursor.fetchall()
            reportsList = [dict(zip([column[0] for column in self.cursor.description], row)) for row in reports]
            return reportsList
        except Exception as e:
            return None
    

    # function for inserting new report in database
    def createReport(self, managerId, creationDate, creationTime):
        try:
            self.cursor.execute('SELECT COUNT(*) FROM Bugs WHERE status <> \'Done\'')
            openBugs = self.cursor.fetchone()[0]  # get the result of open bugs
            
            self.cursor.execute('SELECT COUNT(*) FROM Bugs WHERE status = \'Done\'')
            closedBugs = self.cursor.fetchone()[0]  # Get the result of closed bugs
            
            self.cursor.execute('SELECT COUNT(*) FROM Bugs WHERE priority > 7')
            priorityBugs = self.cursor.fetchone()[0]  # Get the result of priority bugs
            
            self.cursor.execute('SELECT COUNT(*) FROM Bugs WHERE importance > 7')
            importanceBugs = self.cursor.fetchone()[0]  # Get the result of importance bugs
            
            # insert the report data
            query = 'INSERT INTO Reports (managerId, openBugs, closedBugs, priorityBugs, importanceBugs, creationDate, creationTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
            self.cursor.execute(query, (managerId, openBugs, closedBugs, priorityBugs, importanceBugs, creationDate, creationTime))
            self.connection.commit()  
            
            if self.cursor.rowcount > 0:
                return True
            else:
                return False  # report not inserted

        except Exception as e:
            print(f'Error adding report: {e}')
            self.connection.rollback()  
            return False

          
    # Function for getting all comments of a specific bug using the given bugId
    def getBugCommentsById(self, bugId):
        sql_query = "SELECT * FROM BugComments WHERE bugId = ?"
        try:
            load_dotenv()
            connectionString = os.getenv('DB_CONNECTION_STRING')
            
            with pyodbc.connect(connectionString) as connection:
                with connection.cursor() as cursor:
                    # Fetch all comments for this bug
                    cursor.execute(sql_query, (bugId,)) 
                    comments = cursor.fetchall()
                    commentsList = [dict(zip([column[0] for column in cursor.description], row)) for row in comments]

                    # Fetch all coders and create a dictionary mapping userId in BugComments to userName in Users
                    allCodersList = db.getAllCoders()

                    # Create the userIdToUsername dictionary 
                    userIdToUsername = {}
                    for coder in allCodersList:
                        userIdToUsername[coder['userId']] = coder['userName']

                    # Replace userId with the corresponding username in commentsList
                    for comment in commentsList:
                        if comment['userId'] in userIdToUsername:
                            comment['userId'] = userIdToUsername[comment['userId']]  # Replace userId with userName

                    return jsonify(commentsList)
        except Exception as e:
            return jsonify(f'Error: {e}')
        
        
    # Function for adding a new comment to a bug in the database
    def addCommentToBug(self, bugId, userId, commentInfo):
        sql_query = "INSERT INTO BugComments (bugId, userId, commentInfo) VALUES (?, ?, ?)"
        try:
            self.cursor.execute(sql_query, (bugId, userId, commentInfo, ))
            self.connection.commit()
            return True
        except Exception as e:
            print(f"An error occurred while adding a comment to a bug: {e}")
            return False


    # function for getting all managers id
    def getManagersId(self):
        try:
            self.cursor.execute('SELECT userId FROM Users WHERE userType = \'Manager\' AND isDeleted = 0') 
            managerId = self.cursor.fetchall()
            managersIdList = [dict(zip([column[0] for column in self.cursor.description], row)) for row in managerId]
            return managersIdList
        except Exception as e:
            return None

          
    # Function for editing a comment on a bug by updating the text in the database
    def editCommentOnBug(self, commentId, commentInfo):
        try:
            query = f"UPDATE BugComments SET commentInfo = ? WHERE commentId = ?" 

            self.cursor.execute(query, (commentInfo, commentId,))
            self.connection.commit()

            if self.cursor.rowcount > 0:
                return True
            else:
                return False
        except Exception as e:
            print(f"An error occurred while editing a comment on a bug: {e}")
            return False  
        
      
        
# ==================================================================================================================== #

# ======================================================User-Class==================================================== #
# class that represents user in website
class User(ABC):
    # constructor of user class
    def __init__(self, userId, email, userName, fName, lName, userType):
        self.userId = userId
        self.email = email
        self.userName = userName
        self.fName = fName
        self.lName = lName
        self.userType = userType

    # method for getting a dictionary representation of user object
    @abstractmethod
    def toDict(self):
        pass

# class that represents Coder in website
class Coder(User):
    def __init__(self, userId, email, userName, fName, lName):
        super().__init__(userId, email, userName, fName, lName, userType='Coder')
    
    def toDict(self):
        return {
            'userId': self.userId,
            'email': self.email,
            'userName': self.userName,
            'fName': self.fName,
            'lName': self.lName,
            'userType': self.userType
        }

# class that represents Tester in website
class Tester(User):
    def __init__(self, userId, email, userName, fName, lName):
        super().__init__(userId, email, userName, fName, lName, userType='Tester')
    
    def toDict(self):
        return {
            'userId': self.userId,
            'email': self.email,
            'userName': self.userName,
            'fName': self.fName,
            'lName': self.lName,
            'userType': self.userType
        }

# class that represents Manager in website
class Manager(User):
    def __init__(self, userId, email, userName, fName, lName):
        super().__init__(userId, email, userName, fName, lName, userType='Manager')
    
    def toDict(self):
        return {
            'userId': self.userId,
            'email': self.email,
            'userName': self.userName,
            'fName': self.fName,
            'lName': self.lName,
            'userType': self.userType
        }

# ==================================================================================================================== #

# =====================================================BugFixer-Class================================================= #
# class that includes various fucntions for interacting with db and using various features in website
class BugFixer(ABC):
    # function for refister of user into the website 
    @app.route('/homepage/register', methods=['POST'])
    def register():
        data = request.get_json()
        email = data.get('email')
        userName = data.get('username')
        fName = data.get('name')
        lName = data.get('lastname')
        userType = data.get('userType')
        password = data.get('password')

        # Check if all fields are provided
        if not all([email, userName, fName, lName, userType, password]):
            return jsonify({'error': "Missing fields"}), 400

        # Check if the email already exists
        if db.searchUserByEmail(email):
            return jsonify({"error": "User with this email already exists"}), 400

        # Add the user to the database
        if db.addUser(email, userName, fName, lName, userType, password):
            return jsonify({"message": "User registered successfully"}), 201
        else:
            return jsonify({"error": "Error adding user"}), 500

       
    # function for login of user into the website
    @app.route('/homepage/login', methods=['POST'])
    def login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Check if the user exists and the password matches
        user = db.searchUser(email, password)
        if user:
            global globalUser 
            globalUser = user  # set globalUser object
            return jsonify(user.toDict()), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
        

    # function for changing password of user
    @app.route('/userSettings/changePassword', methods=['POST'])
    def changePassword():
        data = request.get_json()
        if not PasswordChecker.checkInput(data.get('newPassword')):
             return jsonify({'error': 'New password does not meet requirements.'}), 500
        if db.checkPassword(globalUser.userId, data.get('oldPassword')):
            if db.updatePassword(globalUser.userId, data.get('newPassword'), data.get('oldPassword')):
                return jsonify({'success': 'Changed password successfully'}), 200
            else:
                return jsonify({'error': 'Failed to perform database query'}), 500
        else:
            return jsonify({'error': 'Old password is incorrect'}), 500
        

    # function to logout from the website  
    @app.route('/homepage/logout', methods=['POST'])
    def logout():
        global globalUser
        if globalUser:
            globalUser = None
            return jsonify({'message': 'Logged out successfully'}), 200
        else:
            return jsonify({'error': 'No user is logged in'}), 500
        

    # function to getting logged in user 
    @app.route('/userSettings/getUser', methods=['GET'])
    def getUser():
        global globalUser
        #globalUser = db.searchUser('shay@shay.com', 'Shay123') # for testing
        if (globalUser == None):
            return jsonify({'error':'No user is logged in'}), 204
        
        userData = globalUser.toDict() # get user data
        if globalUser and userData:
            return jsonify(userData), 200
        else:
            return jsonify({'error':'No user is logged in'}), 500

    
    # function for changing user's info like userName, fname, lname
    @app.route('/userSettings/changeUserInfo', methods=['POST'])
    def changeUserInfo():
        data = request.get_json()
        if not UserNameChecker.checkInput(data.get('userName')) or not FnameChecker.checkInput(data.get('fName')) or not LnameChecker.checkInput(data.get('lName')):
            return jsonify({'error': 'User info parameters are invalid.'}), 500 
        if db.updateUserInfo(globalUser.userId, data.get('userName'), data.get('fName'), data.get('lName')):
            globalUser.userName = data.get('userName') # update globalUser's userName
            globalUser.fName = data.get('fName') # update globalUser's fName
            globalUser.lName = data.get('lName') # update globalUser's lName
            return jsonify({'success': 'Changed user info successfully'}), 200
        else:
            return jsonify({'error': 'Failed to perform database query'}), 500


    @app.route('/userSettings/changeEmail', methods=['POST'])
    def changeEmail():
        data = request.get_json()
        new_email = data.get('newEmail')
        if db.updateEmail(globalUser.userId, new_email):
            globalUser.email = new_email # update the email in the global user object
            return jsonify({'success': 'Changed email successfully'})
        else:
            return jsonify({'error': 'Failed to perform database query'})
        

    # function for searching bugs by name/title
    @app.route('/homePage/search', methods=['POST'])
    def searchBugs():
        data = request.get_json()
        bugDict = db.searchBug(data.get('searchResult')) # search all matching bugs in db
        if bugDict is not None: 
            return jsonify(bugDict), 200 # return matched bugs in json form
        else: 
            return jsonify({'error': 'Failed to perform database query'}), 500


    # function for getting all bugs from the database using a helper method
    @app.route('/homePage/getBugs', methods=['GET'])
    def getBugs():
        try:
            bugList = db.getBugs()
            return bugList, 200
        except:
            return jsonify({'error': 'Failed to perform database query'}), 500


    # function that gets from the user new bug data (and adds to the database)
    @app.route('/homePage/addBug', methods=['POST'])
    def createBug():
        data = request.json  

        # get bug importance and priority rating from Groq AI
        bugImportance = HelperFunctions.handleBugImportance(data.get('title'), data.get('description'))
        bugPriority = HelperFunctions.handleBugPriority(data.get('title'),data.get('description'))
        bugSuggestion = HelperFunctions.handleBugSuggestion(data.get('title'),data.get('description'))

        # add the priority and importance to the bug after the AI classification
        data["priority"] = bugPriority
        data["importance"] = bugImportance

        if (BugTitleOrDescriptionChecker.checkInput(data.get('title')) == False 
            or BugTitleOrDescriptionChecker.checkInput(data.get('description')) == False
            or BugPriorityOrImportanceChecker.checkInput(data.get('priority')) == False
            or BugPriorityOrImportanceChecker.checkInput(data.get('importance')) == False
            or BugOpenCreationDateChecker(data.get('openDate'), data.get('creationDate')) == False
            or BugCloseDateChecker(data.get('openDate'), data.get('closeDate')) == False):

            return jsonify({'error': 'User entered invalid data'}), 500
        
        try:
            db.insertBug(data.get('title'), 
                1, 
                1,
                data.get('assignedId'), 
                data.get('description'), 
                data.get('status'), 
                bugPriority, 
                bugImportance, 
                0, 
                data.get('creationDate'), 
                data.get('openDate'), 
                data.get('closeDate'),
                data.get('category'),
                bugSuggestion,
                0,  #initial the counter to 0 
                ""
            )
            return jsonify({'message': 'Bug data received successfully'}), 200
        except Exception as e:
            print(f"Error occurred: {e}")
            return jsonify({'error': 'Failed to perform database query'}), 500


    # function for removing bugs, used only by Manager type users
    @app.route('/homePage/removeBug', methods=['POST'])
    def removeBug():
        bugId = request.json
        try:
            db.removeBug(bugId.get('bugId'))
            return jsonify({'message': 'Bug removed successfully'}), 200
        except Exception as e:
            print(f"Error occurred: {e}")
            return jsonify({'error': 'failed to perform database query'}), 500


    # function for updating bugs information using AI
    @app.route('/homePage/updateBug', methods=['POST'])
    def updateBug():
        data = request.json  

        bugId = data.get('bugId')
        bugName = data.get('bugName')
        bugDesc = data.get('bugDesc')
        status = data.get('status')
        category = data.get('category')
        importance = data.get('importance')
        priority = data.get('priority')
        assignedId = data.get('assignedId')
        creationDate = data.get('creationDate')
        openDate = data.get('openDate')
        bugSuggestion = data.get('suggestion')
        updateCounter = data.get('updateCounter')
        updateDates = data.get('updateDates')
        # get bug importance and priority rating from Groq AI
        if data.get('isDescChanged') == '1':
            importance = HelperFunctions.handleBugImportance(bugName, bugDesc)
            priority = HelperFunctions.handleBugPriority(bugName, bugDesc)
            bugSuggestion = HelperFunctions.handleBugSuggestion(data.get('title'),data.get('description'))
        # update database with new values
        if db.updateBug(bugId, bugName, bugDesc, status, importance, priority, assignedId, category, bugSuggestion,updateCounter,updateDates):
             return jsonify({
                'bugId': bugId,
                'bugName': bugName,
                'bugDesc': bugDesc,
                'status': status,
                'category': category,
                'assignedId': assignedId,
                'priority': priority,
                'importance': importance,
                'creationDate': creationDate,
                'openDate': openDate,
                'bugSuggest': bugSuggestion,
                'updateCounter': updateCounter,
                'updateDates': updateDates
                }), 200
        else:
            return jsonify({'error': 'Failed to update bug'}), 500


    # function for getting all users from database
    @app.route('/removeUsers/getUsers', methods=['GET'])
    def getUsers():
        try:
            userList = db.getUsers()
            return userList, 200
        except:
            return jsonify({'error': 'Failed to perform database query'}), 500


    # function for deleting user from database
    @app.route('/removeUsers/deleteUser', methods=['POST'])
    def deleteUser():
        data = request.json
        try:
            if db.deleteUser(data.get('id')):
                return jsonify({'message': 'User removed successfully'}), 200
            else:
                raise
        except:
            return jsonify({'error': 'Failed to perform database query'}), 500


    @app.route('/bug/assignUserToBug', methods=['POST'])
    def assignUserToBug():
        try:
            response = db.assignUserToBug(request.json.get('bugId'), request.json.get('selectedUserId'))
            if (response == False):
                raise ValueError("Could not update assigned user")
            return jsonify({'message': 'User assigned to bug successfully'})
        except Exception as e:
            return jsonify({'error': 'Failed to perform database query', 'message': str(e)})


    @app.route('/bug/getAllCoders', methods=['GET'])
    def getAllCoders():
        try:
            coderList = db.getAllCoders()
            if coderList is None:
                raise ValueError("No coders found")
            return jsonify(coderList)
        except Exception as e:
            return jsonify({'error': 'Failed to perform database query', 'message': str(e)}), 500

        
    @app.route('/notifications/getNotifications', methods=['POST'])
    def get_notifications():
        data = request.json 
        user_id = data['userId']
        try:
            notifications = db.getNotifications(user_id)
            return notifications
        except Exception as e:
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500


    @app.route('/notifications/markNotificationsAsRead', methods=['POST'])
    def mark_notifications_as_read():
        try:
            data = request.json            
            notification_id = data.get('notificationId')
            read_status = data.get('read')

            if not notification_id or read_status is None:
                return jsonify({'error': 'Notification ID and read status are required'}), 400

            result = db.markNotificationsAsRead(notification_id, read_status)
            
            if result:
                return jsonify({'success': True}), 200
            else:
                return jsonify({'error': 'Notification not found or already marked as read'}), 404
        except Exception as e:
            print(f"Error: {e}")  # Log the error for debugging
            return jsonify({'error': 'Internal Server Error'}), 500


    # Function for pushing notifications to a specific user 
    @app.route('/notifications/pushNotificationToUser', methods=['POST'])
    def pushNotificationToUser():
        data = request.json 
        userId = data['userId']
        message = data['message']
        try:
            response = db.pushNotificationToUser(userId, message) 
            if response:
                return jsonify({'message': 'Notification pushed successfully to one user'}), 200
            return jsonify({'error': 'Could not push notification to one user'}), 500
        except Exception as e:
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500

  
    # Function for pushing notifications to ALL users in the database 
    @app.route('/notifications/pushNotificationsToAllUsers', methods=['POST'])
    def pushNotificationsToAllUsers():
        data = request.json 
        message = data['message']
        try:
            response = db.pushNotificationsToAllUsers(message) 
            if response:
                return jsonify({'message': 'Notifications pushed successfully to all users'}), 200
            raise ValueError("Could not push notifications to all users")
        except Exception as e:
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500

          
    # Function for getting all the comments for a bug using the bugId  
    @app.route('/bugComments/getBugCommentsById', methods=['POST'])
    def getBugCommentsById():
        bugId = request.json
        try:
            comments = db.getBugCommentsById(bugId['bug_Id'])
            return comments
        except Exception as e:
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500
        
        
    # Function for adding a comment to a bug in the database
    @app.route('/bugComments/addCommentToBug', methods=['POST'])
    def addCommentToBug():
        data = request.json 
        bugId = data['bugId']
        userId = data['userId']
        commentInfo = data['commentInfo']
        try:
            response = db.addCommentToBug(bugId, userId, commentInfo)
            if response:
                return jsonify({'message': 'Comment added successfully'}), 200
        except Exception as e:
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500


    # function for getting all reports of manager from database
    @app.route('/reports/getReports', methods=['GET'])
    def getReports():
        try:
            global globalUser
            reportList = db.getReports(globalUser.userId)
            return jsonify(reportList), 200
        except:
            return jsonify({'error': 'Failed to perform database query'}), 500

        
    # Function for editing a comment on a bug
    @app.route('/bugComments/editCommentOnBug', methods=['POST'])
    def editCommentOnBug():
        data = request.json 
        commentId = data['commentId']
        commentInfo = data['commentInfo']
        try:
            response = db.editCommentOnBug(commentId, commentInfo)
            if response:
                return jsonify({'message': 'Comment added successfully'}), 200
        except Exception as e:
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500
        


    # function for getting all reports of manager from database
    @app.route('/reports/createReport', methods=['POST'])
    def createReport():
        data = request.json 
        managerId = data.get('managerId')
        try:
            currentDate = datetime.today().strftime('%d/%m/%Y') # get current date
            currentTime = datetime.now().strftime("%H:%M:%S") # get current time
            if (db.createReport(managerId, currentDate, currentTime)): # call db function to create report
                return jsonify({'message': 'Created report successfully'}), 200
            else:
                raise
        except:
            return jsonify({'error': 'Failed to perform database query'}), 500
        

    # function for getting all manager ids from database
    @app.route('/getManagersId', methods=['GET'])
    def getManagersId():
        try:
            managersIdList = db.getManagersId()
            if managersIdList:
                return jsonify(managersIdList), 200
            else:
                raise
        except:
            return jsonify({'error': 'Failed to perform database query'}), 500
            
        

# ==================================================================================================================== #

# ================================================InputChecker-Class================================================== #
# base class for performing regex checks
class InputChecker(ABC):
    pattern = None

    @classmethod
    def setPattern(cls, pattern=None):
        if pattern is not None:
            cls.pattern = re.compile(pattern)
        else:
            cls.pattern = None

    @staticmethod
    @abstractmethod
    def checkInput(*args, **kwargs):
        pass

# class for checking username input from front end
class UserNameChecker(InputChecker):
    @staticmethod
    def checkInput(username):
        UserNameChecker.setPattern(r'^[a-zA-Z0-9]*$')
        return bool(UserNameChecker.pattern.fullmatch(username))

# class for checking firstName input from front end
class FnameChecker(InputChecker):
    @staticmethod
    def checkInput(fName):
        FnameChecker.setPattern(r'^[a-zA-Z]*$')
        return bool(FnameChecker.pattern.fullmatch(fName))

# class for checking lastName input from front end
class LnameChecker(InputChecker):
    @staticmethod
    def checkInput(lName):
        LnameChecker.setPattern(r'^[a-zA-Z]*$')
        return bool(LnameChecker.pattern.fullmatch(lName))

# class for checking passowrd input from front end
class PasswordChecker(InputChecker):
    @staticmethod
    def checkInput(password):
        PasswordChecker.setPattern(r'^(?=.*[A-Z])[^\s\'=]{6,24}$')
        return bool(PasswordChecker.pattern.fullmatch(password))

# class for checking email input from front end
class EmailChecker(InputChecker):
    @staticmethod
    def checkInput(email):
        EmailChecker.setPattern(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        return bool(EmailChecker.pattern.fullmatch(email))

# class for checking bugTitle or bugDescription input from front end
class BugTitleOrDescriptionChecker(InputChecker):
    @staticmethod
    def checkInput(title):
        BugTitleOrDescriptionChecker.setPattern(r'^[a-zA-Z0-9\-_!?(),.%+*/\'"|\[\]{};:<> \s]+$')
        return bool(BugTitleOrDescriptionChecker.pattern.fullmatch(title)) and len(title) > 0

# class for checking bugPriority or bugImportance input from front end
class BugPriorityOrImportanceChecker(InputChecker):
    @staticmethod
    def checkInput(priority):
        try:
            priority_int = int(priority)
        except ValueError:
            return False

        return priority_int >= 0 and priority_int <= 10

# class for checking bugCreationDate input from front end
class BugOpenCreationDateChecker(InputChecker):
    @staticmethod
    def checkInput(open_date, creation_date):
        open_datetime = datetime.strptime(open_date, '%d/%m/%Y')
        creation_datetime = datetime.strptime(creation_date, '%d/%m/%Y')
        return creation_datetime <= open_datetime

# class for checking bugCloseDate input from front end
class BugCloseDateChecker(InputChecker):
    @staticmethod
    def checkInput(open_date, close_date):
        if close_date is None:
            return True

        open_datetime = datetime.strptime(open_date, '%d/%m/%Y')
        close_datetime = datetime.strptime(close_date, '%d/%m/%Y')
        return close_datetime >= open_datetime


# ==================================================================================================================== #

# =============================================HelperFunctions-Class================================================== #
# class for various helper function for testing into etc.
class HelperFunctions(ABC):
    # method for sending query to Groq AI and getting response
    def sendQueryToGroq(text):
        # load environment variables from env file
        load_dotenv()
        # initalize client with api key
        client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )

        # initialize chat with Groq and send http request
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": text,
                }
            ],
            model="llama3-8b-8192",
        )

        # return Groq response 
        return chat_completion.choices[0].message.content
    

    # function for hashing given password with sha-256, retuns hex representation
    def toSHA256(str):
        sha256Obj = hashlib.sha256()
        sha256Obj.update(str.encode('utf-8'))
        hexResult = sha256Obj.hexdigest()
        return hexResult
    

    # function for classifing bugs by their importance using Groq AI
    def handleBugImportance(title, description):
        # response from Groq AI
        groqResponse = None
        # query for Groq AI 
        groqQuery = (
            f'Your task is to classify the importance of a bug based on how critical it is to fix it quickly, you have to replay only with a number from 1 to 10. '
            f'For instance, an important bug might involve a critical failure that renders the app unusable, '
            f'while a less important bug may not affect the core functionality and allows users to continue using the app.\n\n'
            f'Bug Title: {title}\n'
            f'Description: {description}\n\n'
            f'Response: Please rate the importance of this bug on a scale from 1 to 10.\n'
            f'A rating of 1 indicates the bug is of lowest importance, while a rating of 10 signifies it is very important.\n'
            f'Please respond only in a number between 1 and 10.'
        )

        # loop and try to get a valid response from Groq AI
        for _ in range(0, 5):
            groqResponse = HelperFunctions.sendQueryToGroq(groqQuery) # send query to Groq and get the response
            if groqResponse is not None and groqResponse.isdigit(): # if the response is a number we return valid response
                return groqResponse
            
        # else if we falied to gain a valid response from Groq AI we return a random integer
        return randint(1, 10)


    #function for classifing bugs by their Priority using Groq AI
    def handleBugPriority(title, description):
        groqResponse = None
        # query for Groq AI 
        priorityQuery = (
            f'Your task is to determine the priority of this bug based on its impact and urgency. '
            f'Please respond with a number from 1 to 10. '
            f'For example, a critical bug that severely impacts functionality should be rated higher, '
            f'while a minor bug with minimal impact can be rated lower.\n\n'
            f'Bug Title: {title}\n'
            f'Description: {description}\n\n'
            f'Response: Please rate the priority of this bug on a scale from 1 to 10.\n'
            f'A rating of 1 indicates the bug is of lowest priority, while a rating of 10 signifies it is top priority.\n'
            f'Please respond only with a number between 1 and 10.'
        )
        #loop and try to get a valid response from Groq AI
        for _ in range(0, 5):
            groqResponse = HelperFunctions.sendQueryToGroq(priorityQuery) # send query to Groq and get the response
            if groqResponse is not None and groqResponse.isdigit(): # if the response is a number we return valid response
                return groqResponse

        #else if we falied to gain a valid response from Groq AI we return a random integer
        return randint(1, 10)

    
        #function for receving suggestion for bugs by using Groq AI
    def handleBugSuggestion(title, description):
        groqResponse = None
        # query for Groq AI 
        suggestQuery = (
            f'Your task is to suggest a solution to fixing a bug in a certin application. '
            f'Please respond with a text no longer then 2 sentences. '
            f'Please provide a direct answer without any introductory or closing remarks.\n\n'
            f'Bug Title: {title}\n'
            f'Description: {description}\n\n'
            f'Response: Suggest how the coder can fix this certin bug.\n'
        )

        groqResponse = HelperFunctions.sendQueryToGroq(suggestQuery) # send query to Groq and get the response
        if groqResponse is not None: # if the response valid 
            return groqResponse
        else: #else we return empty string
            return ''
        

    # example function for testing Jenkins
    def add(a, b):
        """Return the sum of a and b."""
        return a + b
    
# ==================================================================================================================== #

# ========================================================MAIN======================================================== #
# running the python backend app
if __name__ == '__main__':
    # initialize SQL server connection for database functionality
    db = SQLHelper() 
    try:
        # connect to the sql server database
        db.connect()
        # execute the app and open website
        app.run(debug=True, port=8090)
    except Exception as e:
        print(f'Error, failed to open website...\n {e}')
    finally:
        # close dabase connection after website closes
        db.close() 
