
from datetime import datetime

from extensions import db


# ==========================================
# 1. USER MODEL
# ==========================================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(100), nullable=False)

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False,
        default="customer"
    )

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


# ==========================================
# 2. PRODUCT MODEL
# ==========================================

class Product(db.Model):

    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)

    product_type = db.Column(db.String(50))

    sales_price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    cost_price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    notes = db.Column(db.Text)

    is_active = db.Column(db.Boolean, default=True)


# ==========================================
# 3. PRODUCT VARIANT MODEL
# ==========================================

class ProductVariant(db.Model):

    __tablename__ = "product_variants"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    variant_name = db.Column(
        db.String(100),
        nullable=False
    )

    variant_value = db.Column(
        db.String(100),
        nullable=False
    )

    price_adjustment = db.Column(
        db.Numeric(12, 2),
        default=0
    )


# ==========================================
# 4. SUBSCRIPTION PLAN MODEL
# ==========================================

class Plan(db.Model):

    __tablename__ = "plans"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    billing_interval = db.Column(
        db.String(20),
        nullable=False
    )

    price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    minimum_quantity = db.Column(
        db.Integer,
        default=1
    )

    available_from = db.Column(db.Date)

    available_until = db.Column(db.Date)

    auto_close = db.Column(
        db.Boolean,
        default=False
    )

    allow_early_close = db.Column(
        db.Boolean,
        default=True
    )

    allow_pause = db.Column(
        db.Boolean,
        default=True
    )

    allow_renewal = db.Column(
        db.Boolean,
        default=True
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )


# ==========================================
# 5. SUBSCRIPTION MODEL
# ==========================================

class Subscription(db.Model):

    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)

    subscription_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    plan_id = db.Column(
        db.Integer,
        db.ForeignKey("plans.id"),
        nullable=False
    )

    start_date = db.Column(
        db.Date,
        nullable=False
    )

    expiry_date = db.Column(db.Date)

    next_billing_date = db.Column(db.Date)

    payment_terms_days = db.Column(
        db.Integer,
        default=0
    )

    status = db.Column(
        db.String(30),
        default="draft"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


# ==========================================
# 6. SUBSCRIPTION LINE MODEL
# ==========================================

class SubscriptionLine(db.Model):

    __tablename__ = "subscription_lines"

    id = db.Column(db.Integer, primary_key=True)

    subscription_id = db.Column(
        db.Integer,
        db.ForeignKey("subscriptions.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    variant_id = db.Column(
        db.Integer,
        db.ForeignKey("product_variants.id")
    )

    quantity = db.Column(
        db.Integer,
        default=1
    )

    unit_price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )


# ==========================================
# 7. TAX MODEL
# ==========================================

class Tax(db.Model):

    __tablename__ = "taxes"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    rate = db.Column(
        db.Numeric(5, 2),
        nullable=False
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )


# ==========================================
# 8. DISCOUNT MODEL
# ==========================================

class Discount(db.Model):

    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    discount_type = db.Column(
        db.String(20),
        nullable=False
    )

    value = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    minimum_purchase = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    minimum_quantity = db.Column(
        db.Integer,
        default=1
    )

    start_date = db.Column(db.Date)

    end_date = db.Column(db.Date)

    maximum_uses = db.Column(db.Integer)

    used_count = db.Column(
        db.Integer,
        default=0
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id")
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )


# ==========================================
# 9. INVOICE MODEL
# ==========================================

class Invoice(db.Model):

    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)

    invoice_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    subscription_id = db.Column(
        db.Integer,
        db.ForeignKey("subscriptions.id"),
        nullable=False
    )

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    issue_date = db.Column(
        db.Date,
        nullable=False
    )

    due_date = db.Column(
        db.Date,
        nullable=False
    )

    subtotal = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    tax_total = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    discount_total = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    total = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    amount_paid = db.Column(
        db.Numeric(12, 2),
        default=0
    )

    status = db.Column(
        db.String(20),
        default="draft"
    )


# ==========================================
# 10. INVOICE LINE MODEL
# ==========================================

class InvoiceLine(db.Model):

    __tablename__ = "invoice_lines"

    id = db.Column(db.Integer, primary_key=True)

    invoice_id = db.Column(
        db.Integer,
        db.ForeignKey("invoices.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    description = db.Column(db.String(200))

    quantity = db.Column(
        db.Integer,
        default=1
    )

    unit_price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    tax_rate = db.Column(
        db.Numeric(5, 2),
        default=0
    )

    line_total = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )


# ==========================================
# 11. PAYMENT MODEL
# ==========================================

class Payment(db.Model):

    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)

    invoice_id = db.Column(
        db.Integer,
        db.ForeignKey("invoices.id"),
        nullable=False
    )

    payment_method = db.Column(
        db.String(50),
        nullable=False
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    payment_date = db.Column(
        db.Date,
        nullable=False
    )

    note = db.Column(db.Text)


# ==========================================
# 12. QUOTATION MODEL
# ==========================================

class Quotation(db.Model):

    __tablename__ = "quotations"

    id = db.Column(db.Integer, primary_key=True)

    quotation_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    subscription_id = db.Column(
        db.Integer,
        db.ForeignKey("subscriptions.id"),
        nullable=False
    )

    valid_until = db.Column(
        db.Date,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="draft"
    )
