from flask import Flask, request, jsonify
from flask_mongoengine import MongoEngine
from models import User
import config
import os

app = Flask(__name__)
app.config.from_object(config)

db = MongoEngine(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not all(k in data for k in ["username", "email", "password"]):
        return jsonify({"error": "Missing fields"}), 400

    if User.objects(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    user = User(username=data["username"], email=data["email"])
    user.set_password(data["password"])
    user.save()

    return jsonify({"message": "User registered successfully!"}), 201

print("Loaded MONGO_URI:", os.getenv("MONGO_URI"))

if __name__ == '__main__':
    app.run(debug=True)
