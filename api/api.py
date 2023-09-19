from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)


# @app.route("/api/events", methods=["GET"])
# def get_events():
#     with open("api/events/2023/events-9.json", "r") as f:
#         events = json.load(f)
#     return jsonify(events)


@app.route("/api/events/<year>/<month>", methods=["GET"])
def get_events(year, month):
    file_path = os.path.join("api/events", year, f"events-{month}.json")

    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            events = json.load(f)
        return jsonify(events)
    else:
        return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    app.run(port=8000)
