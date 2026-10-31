
from datetime import date
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Payment, Invoice

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


def serialize_payment(payment):
    return {
        "id": payment.id,
        "invoice_id": payment.invoice_id,
        "payment_method": payment.payment_method,
        "amount": float(payment.amount),
        "payment_date": payment.payment_date.isoformat(),
        "note": payment.note
    }


@payments_bp.route("/", methods=["POST"])
def create_payment():
    data = request.get_json(silent=True) or {}

    invoice_id = data.get("invoice_id")
    payment_method = data.get("payment_method")
    amount = data.get("amount")
    payment_date = data.get("payment_date", date.today().isoformat())
    note = data.get("note")

    if not invoice_id or not payment_method or amount is None:
        return jsonify({
            "success": False,
            "message": "invoice_id, payment_method and amount are required"
        }), 400

    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({
            "success": False,
            "message": "Invoice not found"
        }), 404

    try:
        payment_amount = Decimal(str(amount))
        parsed_date = date.fromisoformat(payment_date)
    except (InvalidOperation, ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid amount or payment_date"
        }), 400

    if payment_amount <= 0:
        return jsonify({
            "success": False,
            "message": "Payment amount must be greater than zero"
        }), 400

    if payment_amount > Decimal(str(invoice.total)) - Decimal(str(invoice.amount_paid)):
        return jsonify({
            "success": False,
            "message": "Payment amount exceeds the remaining invoice balance"
        }), 400

    payment = Payment(
        invoice_id=invoice.id,
        payment_method=str(payment_method).strip(),
        amount=payment_amount,
        payment_date=parsed_date,
        note=note
    )

    invoice.amount_paid = Decimal(str(invoice.amount_paid)) + payment_amount

    if invoice.amount_paid >= Decimal(str(invoice.total)):
        invoice.status = "paid"
    else:
        invoice.status = "partially_paid"

    try:
        db.session.add(payment)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Could not save payment"
        }), 400

    return jsonify({
        "success": True,
        "message": "Payment recorded successfully",
        "payment": serialize_payment(payment),
        "invoice": {
            "id": invoice.id,
            "total": float(invoice.total),
            "amount_paid": float(invoice.amount_paid),
            "status": invoice.status
        }
    }), 201


@payments_bp.route("/", methods=["GET"])
def get_payments():
    payments = Payment.query.order_by(Payment.id.desc()).all()

    return jsonify({
        "success": True,
        "count": len(payments),
        "payments": [serialize_payment(payment) for payment in payments]
    }), 200


@payments_bp.route("/<int:payment_id>", methods=["GET"])
def get_payment(payment_id):
    payment = db.session.get(Payment, payment_id)

    if not payment:
        return jsonify({
            "success": False,
            "message": "Payment not found"
        }), 404

    return jsonify({
        "success": True,
        "payment": serialize_payment(payment)
    }), 200


@payments_bp.route("/invoice/<int:invoice_id>", methods=["GET"])
def get_invoice_payments(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)

    if not invoice:
        return jsonify({
            "success": False,
            "message": "Invoice not found"
        }), 404

    payments = Payment.query.filter_by(invoice_id=invoice_id).all()

    return jsonify({
        "success": True,
        "invoice_id": invoice_id,
        "count": len(payments),
        "payments": [serialize_payment(payment) for payment in payments]
    }), 200
