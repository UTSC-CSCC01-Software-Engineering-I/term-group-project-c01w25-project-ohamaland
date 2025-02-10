from flask import Flask, jsonify
from flask_mongoengine import MongoEngine
from models import User
import config

app = Flask(__name__)
app.config.from_object(config)

db = MongoEngine(app)

@app.route('/')
def home():
    return jsonify({"message": "Flask MongoDB App Running!"})

@app.route('/add_user')
def add_user():
    user = User(username="test_user", email="test@example.com", age=25)
    user.save()
    return jsonify({"message": "User added!"})

if __name__ == '__main__':
    app.run(debug=True)
