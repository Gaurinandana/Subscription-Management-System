
from flask import Blueprint, request, jsonify
from decimal import Decimal, InvalidOperation
from datetime import datetime, date

from extensions import db
from models import Discount, Product


discounts_bp = Blueprint(
    "discounts",
    __name__,
    url_prefix="/api/discounts"
)


def serialize_discount(discount):
    return {
        "id": discount.id,
        "name": discount.name,
        "discount_type": discount.discount_type,
        "value": float(discount.value),
        "minimum_purchase": float(discount.minimum_purchase or 0),
        "minimum_quantity": discount.minimum_quantity,
        "start_date": (
            discount.start_date.isoformat()
            if discount.start_date else None
        ),
        "end_date": (
            discount.end_date.isoformat()
            if discount.end_date else None
        ),
        "maximum_uses": discount.maximum_uses,
        "used_count": discount.used_count,
        "product_id": discount.product_id,
        "is_active": discount.is_active
    }


def parse_date(value):
    if value in (None, ""):
        return None

    if isinstance(value, date):
        return value

    if not isinstance(value, str):
        raise ValueError("Dates must use YYYY-MM-DD format")

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Dates must use YYYY-MM-DD format")


def validate_discount(data):
    name = data.get("name")
    discount_type = data.get("discount_type")

    if not isinstance(name, str) or not name.strip():
        raise ValueError("Discount name is required")

    if discount_type not in ["percentage", "fixed"]:
        raise ValueError(
            "discount_type must be percentage or fixed"
        )

    try:
        value = Decimal(str(data.get("value")))
        minimum_purchase = Decimal(
            str(data.get("minimum_purchase", 0))
        )
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Value and minimum_purchase must be numbers")

    if not value.is_finite() or not minimum_purchase.is_finite():
        raise ValueError("Discount amounts must be finite numbers")

    if value <= 0:
        raise ValueError("Discount value must be greater than zero")

    if discount_type == "percentage" and value > 100:
        raise ValueError("Percentage discount cannot exceed 100")

    if minimum_purchase < 0:
        raise ValueError("Minimum purchase cannot be negative")

    try:
        minimum_quantity = int(data.get("minimum_quantity", 1))
    except (TypeError, ValueError):
        raise ValueError("minimum_quantity must be a whole number")

    if minimum_quantity < 1:
        raise ValueError("minimum_quantity must be at least 1")

    start_date = parse_date(data.get("start_date"))
    end_date = parse_date(data.get("end_date"))

    if start_date and end_date and end_date < start_date:
        raise ValueError("End date cannot be before start date")

    maximum_uses = data.get("maximum_uses")

    if maximum_uses in (None, ""):
        maximum_uses = None
    else:
        try:
            maximum_uses = int(maximum_uses)
        except (TypeError, ValueError):
            raise ValueError("maximum_uses must be a whole number")

        if maximum_uses < 1:
            raise ValueError("maximum_uses must be at least 1")

    return {
        "name": name.strip(),
        "discount_type": discount_type,
        "value": value,
        "minimum_purchase": minimum_purchase,
        "minimum_quantity": minimum_quantity,
        "start_date": start_date,
        "end_date": end_date,
        "maximum_uses": maximum_uses
    }


# CREATE DISCOUNT
@discounts_bp.route("/", methods=["POST"])
def create_discount():
    data = request.get_json(silent=True) or {}

    try:
        fields = validate_discount(data)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    product_id = data.get("product_id")

    if product_id not in (None, ""):
        try:
            product_id = int(product_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid product_id"}), 400

        product = db.session.get(Product, product_id)

        if not product:
            return jsonify({"error": "Product not found"}), 404
    else:
        product_id = None

    discount = Discount(
        **fields,
        product_id=product_id,
        is_active=True,
        used_count=0
    )

    db.session.add(discount)
    db.session.commit()

    return jsonify({
        "message": "Discount created successfully",
        "discount": serialize_discount(discount)
    }), 201


# GET ALL DISCOUNTS
@discounts_bp.route("/", methods=["GET"])
def get_discounts():
    discounts = Discount.query.order_by(
        Discount.id.desc()
    ).all()

    return jsonify({
        "discounts": [
            serialize_discount(discount)
            for discount in discounts
        ]
    }), 200


# GET DISCOUNT BY ID
@discounts_bp.route("/<int:discount_id>", methods=["GET"])
def get_discount(discount_id):
    discount = db.session.get(Discount, discount_id)

    if not discount:
        return jsonify({"error": "Discount not found"}), 404

    return jsonify({
        "discount": serialize_discount(discount)
    }), 200


# UPDATE DISCOUNT
@discounts_bp.route("/<int:discount_id>", methods=["PUT"])
def update_discount(discount_id):
    discount = db.session.get(Discount, discount_id)

    if not discount:
        return jsonify({"error": "Discount not found"}), 404

    data = request.get_json(silent=True) or {}

    allowed_fields = [
        "name",
        "discount_type",
        "value",
        "minimum_purchase",
        "minimum_quantity",
        "start_date",
        "end_date",
        "maximum_uses"
    ]

    updated_data = {
        "name": discount.name,
        "discount_type": discount.discount_type,
        "value": discount.value,
        "minimum_purchase": discount.minimum_purchase,
        "minimum_quantity": discount.minimum_quantity,
        "start_date": discount.start_date,
        "end_date": discount.end_date,
        "maximum_uses": discount.maximum_uses
    }

    for field in allowed_fields:
        if field in data:
            updated_data[field] = data[field]

    try:
        fields = validate_discount(updated_data)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    product_id = data.get("product_id", discount.product_id)

    if product_id not in (None, ""):
        try:
            product_id = int(product_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid product_id"}), 400

        product = db.session.get(Product, product_id)

        if not product:
            return jsonify({"error": "Product not found"}), 404
    else:
        product_id = None

    is_active = data.get("is_active", discount.is_active)

    if not isinstance(is_active, bool):
        return jsonify({
            "error": "is_active must be true or false"
        }), 400

    for field, value in fields.items():
        setattr(discount, field, value)

    discount.product_id = product_id
    discount.is_active = is_active

    db.session.commit()

    return jsonify({
        "message": "Discount updated successfully",
        "discount": serialize_discount(discount)
    }), 200


# DELETE (SOFT DEACTIVATE) DISCOUNT
@discounts_bp.route("/<int:discount_id>", methods=["DELETE"])
def delete_discount(discount_id):
    discount = db.session.get(Discount, discount_id)

    if not discount:
        return jsonify({"error": "Discount not found"}), 404

    discount.is_active = False
    db.session.commit()

    return jsonify({
        "message": "Discount deactivated successfully",
        "discount": serialize_discount(discount)
    }), 200
