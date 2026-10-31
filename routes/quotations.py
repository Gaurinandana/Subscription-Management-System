
from flask import Blueprint, request, jsonify
from datetime import datetime, date
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Quotation, Subscription, User


quotations_bp = Blueprint(
    "quotations",
    __name__,
    url_prefix="/api/quotations"
)


ALLOWED_STATUSES = [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired"
]


def parse_valid_until(value):
    if not value:
        raise ValueError("valid_until is required")

    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise ValueError("valid_until must use YYYY-MM-DD format")


def refresh_quotation_status(quotation):
    if (
        quotation.status in ["draft", "sent"]
        and quotation.valid_until
        and quotation.valid_until < date.today()
    ):
        quotation.status = "expired"


def serialize_quotation(quotation):
    subscription = db.session.get(
        Subscription,
        quotation.subscription_id
    )

    customer = (
        db.session.get(User, subscription.customer_id)
        if subscription else None
    )

    return {
        "id": quotation.id,
        "quotation_number": quotation.quotation_number,
        "subscription_id": quotation.subscription_id,
        "customer_id": subscription.customer_id if subscription else None,
        "customer_name": customer.full_name if customer else None,
        "customer_email": customer.email if customer else None,
        "valid_until": quotation.valid_until.isoformat()
        if quotation.valid_until else None,
        "status": quotation.status
    }


# CREATE QUOTATION
@quotations_bp.route("/", methods=["POST"])
def create_quotation():
    data = request.get_json(silent=True) or {}

    try:
        subscription_id = int(data.get("subscription_id"))
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "A valid subscription_id is required"
        }), 400

    subscription = db.session.get(Subscription, subscription_id)

    if not subscription:
        return jsonify({
            "success": False,
            "message": "Subscription not found"
        }), 404

    try:
        valid_until = parse_valid_until(data.get("valid_until"))

        if valid_until < date.today():
            raise ValueError("valid_until cannot be in the past")

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    status = data.get("status", "draft")

    if status not in ALLOWED_STATUSES:
        return jsonify({
            "success": False,
            "message": "Invalid quotation status"
        }), 400

    quotation_number = data.get("quotation_number")

    if quotation_number is None:
        quotation_number = (
            "QUO-" + datetime.now().strftime("%Y%m%d%H%M%S%f")
        )
    elif not isinstance(quotation_number, str) or not quotation_number.strip():
        return jsonify({
            "success": False,
            "message": "quotation_number must be a non-empty string"
        }), 400
    else:
        quotation_number = quotation_number.strip()

    existing = Quotation.query.filter_by(
        quotation_number=quotation_number
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "message": "Quotation number already exists"
        }), 409

    quotation = Quotation(
        quotation_number=quotation_number,
        subscription_id=subscription_id,
        valid_until=valid_until,
        status=status
    )

    try:
        db.session.add(quotation)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Quotation created successfully",
            "quotation": serialize_quotation(quotation)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Quotation could not be created due to a database conflict"
        }), 409


# GET ALL QUOTATIONS WITH FILTERS
@quotations_bp.route("/", methods=["GET"])
def get_quotations():
    query = Quotation.query

    status = request.args.get("status")
    subscription_id = request.args.get("subscription_id")

    if status:
        if status not in ALLOWED_STATUSES:
            return jsonify({
                "success": False,
                "message": "Invalid quotation status filter"
            }), 400

        query = query.filter_by(status=status)

    if subscription_id:
        try:
            subscription_id = int(subscription_id)
        except ValueError:
            return jsonify({
                "success": False,
                "message": "subscription_id must be a valid integer"
            }), 400

        query = query.filter_by(
            subscription_id=subscription_id
        )

    quotations = query.order_by(
        Quotation.id.desc()
    ).all()

    for quotation in quotations:
        refresh_quotation_status(quotation)

    db.session.commit()

    return jsonify({
        "success": True,
        "count": len(quotations),
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
        return jsonify({
            "success": False,
            "message": "Quotation not found"
        }), 404

    refresh_quotation_status(quotation)
    db.session.commit()

    return jsonify({
        "success": True,
        "quotation": serialize_quotation(quotation)
    }), 200


# UPDATE QUOTATION
@quotations_bp.route("/<int:quotation_id>", methods=["PUT"])
def update_quotation(quotation_id):
    quotation = db.session.get(Quotation, quotation_id)

    if not quotation:
        return jsonify({
            "success": False,
            "message": "Quotation not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if quotation.status in ["accepted", "rejected", "expired"]:
        return jsonify({
            "success": False,
            "message": "Accepted, rejected, or expired quotations cannot be modified"
        }), 400

    try:
        if "subscription_id" in data:
            subscription_id = int(data["subscription_id"])

            subscription = db.session.get(
                Subscription,
                subscription_id
            )

            if not subscription:
                return jsonify({
                    "success": False,
                    "message": "Subscription not found"
                }), 404

            quotation.subscription_id = subscription_id

        if "quotation_number" in data:
            number = data["quotation_number"]

            if not isinstance(number, str) or not number.strip():
                raise ValueError(
                    "quotation_number must be a non-empty string"
                )

            number = number.strip()

            existing = Quotation.query.filter(
                Quotation.quotation_number == number,
                Quotation.id != quotation_id
            ).first()

            if existing:
                return jsonify({
                    "success": False,
                    "message": "Quotation number already exists"
                }), 409

            quotation.quotation_number = number

        if "valid_until" in data:
            valid_until = parse_valid_until(data["valid_until"])

            if valid_until < date.today():
                raise ValueError("valid_until cannot be in the past")

            quotation.valid_until = valid_until

        if "status" in data:
            status = data["status"]

            if status not in ALLOWED_STATUSES:
                raise ValueError("Invalid quotation status")

            quotation.status = status

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Quotation updated successfully",
            "quotation": serialize_quotation(quotation)
        }), 200

    except (ValueError, TypeError) as error:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Quotation update failed due to a database conflict"
        }), 409


# DELETE QUOTATION
@quotations_bp.route("/<int:quotation_id>", methods=["DELETE"])
def delete_quotation(quotation_id):
    quotation = db.session.get(Quotation, quotation_id)

    if not quotation:
        return jsonify({
            "success": False,
            "message": "Quotation not found"
        }), 404

    if quotation.status == "accepted":
        return jsonify({
            "success": False,
            "message": "Accepted quotations cannot be deleted"
        }), 400

    try:
        db.session.delete(quotation)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Quotation deleted successfully"
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Quotation could not be deleted"
        }), 409
