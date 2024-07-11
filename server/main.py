from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from abc import ABC
import pyodbc
import os


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
    
    

# ==================================================================================================================== #

# ======================================================User-Class==================================================== #
# class that represents user in website
class User:
    # constructor of user class
    def __init__(self, userId, email, userName, fName, lName, userType):
        self.userId = userId
        self.email = email
        self.userName = userName
        self.fName = fName
        self.lName = lName
        self.userType = userType

    # method for getting a dictionary representation of user object
    def toDict(self):
        userDict = {
            'userId': self.userId,
            'email': self.email,
            'username': self.userName,
            'fName': self.fName,
            'lName': self.lName,
            'userType': self.userType
        }
        return userDict

# ==================================================================================================================== #

# =====================================================BugFixer======================================================= #

# class that includes various fucntions for interacting with db and using various features in website
class BugFixer(ABC):
       
    # function for changing user's info like userName, fname, lname
    @app.route('/userSettings/changeUserInfo', methods=['GET'])
    def changeUserInfo():
        data = request.get_json()
        if db.updateUserInfo(globalUser.userId, data.get('newUserName'), data.get('newFname'), data.get('newLname')):
            return jsonify({'success': 'Changed user info succusfully'})
        else:
            return jsonify({'error': 'failed to perform database query'})
    

# ==================================================================================================================== #

# function that checks database users
@app.route('/api/users', methods=['GET'])
def users():
    db.cursor.execute('SELECT * FROM users') 
    users = db.cursor.fetchall()
    userList = [dict(zip([column[0] for column in db.cursor.description], row)) for row in users]
    return jsonify(userList)

# example function for testing Jenkins
def add(a, b):
    """Return the sum of a and b."""
    return a + b

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
