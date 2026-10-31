
from datetime import date, timedelta
from calendar import monthrange
from uuid import uuid4

from extensions import db
from models import Subscription, Plan, SubscriptionLine, Invoice, InvoiceLine, Product


def calculate_next_billing_date(current_date, billing_interval):
    interval = billing_interval.lower()

    if interval == "weekly":
        return current_date + timedelta(days=7)

    if interval in ("monthly", "quarterly"):
        months_to_add = 1 if interval == "monthly" else 3

        next_month = current_date.month + months_to_add
        next_year = current_date.year

        while next_month > 12:
            next_month -= 12
            next_year += 1

        last_day = monthrange(next_year, next_month)[1]
        return date(next_year, next_month, min(current_date.day, last_day))

    if interval == "yearly":
        next_year = current_date.year + 1
        last_day = monthrange(next_year, current_date.month)[1]
        return date(next_year, current_date.month, min(current_date.day, last_day))

    raise ValueError(f"Unsupported billing interval: {billing_interval}")


def create_renewal_invoice(subscription, billing_date, today):
    lines = SubscriptionLine.query.filter_by(
        subscription_id=subscription.id
    ).all()

    if not lines:
        raise ValueError(
            f"Subscription {subscription.id} has no subscription lines"
        )

    subtotal = sum(
        line.unit_price * line.quantity for line in lines
    )

    subtotal = round(float(subtotal), 2)
    issue_date = today
    due_date = today + timedelta(
        days=subscription.payment_terms_days or 0
    )

    invoice = Invoice(
        invoice_number=f"INV-{today.strftime('%Y%m%d')}-{uuid4().hex[:8].upper()}",
        subscription_id=subscription.id,
        customer_id=subscription.customer_id,
        issue_date=issue_date,
        due_date=due_date,
        subtotal=subtotal,
        tax_total=0,
        discount_total=0,
        total=subtotal,
        amount_paid=0,
        status="unpaid"
    )

    db.session.add(invoice)
    db.session.flush()

    for line in lines:
        product = db.session.get(Product, line.product_id)

        invoice_line = InvoiceLine(
            invoice_id=invoice.id,
            product_id=line.product_id,
            description=product.name if product else "Subscription item",
            quantity=line.quantity,
            unit_price=line.unit_price,
            tax_rate=0,
            line_total=round(float(line.unit_price * line.quantity), 2)
        )
        db.session.add(invoice_line)

    return invoice


def process_subscription_automation(today=None):
    if today is None:
        today = date.today()

    expired_count = 0
    renewal_count = 0
    due_for_renewal = []
    errors = []

    subscriptions = Subscription.query.all()

    try:
        for subscription in subscriptions:
            plan = db.session.get(Plan, subscription.plan_id)

            if not plan:
                continue

            if (
                subscription.status == "active"
                and subscription.expiry_date
                and subscription.expiry_date < today
            ):
                subscription.status = "expired"
                expired_count += 1
                continue

            if (
                subscription.status != "active"
                or not subscription.next_billing_date
                or subscription.next_billing_date > today
            ):
                continue

            if not plan.allow_renewal:
                if plan.auto_close:
                    subscription.status = "expired"
                continue

            billing_date = subscription.next_billing_date

            try:
                invoice = create_renewal_invoice(
                    subscription,
                    billing_date,
                    today
                )

                next_date = calculate_next_billing_date(
                    billing_date,
                    plan.billing_interval
                )

                while next_date <= today:
                    next_date = calculate_next_billing_date(
                        next_date,
                        plan.billing_interval
                    )

                subscription.next_billing_date = next_date

                renewal_count += 1
                due_for_renewal.append({
                    "subscription_id": subscription.id,
                    "subscription_number": subscription.subscription_number,
                    "invoice_id": invoice.id,
                    "invoice_number": invoice.invoice_number,
                    "billing_date": billing_date.isoformat(),
                    "next_billing_date": next_date.isoformat()
                })

            except Exception as error:
                errors.append({
                    "subscription_id": subscription.id,
                    "error": str(error)
                })

                db.session.rollback()
                # Keep processing other subscriptions.
                continue

        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    return {
        "expired_count": expired_count,
        "renewal_count": renewal_count,
        "due_for_renewal": due_for_renewal,
        "errors": errors
    }
