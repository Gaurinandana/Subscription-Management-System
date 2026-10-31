
import os

from flask import Flask
from config import Config
from extensions import db


def create_app():

    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Create instance folder
    os.makedirs(app.instance_path, exist_ok=True)

    # Initialize database
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

    # ==========================================
    # REGISTER AUTHENTICATION ROUTES
    # ==========================================

    from routes.auth import auth_bp

    app.register_blueprint(auth_bp)

    # ==========================================
    # REGISTER PRODUCT ROUTES
    # ==========================================

    from routes.products import products_bp

    app.register_blueprint(products_bp)

    # ==========================================
    # CREATE DATABASE TABLES
    # ==========================================

    with app.app_context():
        db.create_all()

    # ==========================================
    # HOME ROUTE
    # ==========================================

    @app.route("/")
    def home():

        return {
            "message": "Welcome to Brightloop Subscription Management System",
            "status": "Backend is running successfully",
            "database": "Connected"
        }

    # ==========================================
    # API HEALTH CHECK
    # ==========================================

    @app.route("/api/health")
    def health():

        return {
            "success": True,
            "message": "Brightloop API is running"
        }

    return app


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app = create_app()

    app.run(debug=True)
