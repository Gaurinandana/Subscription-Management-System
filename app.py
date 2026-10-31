
import os

from flask import Flask
from config import Config
from extensions import db


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)

    # Import all database models
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

    # Create database tables
    with app.app_context():
        db.create_all()

    # Home route
    @app.route("/")
    def home():

        return {
            "message": "Welcome to Brightloop Subscription Management System",
            "status": "Backend is running successfully",
            "database": "Connected"
        }

    # API health check
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
