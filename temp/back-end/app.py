from flask import Flask
from flask import request, jsonify


app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/greet")
def greet():
    return "Hello again!"


@app.route("/user/<username>")
def show_user_profile(username):
    return f"User {username}"


@app.route("/api/events", methods=["GET"])
def get_events():
    return {"event1": "Birthday", "event2": "Meeting"}


@app.route("/api/events", methods=["POST"])
def add_event():
    event = request.json["event"]
    return jsonify({"message": f"Event {event} added"}), 201
