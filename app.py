from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

# Allow frontend to connect with Flask backend
CORS(app)


# ==========================================
# DATABASE PATH
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "codeguard.db")


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_db_connection():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    return connection


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return "CodeGuard Backend is Running!"


# ==========================================
# DATABASE TEST
# ==========================================

@app.route("/database")
def database_test():

    connection = get_db_connection()

    result = connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()

    connection.close()

    return {
        "message": "Database Connected Successfully!",
        "tables": [row["name"] for row in result]
    }


# ==========================================
# REGISTER
# ==========================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")


    if not username or not password:

        return jsonify({
            "message": "Username and password are required"
        }), 400


    connection = get_db_connection()


    try:

        connection.execute(
            """
            INSERT INTO users (username, password)
            VALUES (?, ?)
            """,
            (username, password)
        )

        connection.commit()

        connection.close()


        return jsonify({
            "message": "Registration successful!"
        }), 201


    except sqlite3.IntegrityError:

        connection.close()

        return jsonify({
            "message": "Username already exists"
        }), 409


# ==========================================
# LOGIN
# ==========================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")


    if not username or not password:

        return jsonify({
            "message": "Username and password are required"
        }), 400


    connection = get_db_connection()


    user = connection.execute(
        """
        SELECT * FROM users
        WHERE username = ? AND password = ?
        """,
        (username, password)
    ).fetchone()


    connection.close()


    if user:

        return jsonify({
            "message": "Login successful!",
            "username": username
        }), 200


    return jsonify({
        "message": "Invalid username or password"
    }), 401


# ==========================================
# ADD TASK
# ==========================================

@app.route("/tasks", methods=["POST"])
def add_task():

    data = request.get_json()

    task_name = data.get("task_name")
    status = data.get("status")


    if not task_name or not status:

        return jsonify({
            "message": "Task name and status are required"
        }), 400


    connection = get_db_connection()


    connection.execute(
        """
        INSERT INTO tasks (task_name, status)
        VALUES (?, ?)
        """,
        (task_name, status)
    )


    connection.commit()

    connection.close()


    return jsonify({
        "message": "Task added successfully!"
    }), 201


# ==========================================
# GET ALL TASKS
# ==========================================

@app.route("/tasks", methods=["GET"])
def get_tasks():

    connection = get_db_connection()


    tasks = connection.execute(
        "SELECT * FROM tasks"
    ).fetchall()


    connection.close()


    return jsonify([

        {
            "id": task["id"],
            "task_name": task["task_name"],
            "status": task["status"]
        }

        for task in tasks

    ])


# ==========================================
# ADD BUG
# ==========================================

@app.route("/bugs", methods=["POST"])
def add_bug():

    data = request.get_json()

    title = data.get("title")
    severity = data.get("severity")


    if not title or not severity:

        return jsonify({
            "message": "Bug title and severity are required"
        }), 400


    connection = get_db_connection()


    connection.execute(
        """
        INSERT INTO bugs (title, severity)
        VALUES (?, ?)
        """,
        (title, severity)
    )


    connection.commit()

    connection.close()


    return jsonify({
        "message": "Bug added successfully!"
    }), 201


# ==========================================
# GET ALL BUGS
# ==========================================

@app.route("/bugs", methods=["GET"])
def get_bugs():

    connection = get_db_connection()


    bugs = connection.execute(
        "SELECT * FROM bugs"
    ).fetchall()


    connection.close()


    return jsonify([

        {
            "id": bug["id"],
            "title": bug["title"],
            "severity": bug["severity"]
        }

        for bug in bugs

    ])


# ==========================================
# PROJECT RISK
# ==========================================

@app.route("/risk", methods=["GET"])
def calculate_risk():

    connection = get_db_connection()


    bugs = connection.execute(
        "SELECT severity FROM bugs"
    ).fetchall()


    connection.close()


    severities = [
        bug["severity"].lower()
        for bug in bugs
    ]


    # Critical → High Risk
    if "critical" in severities:

        risk = "High"

        status = "Needs Attention"


    # Medium → Medium Risk
    elif "medium" in severities:

        risk = "Medium"

        status = "Moderate"


    # Low / No Bugs → Low Risk
    else:

        risk = "Low"

        status = "Good"


    return jsonify({

        "risk": risk,

        "status": status

    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )