
from functools import wraps

from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ==========================================
# HELPER: AUTHENTICATION REQUIRED
# ==========================================

def login_required_api(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        user_id = session.get("user_id")

        if not user_id:
            return jsonify({
                "success": False,
                "message": "Please log in first"
            }), 401

        user = db.session.get(User, user_id)

        if not user or not user.is_active:
            session.clear()

            return jsonify({
                "success": False,
                "message": "Invalid or inactive user session"
            }), 401

        return func(*args, **kwargs)

    return wrapper


# ==========================================
# HELPER: FORMAT USER RESPONSE
# ==========================================

def user_response(user):

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active
    }


# ==========================================
# 1. USER REGISTRATION
# POST /api/auth/register
# ==========================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Request must contain valid JSON"
        }), 400

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not full_name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Full name, email and password are required"
        }), 400

    if len(full_name) > 100:
        return jsonify({
            "success": False,
            "message": "Full name must not exceed 100 characters"
        }), 400

    if len(email) > 120 or "@" not in email:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address"
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "success": False,
            "message": "An account with this email already exists"
        }), 409

    new_user = User(
        full_name=full_name,
        email=email,
        password_hash=generate_password_hash(password),
        role="customer"
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful",
            "user": user_response(new_user)
        }), 201

    except Exception:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Registration failed. Please try again."
        }), 500


# ==========================================
# 2. USER LOGIN
# POST /api/auth/login
# ==========================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Request must contain valid JSON"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash, password
    ):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    if not user.is_active:
        return jsonify({
            "success": False,
            "message": "Your account is inactive"
        }), 403

    session.clear()
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user_response(user)
    }), 200


# ==========================================
# 3. GET CURRENT USER
# GET /api/auth/me
# ==========================================

@auth_bp.route("/me", methods=["GET"])
@login_required_api
def get_current_user():

    user = db.session.get(User, session["user_id"])

    return jsonify({
        "success": True,
        "user": user_response(user)
    }), 200


# ==========================================
# 4. USER LOGOUT
# POST /api/auth/logout
# ==========================================

@auth_bp.route("/logout", methods=["POST"])
@login_required_api
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful"
    }), 200
