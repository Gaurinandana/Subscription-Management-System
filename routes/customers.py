
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from extensions import db
from models import User


customers_bp = Blueprint(
    "customers",
    __name__,
    url_prefix="/api/customers"
)


def serialize_customer(customer):
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "role": customer.role,
        "is_active": customer.is_active,
        "created_at": (
            customer.created_at.isoformat()
            if customer.created_at else None
        )
    }


# CREATE CUSTOMER
@customers_bp.route("/", methods=["POST"])
def create_customer():
    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not isinstance(full_name, str) or not full_name.strip():
        return jsonify({"error": "Full name is required"}), 400

    if not isinstance(email, str) or not email.strip():
        return jsonify({"error": "Email is required"}), 400

    if not isinstance(password, str) or len(password) < 6:
        return jsonify({
            "error": "Password must contain at least 6 characters"
        }), 400

    email = email.strip().lower()

    existing = User.query.filter_by(email=email).first()

    if existing:
        return jsonify({"error": "Email already exists"}), 409

    customer = User(
        full_name=full_name.strip(),
        email=email,
        password_hash=generate_password_hash(password),
        role="customer",
        is_active=True
    )

    db.session.add(customer)
    db.session.commit()

    return jsonify({
        "message": "Customer created successfully",
        "customer": serialize_customer(customer)
    }), 201


# GET ALL CUSTOMERS
@customers_bp.route("/", methods=["GET"])
def get_customers():
    customers = User.query.filter_by(
        role="customer"
    ).order_by(User.id.desc()).all()

    return jsonify({
        "customers": [
            serialize_customer(customer)
            for customer in customers
        ]
    }), 200


# GET CUSTOMER BY ID
@customers_bp.route("/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = db.session.get(User, customer_id)

    if not customer or customer.role != "customer":
        return jsonify({"error": "Customer not found"}), 404

    return jsonify({
        "customer": serialize_customer(customer)
    }), 200


# UPDATE CUSTOMER
@customers_bp.route("/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    customer = db.session.get(User, customer_id)

    if not customer or customer.role != "customer":
        return jsonify({"error": "Customer not found"}), 404

    data = request.get_json(silent=True) or {}

    if "full_name" in data:
        full_name = data["full_name"]

        if not isinstance(full_name, str) or not full_name.strip():
            return jsonify({"error": "Invalid full name"}), 400

        customer.full_name = full_name.strip()

    if "email" in data:
        email = data["email"]

        if not isinstance(email, str) or not email.strip():
            return jsonify({"error": "Invalid email"}), 400

        email = email.strip().lower()

        existing = User.query.filter(
            User.email == email,
            User.id != customer_id
        ).first()

        if existing:
            return jsonify({"error": "Email already exists"}), 409

        customer.email = email

    if "password" in data:
        password = data["password"]

        if not isinstance(password, str) or len(password) < 6:
            return jsonify({
                "error": "Password must contain at least 6 characters"
            }), 400

        customer.password_hash = generate_password_hash(password)

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({
                "error": "is_active must be true or false"
            }), 400

        customer.is_active = data["is_active"]

    db.session.commit()

    return jsonify({
        "message": "Customer updated successfully",
        "customer": serialize_customer(customer)
    }), 200


# DELETE CUSTOMER (SOFT DEACTIVATION)
@customers_bp.route("/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    customer = db.session.get(User, customer_id)

    if not customer or customer.role != "customer":
        return jsonify({"error": "Customer not found"}), 404

    customer.is_active = False
    db.session.commit()

    return jsonify({
        "message": "Customer deactivated successfully",
        "customer": serialize_customer(customer)
    }), 200
