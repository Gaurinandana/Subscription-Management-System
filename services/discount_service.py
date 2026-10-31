
from datetime import date
from decimal import Decimal

from models import Discount


def calculate_discount(subtotal, subscription_lines, discount_id):
    """
    Validate a saved discount and calculate the discount amount.
    """

    discount = Discount.query.get(discount_id)

    if not discount:
        raise ValueError("Discount not found")

    if not discount.is_active:
        raise ValueError("This discount is inactive")

    today = date.today()

    if discount.start_date and today < discount.start_date:
        raise ValueError("This discount is not active yet")

    if discount.end_date and today > discount.end_date:
        raise ValueError("This discount has expired")

    if (
        discount.maximum_uses is not None
        and discount.used_count >= discount.maximum_uses
    ):
        raise ValueError("This discount has reached its usage limit")

    subtotal = Decimal(str(subtotal))
    minimum_purchase = Decimal(str(discount.minimum_purchase or 0))

    if subtotal < minimum_purchase:
        raise ValueError(
            "Minimum purchase requirement for this discount is not met"
        )

    total_quantity = sum(line.quantity for line in subscription_lines)

    if total_quantity < (discount.minimum_quantity or 1):
        raise ValueError(
            "Minimum quantity requirement for this discount is not met"
        )

    eligible_lines = subscription_lines

    if discount.product_id is not None:
        eligible_lines = [
            line for line in subscription_lines
            if line.product_id == discount.product_id
        ]

        if not eligible_lines:
            raise ValueError(
                "This discount does not apply to the subscription products"
            )

    eligible_subtotal = sum(
        Decimal(str(line.unit_price)) * line.quantity
        for line in eligible_lines
    )

    discount_type = discount.discount_type.lower()
    discount_value = Decimal(str(discount.value))

    if discount_type in ("percentage", "percent"):
        if discount_value < 0 or discount_value > 100:
            raise ValueError("Percentage discount must be between 0 and 100")

        discount_amount = eligible_subtotal * discount_value / Decimal("100")

    elif discount_type in ("fixed", "fixed_amount"):
        if discount_value < 0:
            raise ValueError("Fixed discount cannot be negative")

        discount_amount = discount_value

    else:
        raise ValueError("Unsupported discount type")

    discount_amount = min(
        discount_amount,
        eligible_subtotal,
        subtotal
    )

    return discount, discount_amount.quantize(Decimal("0.01"))
