
from decimal import Decimal, ROUND_HALF_UP


TWO_PLACES = Decimal("0.01")


def money(value):
    """Round a monetary value to two decimal places."""
    return Decimal(str(value)).quantize(
        TWO_PLACES,
        rounding=ROUND_HALF_UP
    )


def calculate_invoice_totals(subtotal, tax_rate=0, discount_total=0):
    """
    Calculate invoice subtotal, discount, taxable amount,
    tax and final total.
    """

    subtotal = money(subtotal)
    tax_rate = Decimal(str(tax_rate))
    discount_total = money(discount_total)

    if subtotal < 0:
        raise ValueError("Subtotal cannot be negative")

    if tax_rate < 0 or tax_rate > 100:
        raise ValueError("Tax rate must be between 0 and 100")

    if discount_total < 0:
        raise ValueError("Discount cannot be negative")

    if discount_total > subtotal:
        raise ValueError("Discount cannot exceed subtotal")

    taxable_amount = money(subtotal - discount_total)

    tax_total = money(
        taxable_amount * tax_rate / Decimal("100")
    )

    total = money(taxable_amount + tax_total)

    return {
        "subtotal": subtotal,
        "discount_total": discount_total,
        "taxable_amount": taxable_amount,
        "tax_rate": tax_rate,
        "tax_total": tax_total,
        "total": total
    }
