
from flask import Blueprint, request, jsonify
from decimal import Decimal, InvalidOperation

from extensions import db
from models import Tax

taxes_bp = Blueprint("taxes", __name__, url_prefix="/api/taxes")


@taxes_bp.route("/", methods=["POST"])
def create_tax():
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    rate = data.get("rate")

    if not name or rate is None:
        return jsonify({
            "success": False,
            "message": "Tax name and rate are required"
        }), 400

    try:
        rate = Decimal(str(rate))
    except (InvalidOperation, ValueError):
        return jsonify({
            "success": False,
            "message": "Invalid tax rate"
        }), 400

    if not rate.is_finite() or rate < 0 or rate > 100:
        return jsonify({
            "success": False,
            "message": "Tax rate must be between 0 and 100"
        }), 400

    tax = Tax(name=name.strip(), rate=rate, is_active=True)

    if not tax.name:
        return jsonify({
            "success": False,
            "message": "Tax name cannot be empty"
        }), 400

    db.session.add(tax)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Tax created successfully",
        "tax": {
            "id": tax.id,
            "name": tax.name,
            "rate": float(tax.rate),
            "is_active": tax.is_active
        }
    }), 201


@taxes_bp.route("/", methods=["GET"])
def get_taxes():
    taxes = Tax.query.order_by(Tax.id.desc()).all()

    return jsonify({
        "success": True,
        "taxes": [
            {
                "id": tax.id,
                "name": tax.name,
                "rate": float(tax.rate),
                "is_active": tax.is_active
            }
            for tax in taxes
        ]
    }), 200


@taxes_bp.route("/<int:tax_id>", methods=["GET"])
def get_tax(tax_id):
    tax = db.session.get(Tax, tax_id)

    if not tax:
        return jsonify({
            "success": False,
            "message": "Tax not found"
        }), 404

    return jsonify({
        "success": True,
        "tax": {
            "id": tax.id,
            "name": tax.name,
            "rate": float(tax.rate),
            "is_active": tax.is_active
        }
    }), 200


@taxes_bp.route("/<int:tax_id>", methods=["PUT"])
def update_tax(tax_id):
    tax = db.session.get(Tax, tax_id)

    if not tax:
        return jsonify({
            "success": False,
            "message": "Tax not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            return jsonify({
                "success": False,
                "message": "Tax name cannot be empty"
            }), 400
        tax.name = data["name"].strip()

    if "rate" in data:
        try:
            rate = Decimal(str(data["rate"]))
        except (InvalidOperation, ValueError):
            return jsonify({
                "success": False,
                "message": "Invalid tax rate"
            }), 400

        if not rate.is_finite() or rate < 0 or rate > 100:
            return jsonify({
                "success": False,
                "message": "Tax rate must be between 0 and 100"
            }), 400

        tax.rate = rate

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({
                "success": False,
                "message": "is_active must be true or false"
            }), 400
        tax.is_active = data["is_active"]

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Tax updated successfully",
        "tax": {
            "id": tax.id,
            "name": tax.name,
            "rate": float(tax.rate),
            "is_active": tax.is_active
        }
    }), 200


@taxes_bp.route("/<int:tax_id>", methods=["DELETE"])
def delete_tax(tax_id):
    tax = db.session.get(Tax, tax_id)

    if not tax:
        return jsonify({
            "success": False,
            "message": "Tax not found"
        }), 404

    # Deactivate instead of permanently deleting tax records.
    tax.is_active = False
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Tax deactivated successfully"
    }), 200
