from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from abc import ABC
import pyodbc
import os
import re
from datetime import datetime
 

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

    def searchUserByEmail(self, email):
        try:
            query = 'SELECT * FROM Users WHERE email = ?'
            self.cursor.execute(query, (email,))
            user = self.cursor.fetchone()
            if user:
                return User(user[0], user[1], user[2], user[3], user[4], user[5])
            else:
                return None
        except Exception as e:
            print(f'Error: {e}')
            return None

     # method for searching user in db, returns user obj if found else returns none
    def searchUser(self, email, password):
        try:
            query = 'SELECT * FROM Users WHERE email = ? AND password = ?'
            self.cursor.execute(query, (email, password,))
            user = self.cursor.fetchone() # use fetchone to find single user 
            if user: # if user found
                return User(user[0], user[1], user[2], user[3], user[4], user[5]) # return user object
            else: # else return none 
                return None
        except Exception as e:
            print(f'Error: {e}')
            return None
        
    # method for updating user userName, fName, lName  in db, returns true or false
    def updateUserInfo(self, userId, newUserName, newFname, newLname):
        try:
            query = 'UPDATE Users SET userName = ?, fname = ?, lname = ? WHERE userId = ?'
            self.cursor.execute(query, (newUserName, newFname, newLname, userId,))
            self.connection.commit()  # commit the transaction for update
            if self.cursor.rowcount > 0:
                return True
            else:
                return False  # user not found
        except Exception as e:
            print(f'Error: {e}')
            return False
        
    # method for adding a new user to the Users table
    def addUser(self, email, userName, fName, lName, userType,password):
        try:
            query = 'INSERT INTO Users (email, userName, fname, lname, userType,password) VALUES (?, ?, ?, ?, ?,?)'
            self.cursor.execute(query, (email, userName, fName, lName, userType,password))
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
            self.cursor.execute(query, (userId, password,))
            user = self.cursor.fetchone()
            if user:
                return True
            else:
                return False
        except Exception as e:
            print(f'Error: {e}')
            return False

    # method for getting passowrd of user in db, retuns none if didnt find password of user
    def getUserPassword(self, userId):
        try:
            query = 'SELECT * FROM Users WHERE userId = ?'
            self.cursor.execute(query, (userId,))
            user = self.cursor.fetchone()
            if user:
                return user[6]
            else:
                return None
        except Exception as e:
            print(f'Error: {e}')
            return None
        
    # method for updating passowrd of user in db, returns true or false
    def updatePassword(self, userId, newPassword, oldPassword):
        try:
            query = 'UPDATE Users SET password = ? WHERE userId = ? AND password = ?'
            self.cursor.execute(query, (newPassword, userId, oldPassword,))
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
            return bugDict
        except Exception as e:
            print(f'Error: {e}')
            return None


    # fucntion for getting bugs from database
    def getBugs(self):
        try:
            db.cursor.execute('SELECT * FROM Bugs') 
            bugs = db.cursor.fetchall()
            print('Connected successfully to database')
            bugList = [dict(zip([column[0] for column in db.cursor.description], row)) for row in bugs]
            return jsonify(bugList)
        except:
            return jsonify('Failed to connect to database.')

    # insert given bug into the database     
    def insertBug(self, bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, numOfComments, creationDate, openDate, closeDate):
        try:
            # SQL insert statement
            insert_sql = """
            INSERT INTO Bugs (bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, numOfComments, creationDate, openDate, closeDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            
            # Execute the insert statement
            self.cursor.execute(insert_sql, (bugName, projectId, createdId, assignedId, bugDesc, status, priority, importance, numOfComments, creationDate, openDate, closeDate))
            
            # Commit the transaction
            self.connection.commit()
            print("\nData inserted successfully")
        except Exception as e:
            print(f"Error occurred: {e}")
            raise

    # method for removing a bug from the database using the bug id
    def removeBug(self, bugId):
         try:
             self.cursor.execute('DELETE FROM Bugs WHERE bugId = ?', (bugId,)) 
             self.connection.commit()
             return True
         except Exception as e:
             print(f"Error occurred: {e}")
             raise

    def update_bug(self, bug_id, bug_name=None, bug_desc=None, status=None, importance=None, priority=None, assigned_id=None):
        try:
            fields = []
            values = []

            if bug_name is not None:
                fields.append("bugName = ?")
                values.append(bug_name)

            if bug_desc is not None:
                fields.append("bugDesc = ?")
                values.append(bug_desc)

            if status is not None:
                fields.append("status = ?")
                values.append(status)

            if importance is not None:
                fields.append("importance = ?")
                values.append(importance)

            if priority is not None:
                fields.append("priority = ?")
                values.append(priority)

            if assigned_id is not None:
                fields.append("assignedId = ?")
                values.append(assigned_id)

            values.append(bug_id)

            # If there are no fields to update, exit the function
            if not fields:
                return False

            set_clause = ', '.join(fields)
            query = f"UPDATE Bugs SET {set_clause} WHERE bugId = ?"  # Adjusted to bugId

            self.cursor.execute(query, values)
            self.connection.commit()

            if self.cursor.rowcount > 0:
                return True
            else:
                return False
        except Exception as e:
            print(f'Error: {e}')
            return False




    # method for getting a dictionary representation of user object
    def toDict(self):
        userDict = {
            'userId': self.userId,
            'email': self.email,
            'userName': self.userName,
            'fName': self.fName,
            'lName': self.lName,
            'userType': self.userType
        }
        return userDict

# ==================================================================================================================== #

# =====================================================BugFixer-Class================================================= #

# class that includes various fucntions for interacting with db and using various features in website
class BugFixer(ABC):
    # function for refister of user into the website 
    @app.route('/homepage/register', methods=['POST'])
    def register():
        data = request.get_json()
        print(data)
        email = data.get('email')
        userName = data.get('username')
        fName = data.get('name')
        lName = data.get('lastname')
        userType = data.get('userType')
        password=data.get('password')
        
      #  existing_user = User.query.filter_by(email=email).first()
       # if existing_user:
        #    return jsonify({"error": "User with this email already exists"})
        print("HII")
        #if not all([email,userName,fName,lName,userType]):
         #   print("error11")
          #  return jsonify({'error':"missing fields"})
        if db.addUser(email,userName,fName,lName,userType,password) :
            print("OK")
            return jsonify({"message":"User registered successfully"})
        else :
            print("error")
            return jsonify({"error"})

    
       
    # function for login of user into the website
    @app.route('/homepage/login', methods=['POST'])
    def login():

        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
    
      # Check if the user exists by email
        user_by_email = db.searchUserByEmail(email)
        if user_by_email:
            # If the email exists, check the password
            user = db.searchUser(email, password)
            if user:
                global globalUser 
                globalUser = user  # set globalUser object
                return jsonify(user.toDict())
            else:
                return jsonify({'error': 'Incorrect password'})
        else:
            return jsonify({'error': 'Email not found'})
        
    # function for changing password of user
    @app.route('/userSettings/changePassword', methods=['POST'])
    def changePassword():
        data = request.get_json()
        if not HelperFunctions.checkPassword(data.get('newPassword')):
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
            return jsonify({'message':'Logged out successfully'})
        else:
            return jsonify({'error':'No user is logged in'})
        
    # function to getting logged in user 
    @app.route('/userSettings/getUser', methods=['GET'])
    def getUser():
        global globalUser
        globalUser = db.searchUser('shay@shay.com', 'Shay123') # for testing
        userData = globalUser.toDict() # get user data
        if globalUser and userData:
            return jsonify(userData), 200
        else:
            return jsonify({'error':'No user is logged in'}), 500
        
    # function for changing user's info like userName, fname, lname
    @app.route('/userSettings/changeUserInfo', methods=['POST'])
    def changeUserInfo():
        data = request.get_json()
        if not HelperFunctions.checkUserName(data.get('userName')) or not HelperFunctions.checkFname(data.get('fName')) or not HelperFunctions.checkLname(data.get('lName')):
            return jsonify({'error': 'User info parameters are invalid.'}), 500 
        if db.updateUserInfo(globalUser.userId, data.get('userName'), data.get('fName'), data.get('lName')):
            return jsonify({'success': 'Changed user info succusfully'}), 200
        else:
            return jsonify({'error': 'Failed to perform database query'}), 500
        
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
            return bugList
        except:
            return jsonify({'error': 'Failed to perform database query'})

    # function that gets from the user new bug data (and adds to the database)
    @app.route('/homePage/addBug', methods=['POST'])
    def createBug():
        bug_data = request.json  # Assuming JSON data is sent
        if not HelperFunctions.checkBugInfo(bug_data):
            return jsonify({'error': 'User entered invalid data'}), 500

        try:
            db.insertBug(bug_data.get('title'), 
                1, 
                1,
                3, 
                bug_data.get('description'), 
                bug_data.get('status'), 
                bug_data.get('priority'), 
                bug_data.get('importance'), 
                0, 
                bug_data.get('creationDate'), 
                bug_data.get('openDate'), 
                None)
            
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
        
    @app.route('/homePage/updateBug', methods=['POST'])
    def update_bug_route():
        bug_data = request.json  # Assuming JSON data is sent
        bug_id = bug_data.get('bugId')
        bug_name = bug_data.get('bugName')
        bug_desc = bug_data.get('bugDesc')
        status = bug_data.get('status')
        importance = bug_data.get('importance')
        priority = bug_data.get('priority')
        assigned_id = bug_data.get('assignedId')

        if db.update_bug(bug_id, bug_name, bug_desc, status, importance, priority, assigned_id):
            return jsonify({'message': 'Bug updated successfully'})
        else:
            return jsonify({'error': 'Failed to update bug'})




# ==================================================================================================================== #

# =============================================HelperFunctions-Class================================================== #
# class for various helper function for testing into etc.
class HelperFunctions(ABC):

    # check username input from front end
    def checkUserName(username):
        pattern = re.compile(r'^[a-zA-Z0-9]*$')
        if pattern.fullmatch(username):
            return True
        return False
    
    # check firstName input from front end
    def checkFname(fName):
        pattern = re.compile(r'^[a-zA-Z]*$') 
        if pattern.fullmatch(fName):
            return True
        return False
    
    # check lastName input from front end
    def checkLname(lName):
        pattern = re.compile(r'^[a-zA-Z]*$')
        if pattern.fullmatch(lName):
            return True
        return False
    
    # check password input from front end
    def checkPassword(password):
        pattern = re.compile(r'^(?=.*[A-Z])[^\s\'=]{6,24}$')
        if pattern.fullmatch(password):
            return True
        return False
    
    #check email input from frontend
    def checkemail(email):
        pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if pattern.fullmatch(email):
            return True
        return False

    # checking if all bug info is correct 
    def checkBugInfo(bugData):
        if (HelperFunctions.checkBugTitleOrDescription(bugData.get('title')) == False 
            or HelperFunctions.checkBugTitleOrDescription(bugData.get('description')) == False
            or HelperFunctions.checkBugPriorityOrImportance(bugData.get('priority')) == False
            or HelperFunctions.checkBugPriorityOrImportance(bugData.get('importance')) == False
            or HelperFunctions.checkBugOpenCreationDate(bugData.get('openDate'), bugData.get('creationDate')) == False
            or HelperFunctions.checkBugCloseDate(bugData.get('openDate'), bugData.get('creationDate'))==False):
            return False
        return True
    
    def checkBugCloseDate(OpenDate,CloseDate):
        OpenDate = datetime.strptime(OpenDate, '%d/%m/%Y')
        CloseDate = datetime.strptime(CloseDate, '%d/%m/%Y') 

        if CloseDate==None:
            return True
        if CloseDate<OpenDate:
            return False
        else:
            return True
        
    def checkBugTitleOrDescription(title):
        pattern = re.compile(r'^[a-zA-Z0-9\-_!?(),.%+*/\'"|\[\]{};:<> \s]+$')
        if not pattern.fullmatch(title) or len(title) == 0:
            return False
        return True

    def checkBugPriorityOrImportance(priority):
        try:
            priority_int = int(priority)
        except ValueError:
            return False

        if priority_int < 0 or priority_int > 10:
            return False
        return True

    def checkBugOpenCreationDate(openDate, creationDate):
        open_datetime = datetime.strptime(openDate, '%d/%m/%Y')
        creation_datetime = datetime.strptime(creationDate, '%d/%m/%Y')
        
        if  creation_datetime <= open_datetime:
            return True
        else:
            return False

    
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
        db.connect()
        # execute the app and open website
        app.run(debug=True, port=8090)
        # close dabase connection after website closes
        db.close() 
    except:
        print('Failed to connect to database.')
