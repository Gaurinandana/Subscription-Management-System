
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Product, ProductVariant


products_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


# ==========================================
# HELPER: ERROR RESPONSE
# ==========================================

def error_response(message, status_code):
    return jsonify({
        "success": False,
        "message": message
    }), status_code


# ==========================================
# HELPER: VALIDATE PRICE
# ==========================================

def validate_price(value, field_name):
    try:
        price = Decimal(str(value))

        if not price.is_finite() or price < 0:
            raise ValueError

        return price

    except (InvalidOperation, ValueError, TypeError):
        raise ValueError(
            f"{field_name} must be a valid non-negative number"
        )


# ==========================================
# 1. CREATE PRODUCT
# POST /api/products/
# ==========================================

@products_bp.route("/", methods=["POST"])
def create_product():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error_response("A valid JSON object is required", 400)

    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        return error_response("Product name is required", 400)

    try:
        sales_price = validate_price(
            data.get("sales_price"), "Sales price"
        )

        cost_price = validate_price(
            data.get("cost_price"), "Cost price"
        )

    except ValueError as error:
        return error_response(str(error), 400)

    product = Product(
        name=name.strip(),
        product_type=data.get("product_type"),
        sales_price=sales_price,
        cost_price=cost_price,
        notes=data.get("notes"),
        is_active=True
    )

    try:
        db.session.add(product)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Product created successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "product_type": product.product_type,
                "sales_price": str(product.sales_price),
                "cost_price": str(product.cost_price),
                "notes": product.notes,
                "is_active": product.is_active
            }
        }), 201

    except IntegrityError:
        db.session.rollback()
        return error_response("Unable to create product due to a database constraint", 409)


# ==========================================
# 2. GET ALL PRODUCTS
# GET /api/products/
# ==========================================

@products_bp.route("/", methods=["GET"])
def get_products():

    products = Product.query.order_by(Product.id.desc()).all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "product_type": product.product_type,
            "sales_price": str(product.sales_price),
            "cost_price": str(product.cost_price),
            "notes": product.notes,
            "is_active": product.is_active
        })

    return jsonify({
        "success": True,
        "count": len(result),
        "products": result
    }), 200


# ==========================================
# 3. GET PRODUCT BY ID
# GET /api/products/<id>
# ==========================================

@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):

    product = db.session.get(Product, product_id)

    if not product:
        return error_response("Product not found", 404)

    return jsonify({
        "success": True,
        "product": {
            "id": product.id,
            "name": product.name,
            "product_type": product.product_type,
            "sales_price": str(product.sales_price),
            "cost_price": str(product.cost_price),
            "notes": product.notes,
            "is_active": product.is_active
        }
    }), 200


# ==========================================
# 4. UPDATE PRODUCT
# PUT /api/products/<id>
# ==========================================

@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):

    product = db.session.get(Product, product_id)

    if not product:
        return error_response("Product not found", 404)

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error_response("A valid JSON object is required", 400)

    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            return error_response("Product name cannot be empty", 400)

        product.name = data["name"].strip()

    if "product_type" in data:
        product.product_type = data["product_type"]

    if "sales_price" in data:
        try:
            product.sales_price = validate_price(
                data["sales_price"], "Sales price"
            )
        except ValueError as error:
            return error_response(str(error), 400)

    if "cost_price" in data:
        try:
            product.cost_price = validate_price(
                data["cost_price"], "Cost price"
            )
        except ValueError as error:
            return error_response(str(error), 400)

    if "notes" in data:
        product.notes = data["notes"]

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return error_response("is_active must be true or false", 400)

        product.is_active = data["is_active"]

    try:
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Product updated successfully",
            "product_id": product.id
        }), 200

    except IntegrityError:
        db.session.rollback()
        return error_response("Unable to update product", 409)


# ==========================================
# 5. DELETE PRODUCT
# DELETE /api/products/<id>
# ==========================================

@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):

    product = db.session.get(Product, product_id)

    if not product:
        return error_response("Product not found", 404)

    try:
        db.session.delete(product)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Product deleted successfully"
        }), 200

    except IntegrityError:
        db.session.rollback()
        return error_response(
            "This product is being used by another record and cannot be deleted",
            409
        )


# ==========================================
# 6. CREATE PRODUCT VARIANT
# POST /api/products/<id>/variants
# ==========================================

@products_bp.route(
    "/<int:product_id>/variants",
    methods=["POST"]
)
def create_product_variant(product_id):

    product = db.session.get(Product, product_id)

    if not product:
        return error_response("Product not found", 404)

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error_response("A valid JSON object is required", 400)

    variant_name = data.get("variant_name")
    variant_value = data.get("variant_value")

    if not isinstance(variant_name, str) or not variant_name.strip():
        return error_response("Variant name is required", 400)

    if not isinstance(variant_value, str) or not variant_value.strip():
        return error_response("Variant value is required", 400)

    try:
        price_adjustment = validate_price(
            data.get("price_adjustment", 0),
            "Price adjustment"
        )
    except ValueError as error:
        return error_response(str(error), 400)

    variant = ProductVariant(
        product_id=product.id,
        variant_name=variant_name.strip(),
        variant_value=variant_value.strip(),
        price_adjustment=price_adjustment
    )

    try:
        db.session.add(variant)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Product variant created successfully",
            "variant": {
                "id": variant.id,
                "product_id": variant.product_id,
                "variant_name": variant.variant_name,
                "variant_value": variant.variant_value,
                "price_adjustment": str(variant.price_adjustment)
            }
        }), 201

    except IntegrityError:
        db.session.rollback()
        return error_response("Unable to create product variant", 409)


# ==========================================
# 7. GET PRODUCT VARIANTS
# GET /api/products/<id>/variants
# ==========================================

@products_bp.route(
    "/<int:product_id>/variants",
    methods=["GET"]
)
def get_product_variants(product_id):

    product = db.session.get(Product, product_id)

    if not product:
        return error_response("Product not found", 404)

    variants = ProductVariant.query.filter_by(
        product_id=product_id
    ).all()

    result = []

    for variant in variants:
        result.append({
            "id": variant.id,
            "product_id": variant.product_id,
            "variant_name": variant.variant_name,
            "variant_value": variant.variant_value,
            "price_adjustment": str(variant.price_adjustment)
        })

    return jsonify({
        "success": True,
        "product_id": product_id,
        "count": len(result),
        "variants": result
    }), 200

