
import os

from flask import Flask
from config import Config
from extensions import db


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)

    from models import (
        User,
        Product,
        ProductVariant,
        Plan,
        Subscription,
        SubscriptionLine,
        Tax,
        Discount,
        Invoice,
        InvoiceLine,
        Payment,
        Quotation
    )

    # Register authentication routes
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Register product routes
    from routes.products import products_bp
    app.register_blueprint(products_bp)

    # Register plan routes
    from routes.plans import plans_bp
    app.register_blueprint(plans_bp)

    from routes.subscriptions import subscriptions_bp
    app.register_blueprint(subscriptions_bp)

    from routes.invoices import invoices_bp
    app.register_blueprint(invoices_bp)

    from routes.payments import payments_bp
    app.register_blueprint(payments_bp)

    from routes.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp)

    from routes.taxes import taxes_bp
    app.register_blueprint(taxes_bp)

    from routes.discounts import discounts_bp
    app.register_blueprint(discounts_bp)

    from routes.quotations import quotations_bp
    app.register_blueprint(quotations_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return {
            "message": "Welcome to Brightloop Subscription Management System",
            "status": "Backend is running successfully",
            "database": "Connected"
        }

    @app.route("/api/health")
    def health():
        return {
            "success": True,
            "message": "Brightloop API is running"
        }

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
