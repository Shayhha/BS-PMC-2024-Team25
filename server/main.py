from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from abc import ABC
import pyodbc
import os


# initialize app with flask for backend connection with front end react
app = Flask(__name__)
cors = CORS(app, origins='*')

# class for handling SQL commands for various features in website
class SQLHelper(ABC):
    connection = None # connecction string for SQL server database
    cursor = None # cursor for executig SQL commands

    # constructor of class SQLHelper
    def __init__(self):
        load_dotenv()  # load environment variables from env file

    # method for connecting to SQL server database
    def connect(self):
        # getting necessary database credentials from env file for database connection
        server = os.getenv('DB_SERVER')
        database = os.getenv('DB_DATABASE')
        username = os.getenv('DB_USERNAME')
        password = os.getenv('DB_PASSWORD')

        if not all([server, database, username, password]): # if failed to get one we raise exception
            raise ValueError('Database credentials are not fully provided.')
        
        # connecting with predefined info
        connectionString = (
            f'DRIVER={{ODBC Driver 17 for SQL Server}};'
            f'SERVER={server};'
            f'DATABASE={database};'
            f'UID={username};'
            f'PWD={password};'
        )
        self.connection = pyodbc.connect(connectionString)
        self.cursor = self.connection.cursor() #initialize cursor 
    
    # method for closing database connection
    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()


# function that checks database users
@app.route('/api/users', methods=['GET'])
def users():
    sqlHelper = SQLHelper()
    try:
        sqlHelper.connect()
        sqlHelper.cursor.execute('SELECT * FROM users') 
        users = sqlHelper.cursor.fetchall()
        print('Connected successfully to database')
        userList = [dict(zip([column[0] for column in sqlHelper.cursor.description], row)) for row in users]
        return jsonify(userList)
    except:
        sqlHelper.close()
        return jsonify('Failed to connect to database.')


# example function for testing Jenkins
def add(a, b):
    """Return the sum of a and b."""
    return a + b


# running the python backend app
if __name__ == '__main__':
    # initialize SQL server connection for database functionality
    SQLDatabase = SQLHelper() 
    try:
        #SQLDatabase.connect()
        # execute the app and open website
        app.run(debug=True, port=8090)
        # close dabase connection after website closes
        #SQLDatabase.close() 
    except:
        print('Failed to connect to database.')
