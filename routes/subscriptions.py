
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from uuid import uuid4

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import (
    User,
    Plan,
    Product,
    ProductVariant,
    Subscription,
    SubscriptionLine
)

subscriptions_bp = Blueprint(
    "subscriptions",
    __name__,
    url_prefix="/api/subscriptions"
)


def serialize_subscription(subscription):
    lines = SubscriptionLine.query.filter_by(
        subscription_id=subscription.id
    ).all()

    return {
        "id": subscription.id,
        "subscription_number": subscription.subscription_number,
        "customer_id": subscription.customer_id,
        "plan_id": subscription.plan_id,
        "start_date": subscription.start_date.isoformat()
        if subscription.start_date else None,
        "expiry_date": subscription.expiry_date.isoformat()
        if subscription.expiry_date else None,
        "next_billing_date": subscription.next_billing_date.isoformat()
        if subscription.next_billing_date else None,
        "payment_terms_days": subscription.payment_terms_days,
        "status": subscription.status,
        "created_at": subscription.created_at.isoformat()
        if subscription.created_at else None,
        "lines": [
            {
                "id": line.id,
                "product_id": line.product_id,
                "variant_id": line.variant_id,
                "quantity": line.quantity,
                "unit_price": float(line.unit_price)
            }
            for line in lines
        ]
    }


def parse_date(value, field_name):
    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except (ValueError, TypeError):
        raise ValueError(
            f"{field_name} must use YYYY-MM-DD format"
        )


@subscriptions_bp.route("/", methods=["POST"])
def create_subscription():
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")
    plan_id = data.get("plan_id")
    lines_data = data.get("lines", [])

    if not customer_id or not plan_id:
        return jsonify({
            "success": False,
            "message": "customer_id and plan_id are required"
        }), 400

    if not isinstance(lines_data, list) or not lines_data:
        return jsonify({
            "success": False,
            "message": "At least one subscription line is required"
        }), 400

    customer = db.session.get(User, customer_id)
    if not customer:
        return jsonify({
            "success": False,
            "message": "Customer not found"
        }), 404

    if not customer.is_active:
        return jsonify({
            "success": False,
            "message": "Customer account is inactive"
        }), 400

    plan = db.session.get(Plan, plan_id)
    if not plan or not plan.is_active:
        return jsonify({
            "success": False,
            "message": "Active plan not found"
        }), 404

    try:
        start_date = parse_date(
            data.get("start_date"),
            "start_date"
        )
        expiry_date = parse_date(
            data.get("expiry_date"),
            "expiry_date"
        )
        next_billing_date = parse_date(
            data.get("next_billing_date"),
            "next_billing_date"
        )

        if not start_date:
            start_date = date.today()

        if expiry_date and expiry_date < start_date:
            raise ValueError(
                "expiry_date cannot be before start_date"
            )

        payment_terms_days = int(
            data.get("payment_terms_days", 0)
        )

        if payment_terms_days < 0:
            raise ValueError(
                "payment_terms_days cannot be negative"
            )

        subscription = Subscription(
            subscription_number=f"SUB-{datetime.now():%Y%m%d}-{uuid4().hex[:8].upper()}",
            customer_id=customer.id,
            plan_id=plan.id,
            start_date=start_date,
            expiry_date=expiry_date,
            next_billing_date=next_billing_date,
            payment_terms_days=payment_terms_days,
            status="draft"
        )

        db.session.add(subscription)
        db.session.flush()

        for item in lines_data:
            product_id = item.get("product_id")
            variant_id = item.get("variant_id")
            quantity = int(item.get("quantity", 1))

            if not product_id:
                raise ValueError(
                    "product_id is required for every line"
                )

            if quantity <= 0:
                raise ValueError(
                    "Quantity must be greater than zero"
                )

            product = db.session.get(Product, product_id)

            if not product or not product.is_active:
                raise ValueError(
                    f"Active product {product_id} not found"
                )

            unit_price = Decimal(str(product.sales_price))

            if variant_id:
                variant = db.session.get(
                    ProductVariant, variant_id
                )

                if not variant or variant.product_id != product.id:
                    raise ValueError(
                        "Invalid variant for the selected product"
                    )

                unit_price += Decimal(
                    str(variant.price_adjustment or 0)
                )

            if unit_price < 0:
                raise ValueError(
                    "Unit price cannot be negative"
                )

            line = SubscriptionLine(
                subscription_id=subscription.id,
                product_id=product.id,
                variant_id=variant_id,
                quantity=quantity,
                unit_price=unit_price
            )

            db.session.add(line)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Subscription created successfully",
            "subscription": serialize_subscription(subscription)
        }), 201

    except (ValueError, TypeError, InvalidOperation) as error:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Could not create subscription due to a database conflict"
        }), 409


@subscriptions_bp.route("/", methods=["GET"])
def get_subscriptions():
    subscriptions = Subscription.query.order_by(
        Subscription.id.desc()
    ).all()

    return jsonify({
        "success": True,
        "count": len(subscriptions),
        "subscriptions": [
            serialize_subscription(subscription)
            for subscription in subscriptions
        ]
    }), 200


@subscriptions_bp.route("/<int:subscription_id>", methods=["GET"])
def get_subscription(subscription_id):
    subscription = db.session.get(
        Subscription, subscription_id
    )

    if not subscription:
        return jsonify({
            "success": False,
            "message": "Subscription not found"
        }), 404

    return jsonify({
        "success": True,
        "subscription": serialize_subscription(subscription)
    }), 200


@subscriptions_bp.route(
    "/<int:subscription_id>",
    methods=["PUT"]
)
def update_subscription(subscription_id):
    subscription = db.session.get(
        Subscription, subscription_id
    )

    if not subscription:
        return jsonify({
            "success": False,
            "message": "Subscription not found"
        }), 404

    data = request.get_json(silent=True) or {}

    try:
        if "status" in data:
            allowed_statuses = [
                "draft",
                "active",
                "paused",
                "cancelled",
                "expired"
            ]

            if data["status"] not in allowed_statuses:
                raise ValueError(
                    "Invalid subscription status"
                )

            subscription.status = data["status"]

        if "start_date" in data:
            subscription.start_date = parse_date(
                data["start_date"], "start_date"
            )

        if "expiry_date" in data:
            subscription.expiry_date = parse_date(
                data["expiry_date"], "expiry_date"
            )

        if "next_billing_date" in data:
            subscription.next_billing_date = parse_date(
                data["next_billing_date"],
                "next_billing_date"
            )

        if "payment_terms_days" in data:
            days = int(data["payment_terms_days"])

            if days < 0:
                raise ValueError(
                    "payment_terms_days cannot be negative"
                )

            subscription.payment_terms_days = days

        if (
            subscription.expiry_date
            and subscription.start_date
            and subscription.expiry_date < subscription.start_date
        ):
            raise ValueError(
                "expiry_date cannot be before start_date"
            )

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Subscription updated successfully",
            "subscription": serialize_subscription(subscription)
        }), 200

    except (ValueError, TypeError) as error:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400
