
from datetime import date
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Plan


plans_bp = Blueprint("plans", __name__, url_prefix="/api/plans")


def serialize_plan(plan):
    return {
        "id": plan.id,
        "name": plan.name,
        "billing_interval": plan.billing_interval,
        "price": float(plan.price),
        "minimum_quantity": plan.minimum_quantity,
        "available_from": (
            plan.available_from.isoformat()
            if plan.available_from else None
        ),
        "available_until": (
            plan.available_until.isoformat()
            if plan.available_until else None
        ),
        "auto_close": plan.auto_close,
        "allow_early_close": plan.allow_early_close,
        "allow_pause": plan.allow_pause,
        "allow_renewal": plan.allow_renewal,
        "is_active": plan.is_active
    }


def parse_date(value, field_name):
    if value in (None, ""):
        return None

    try:
        return date.fromisoformat(value)
    except (ValueError, TypeError):
        raise ValueError(
            f"{field_name} must use YYYY-MM-DD format"
        )


def parse_price(value):
    try:
        price = Decimal(str(value))
        if not price.is_finite() or price < 0:
            raise ValueError()
        return price
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Price must be a valid non-negative number")


@plans_bp.route("/", methods=["POST"])
def create_plan():
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    billing_interval = data.get("billing_interval")
    price_value = data.get("price")

    if not name or not isinstance(name, str):
        return jsonify({
            "success": False,
            "message": "Plan name is required"
        }), 400

    if not billing_interval or not isinstance(billing_interval, str):
        return jsonify({
            "success": False,
            "message": "Billing interval is required"
        }), 400

    if price_value is None:
        return jsonify({
            "success": False,
            "message": "Price is required"
        }), 400

    try:
        price = parse_price(price_value)

        minimum_quantity = data.get("minimum_quantity", 1)
        if (
            isinstance(minimum_quantity, bool)
            or not isinstance(minimum_quantity, int)
            or minimum_quantity < 1
        ):
            raise ValueError("Minimum quantity must be a positive integer")

        available_from = parse_date(
            data.get("available_from"), "available_from"
        )
        available_until = parse_date(
            data.get("available_until"), "available_until"
        )

        if (
            available_from and available_until
            and available_until < available_from
        ):
            raise ValueError(
                "available_until cannot be before available_from"
            )

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    plan = Plan(
        name=name.strip(),
        billing_interval=billing_interval.strip(),
        price=price,
        minimum_quantity=minimum_quantity,
        available_from=available_from,
        available_until=available_until,
        auto_close=data.get("auto_close", False),
        allow_early_close=data.get("allow_early_close", True),
        allow_pause=data.get("allow_pause", True),
        allow_renewal=data.get("allow_renewal", True),
        is_active=data.get("is_active", True)
    )

    try:
        db.session.add(plan)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Plan created successfully",
            "plan": serialize_plan(plan)
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Could not create plan"
        }), 500


@plans_bp.route("/", methods=["GET"])
def get_plans():
    plans = Plan.query.order_by(Plan.id.desc()).all()

    return jsonify({
        "success": True,
        "count": len(plans),
        "plans": [serialize_plan(plan) for plan in plans]
    }), 200


@plans_bp.route("/<int:plan_id>", methods=["GET"])
def get_plan(plan_id):
    plan = db.session.get(Plan, plan_id)

    if not plan:
        return jsonify({
            "success": False,
            "message": "Plan not found"
        }), 404

    return jsonify({
        "success": True,
        "plan": serialize_plan(plan)
    }), 200


@plans_bp.route("/<int:plan_id>", methods=["PUT"])
def update_plan(plan_id):
    plan = db.session.get(Plan, plan_id)

    if not plan:
        return jsonify({
            "success": False,
            "message": "Plan not found"
        }), 404

    data = request.get_json(silent=True) or {}

    try:
        if "name" in data:
            if not isinstance(data["name"], str) or not data["name"].strip():
                raise ValueError("Plan name cannot be empty")
            plan.name = data["name"].strip()

        if "billing_interval" in data:
            if (
                not isinstance(data["billing_interval"], str)
                or not data["billing_interval"].strip()
            ):
                raise ValueError("Billing interval cannot be empty")
            plan.billing_interval = data["billing_interval"].strip()

        if "price" in data:
            plan.price = parse_price(data["price"])

        if "minimum_quantity" in data:
            quantity = data["minimum_quantity"]
            if (
                isinstance(quantity, bool)
                or not isinstance(quantity, int)
                or quantity < 1
            ):
                raise ValueError("Minimum quantity must be a positive integer")
            plan.minimum_quantity = quantity

        if "available_from" in data:
            plan.available_from = parse_date(
                data["available_from"], "available_from"
            )

        if "available_until" in data:
            plan.available_until = parse_date(
                data["available_until"], "available_until"
            )

        if (
            plan.available_from and plan.available_until
            and plan.available_until < plan.available_from
        ):
            raise ValueError(
                "available_until cannot be before available_from"
            )

        for field in (
            "auto_close",
            "allow_early_close",
            "allow_pause",
            "allow_renewal",
            "is_active"
        ):
            if field in data:
                if not isinstance(data[field], bool):
                    raise ValueError(f"{field} must be true or false")
                setattr(plan, field, data[field])

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Plan updated successfully",
            "plan": serialize_plan(plan)
        }), 200

    except ValueError as error:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except Exception:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Could not update plan"
        }), 500


@plans_bp.route("/<int:plan_id>", methods=["DELETE"])
def delete_plan(plan_id):
    plan = db.session.get(Plan, plan_id)

    if not plan:
        return jsonify({
            "success": False,
            "message": "Plan not found"
        }), 404

    try:
        db.session.delete(plan)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Plan deleted successfully"
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Cannot delete a plan that is used by subscriptions"
        }), 409
