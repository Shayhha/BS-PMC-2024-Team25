from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins='*')

# setting up the path for test data
@app.route("/api/users", methods=['GET'])

# temporary data for testing
def users():
    return jsonify(
        {
            "users": [
                'user1',
                'user2',
                'user33333'
            ]
        }
    )

# example function for testing Jenkins
def add(a, b):
    """Return the sum of a and b."""
    return a + b

# running the python backend app
if __name__ == "__main__":
    app.run(debug=True, port=8080)