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

    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return {
            "message": "Welcome to Brightloop Subscription Management System",
            "status": "Backend is running successfully",
            "database": "Connected"
        }

    return app


if __name__ == "__main__":

    app = create_app()

    app.run(debug=True)