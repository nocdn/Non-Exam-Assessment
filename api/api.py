from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)


@app.route("/api/events", methods=["GET"])
def get_events():
    with open("api/events.json", "r") as f:
        events = json.load(f)
    return jsonify(events)


if __name__ == "__main__":
    app.run(port=8000)
