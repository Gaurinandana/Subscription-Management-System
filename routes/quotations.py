
from flask import Blueprint, request, jsonify
from datetime import datetime, date
from extensions import db
from models import Quotation, Subscription


quotations_bp = Blueprint(
    "quotations",
    __name__,
    url_prefix="/api/quotations"
)


def serialize_quotation(quotation):
    return {
        "id": quotation.id,
        "quotation_number": quotation.quotation_number,
        "subscription_id": quotation.subscription_id,
        "valid_until": quotation.valid_until.isoformat(),
        "status": quotation.status
    }


def parse_valid_until(value):
    if not value:
        raise ValueError("valid_until is required")

    if isinstance(value, date):
        return value

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise ValueError("valid_until must use YYYY-MM-DD format")


# CREATE QUOTATION
@quotations_bp.route("/", methods=["POST"])
def create_quotation():
    data = request.get_json(silent=True) or {}

    subscription_id = data.get("subscription_id")

    try:
        subscription_id = int(subscription_id)
    except (TypeError, ValueError):
        return jsonify({
            "error": "A valid subscription_id is required"
        }), 400

    subscription = db.session.get(Subscription, subscription_id)

    if not subscription:
        return jsonify({"error": "Subscription not found"}), 404

    try:
        valid_until = parse_valid_until(data.get("valid_until"))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    status = data.get("status", "draft")

    if status not in ["draft", "sent", "accepted", "rejected", "expired"]:
        return jsonify({
            "error": "Invalid quotation status"
        }), 400

    quotation_number = data.get("quotation_number")

    if quotation_number is None:
        quotation_number = (
            "QUO-" + datetime.now().strftime("%Y%m%d%H%M%S%f")
        )
    elif not isinstance(quotation_number, str) or not quotation_number.strip():
        return jsonify({
            "error": "quotation_number must be a non-empty string"
        }), 400
    else:
        quotation_number = quotation_number.strip()

    existing = Quotation.query.filter_by(
        quotation_number=quotation_number
    ).first()

    if existing:
        return jsonify({
            "error": "Quotation number already exists"
        }), 409

    quotation = Quotation(
        quotation_number=quotation_number,
        subscription_id=subscription_id,
        valid_until=valid_until,
        status=status
    )

    db.session.add(quotation)
    db.session.commit()

    return jsonify({
        "message": "Quotation created successfully",
        "quotation": serialize_quotation(quotation)
    }), 201


# GET ALL QUOTATIONS
@quotations_bp.route("/", methods=["GET"])
def get_quotations():
    quotations = Quotation.query.order_by(
        Quotation.id.desc()
    ).all()

    return jsonify({
        "quotations": [
            serialize_quotation(quotation)
            for quotation in quotations
        ]
    }), 200


# GET QUOTATION BY ID
@quotations_bp.route("/<int:quotation_id>", methods=["GET"])
def get_quotation(quotation_id):
    quotation = db.session.get(Quotation, quotation_id)

    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404

    return jsonify({
        "quotation": serialize_quotation(quotation)
    }), 200


# UPDATE QUOTATION
@quotations_bp.route("/<int:quotation_id>", methods=["PUT"])
def update_quotation(quotation_id):
    quotation = db.session.get(Quotation, quotation_id)

    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404

    data = request.get_json(silent=True) or {}

    if "subscription_id" in data:
        try:
            subscription_id = int(data["subscription_id"])
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid subscription_id"}), 400

        subscription = db.session.get(Subscription, subscription_id)

        if not subscription:
            return jsonify({"error": "Subscription not found"}), 404

        quotation.subscription_id = subscription_id

    if "quotation_number" in data:
        number = data["quotation_number"]

        if not isinstance(number, str) or not number.strip():
            return jsonify({
                "error": "quotation_number must be a non-empty string"
            }), 400

        number = number.strip()

        existing = Quotation.query.filter(
            Quotation.quotation_number == number,
            Quotation.id != quotation_id
        ).first()

        if existing:
            return jsonify({
                "error": "Quotation number already exists"
            }), 409

        quotation.quotation_number = number

    if "valid_until" in data:
        try:
            quotation.valid_until = parse_valid_until(
                data["valid_until"]
            )
        except ValueError as error:
            return jsonify({"error": str(error)}), 400

    if "status" in data:
        status = data["status"]

        if status not in [
            "draft", "sent", "accepted", "rejected", "expired"
        ]:
            return jsonify({
                "error": "Invalid quotation status"
            }), 400

        quotation.status = status

    db.session.commit()

    return jsonify({
        "message": "Quotation updated successfully",
        "quotation": serialize_quotation(quotation)
    }), 200


# DELETE QUOTATION
@quotations_bp.route("/<int:quotation_id>", methods=["DELETE"])
def delete_quotation(quotation_id):
    quotation = db.session.get(Quotation, quotation_id)

    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404

    db.session.delete(quotation)
    db.session.commit()

    return jsonify({
        "message": "Quotation deleted successfully"
    }), 200
