
from datetime import date
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import (
    Invoice,
    InvoiceLine,
    Subscription,
    SubscriptionLine,
    User
)

invoices_bp = Blueprint(
    "invoices",
    __name__,
    url_prefix="/api/invoices"
)


def serialize_invoice(invoice):
    lines = InvoiceLine.query.filter_by(
        invoice_id=invoice.id
    ).all()

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "subscription_id": invoice.subscription_id,
        "customer_id": invoice.customer_id,
        "issue_date": invoice.issue_date.isoformat()
        if invoice.issue_date else None,
        "due_date": invoice.due_date.isoformat()
        if invoice.due_date else None,
        "subtotal": float(invoice.subtotal or 0),
        "tax_total": float(invoice.tax_total or 0),
        "discount_total": float(invoice.discount_total or 0),
        "total": float(invoice.total or 0),
        "amount_paid": float(invoice.amount_paid or 0),
        "status": invoice.status,
        "lines": [
            {
                "id": line.id,
                "product_id": line.product_id,
                "description": line.description,
                "quantity": line.quantity,
                "unit_price": float(line.unit_price),
                "tax_rate": float(line.tax_rate or 0),
                "line_total": float(line.line_total)
            }
            for line in lines
        ]
    }


@invoices_bp.route("/", methods=["POST"])
def create_invoice():
    data = request.get_json(silent=True) or {}

    subscription_id = data.get("subscription_id")

    if not subscription_id:
        return jsonify({
            "success": False,
            "message": "subscription_id is required"
        }), 400

    subscription = db.session.get(
        Subscription, subscription_id
    )

    if not subscription:
        return jsonify({
            "success": False,
            "message": "Subscription not found"
        }), 404

    customer = db.session.get(
        User, subscription.customer_id
    )

    if not customer:
        return jsonify({
            "success": False,
            "message": "Subscription customer not found"
        }), 404

    existing_invoice = Invoice.query.filter_by(
        subscription_id=subscription.id
    ).first()

    if existing_invoice:
        return jsonify({
            "success": False,
            "message": "An invoice already exists for this subscription"
        }), 409

    try:
        issue_date = date.fromisoformat(
            data["issue_date"]
        ) if data.get("issue_date") else date.today()

        due_date = date.fromisoformat(
            data["due_date"]
        ) if data.get("due_date") else issue_date

        if due_date < issue_date:
            raise ValueError(
                "Due date cannot be before issue date"
            )

        tax_rate = Decimal(str(data.get("tax_rate", 0)))

        if tax_rate < 0 or tax_rate > 100:
            raise ValueError(
                "tax_rate must be between 0 and 100"
            )

        if tax_rate != 0:
            raise ValueError(
                "Tax calculation must be configured through the Tax API first"
            )

        discount_total = Decimal(
            str(data.get("discount_total", 0))
        )

        if discount_total < 0:
            raise ValueError(
                "Discount cannot be negative"
            )

        subscription_lines = SubscriptionLine.query.filter_by(
            subscription_id=subscription.id
        ).all()

        if not subscription_lines:
            raise ValueError(
                "Subscription has no product lines"
            )

        invoice_lines = []
        subtotal = Decimal("0.00")

        for line in subscription_lines:
            unit_price = Decimal(str(line.unit_price))
            quantity = int(line.quantity)

            line_total = unit_price * quantity
            subtotal += line_total

            invoice_lines.append({
                "product_id": line.product_id,
                "description": f"Product ID {line.product_id}",
                "quantity": quantity,
                "unit_price": unit_price,
                "tax_rate": Decimal("0"),
                "line_total": line_total
            })

        if discount_total > subtotal:
            raise ValueError(
                "Discount cannot exceed subtotal"
            )

        tax_total = Decimal("0.00")
        total = subtotal + tax_total - discount_total

        invoice = Invoice(
            invoice_number=f"INV-{date.today():%Y%m%d}-{subscription.id:04d}",
            subscription_id=subscription.id,
            customer_id=customer.id,
            issue_date=issue_date,
            due_date=due_date,
            subtotal=subtotal,
            tax_total=tax_total,
            discount_total=discount_total,
            total=total,
            amount_paid=Decimal("0.00"),
            status="unpaid"
        )

        db.session.add(invoice)
        db.session.flush()

        for line_data in invoice_lines:
            db.session.add(InvoiceLine(
                invoice_id=invoice.id,
                product_id=line_data["product_id"],
                description=line_data["description"],
                quantity=line_data["quantity"],
                unit_price=line_data["unit_price"],
                tax_rate=line_data["tax_rate"],
                line_total=line_data["line_total"]
            ))

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Invoice created successfully",
            "invoice": serialize_invoice(invoice)
        }), 201

    except (ValueError, TypeError, InvalidOperation, KeyError) as error:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Invoice could not be created due to a database conflict"
        }), 409


@invoices_bp.route("/", methods=["GET"])
def get_invoices():
    invoices = Invoice.query.order_by(
        Invoice.id.desc()
    ).all()

    return jsonify({
        "success": True,
        "count": len(invoices),
        "invoices": [
            serialize_invoice(invoice)
            for invoice in invoices
        ]
    }), 200


@invoices_bp.route("/<int:invoice_id>", methods=["GET"])
def get_invoice(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)

    if not invoice:
        return jsonify({
            "success": False,
            "message": "Invoice not found"
        }), 404

    return jsonify({
        "success": True,
        "invoice": serialize_invoice(invoice)
    }), 200


@invoices_bp.route("/<int:invoice_id>", methods=["PUT"])
def update_invoice(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)

    if not invoice:
        return jsonify({
            "success": False,
            "message": "Invoice not found"
        }), 404

    data = request.get_json(silent=True) or {}

    try:
        if "due_date" in data:
            due_date = date.fromisoformat(data["due_date"])

            if due_date < invoice.issue_date:
                raise ValueError(
                    "Due date cannot be before issue date"
                )

            invoice.due_date = due_date

        if "status" in data:
            allowed_statuses = [
                "unpaid",
                "paid",
                "partially_paid",
                "overdue",
                "cancelled"
            ]

            if data["status"] not in allowed_statuses:
                raise ValueError("Invalid invoice status")

            invoice.status = data["status"]

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Invoice updated successfully",
            "invoice": serialize_invoice(invoice)
        }), 200

    except (ValueError, TypeError) as error:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

