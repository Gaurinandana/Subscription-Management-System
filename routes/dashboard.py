
from flask import Blueprint, jsonify
from sqlalchemy import func

from extensions import db
from models import User, Product, Subscription, Invoice, Payment

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/", methods=["GET"])
def get_dashboard():
    total_customers = User.query.filter_by(role="customer").count()

    total_products = Product.query.count()

    total_subscriptions = Subscription.query.count()

    active_subscriptions = Subscription.query.filter_by(
        status="active"
    ).count()

    total_invoices = Invoice.query.count()

    total_revenue = db.session.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).scalar()

    pending_payments = db.session.query(
        func.coalesce(
            func.sum(Invoice.total - Invoice.amount_paid), 0
        )
    ).filter(
        Invoice.status.in_(["unpaid", "partially_paid", "overdue"])
    ).scalar()

    recent_subscriptions = Subscription.query.order_by(
        Subscription.created_at.desc()
    ).limit(5).all()

    recent_data = []

    for subscription in recent_subscriptions:
        recent_data.append({
            "id": subscription.id,
            "subscription_number": subscription.subscription_number,
            "customer_id": subscription.customer_id,
            "plan_id": subscription.plan_id,
            "status": subscription.status,
            "start_date": subscription.start_date.isoformat(),
            "expiry_date": (
                subscription.expiry_date.isoformat()
                if subscription.expiry_date else None
            )
        })

    return jsonify({
        "success": True,
        "dashboard": {
            "total_customers": total_customers,
            "total_products": total_products,
            "total_subscriptions": total_subscriptions,
            "active_subscriptions": active_subscriptions,
            "total_invoices": total_invoices,
            "total_revenue": float(total_revenue),
            "pending_payments": float(pending_payments),
            "recent_subscriptions": recent_data
        }
    }), 200
