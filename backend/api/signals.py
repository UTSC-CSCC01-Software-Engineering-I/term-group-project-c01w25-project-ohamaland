from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Receipt, SpendingAnalytics, Item, User
from django.db.models import Sum
from datetime import timedelta
from django.utils.timezone import now
from django.db import transaction

User = get_user_model()


def get_spending_periods():
    """Generate spending periods."""
    today = now().date()
    return {
        "Weekly": today - timedelta(days=7),
        "Monthly": today - relativedelta(months=1),  # Exactly one month ago
        "Quarterly": today.replace(month=((today.month - 1) // 3) * 3 + 1, day=1),
        "Yearly": today - relativedelta(years=1),  # Exactly one year ago
    }


def get_all_dates_in_period(start_date, end_date):
    """Generate a list of dates from start_date to end_date."""
    date_list = []
    current_date = start_date
    while current_date <= end_date:
        date_list.append(current_date)
        current_date += timedelta(days=1)
    return date_list


def calculate_category_spending(user_id, start_date):
    """Calculate category spending for the user."""
    user = User.objects.filter(id=user_id).first()
    if not user:
        return {}

    category_spending = {}

    # Sum spending for each category per receipt
    receipts = Receipt.objects.filter(user=user, date__gte=start_date)
    for receipt in receipts:
        for item in receipt.items.all():
            category_spending[item.category] = (
                category_spending.get(item.category, 0) + item.price
            )

    # Ensure the amounts are floats
    category_spending = {key: float(value) for key, value in category_spending.items()}

    return category_spending


def calculate_total_spending(user_id, start_date):
    """Calculate total spending over time for the user."""
    user = User.objects.filter(id=user_id).first()
    if not user:
        return {}

    total_spending_per_date = {}

    today = now().date()
    all_dates = get_all_dates_in_period(start_date, today)

    # Sum total spending by receipt for each date
    receipts = Receipt.objects.filter(user=user, date__gte=start_date)
    for receipt in receipts:
        receipt_date = (
            receipt.date
        )  # Get the date part of the receipt date (e.g., '2025-03-01')
        receipt_date_str = receipt_date.isoformat()
        total_spending_per_date[receipt_date_str] = total_spending_per_date.get(
            receipt_date_str, Decimal("0.0")
        ) + Decimal(receipt.total_amount)

    # Ensure the amounts are floats
    for date in all_dates:
        date_str = date.isoformat()
        if date_str not in total_spending_per_date:
            total_spending_per_date[date_str] = 0.0

    total_spending_per_date = {
        key: float(value) for key, value in total_spending_per_date.items()
    }

    return total_spending_per_date


def update_spending_analytics(user_id):
    print("Updating spending analytics...")
    user = User.objects.filter(id=user_id).first()
    if not user:
        return

    today = now().date()

    # Compute total spending over different periods
    periods = get_spending_periods()

    # Calculate category spending for the user
    category_spending = {}
    total_spending = {}

    for period, start_date in periods.items():
        print(f"Processing period: {period}, start_date: {start_date}")

        # Calculate category spending for this period
        category_spending[period] = calculate_category_spending(user_id, start_date)

        # Calculate total spending for this period
        total_spending[period] = calculate_total_spending(user_id, start_date)

        # Calculate total spending in this period
        total_spent = sum(total_spending[period].values())

        print(f"Total spent for period {period}: {total_spent}")
        print(
            f"Category spending for period {period}: {category_spending.get(period, {})}"
        )

        category_spending_str = {
            key: (
                value.isoformat() if isinstance(value, date) else float(value)
            )  # Convert date to string & Decimal to float
            for key, value in category_spending[period].items()
        }

        # Update the spending analytics for this period
        analytics, created = SpendingAnalytics.objects.update_or_create(
            user=user,
            period=period,
            date=today,
            defaults={
                "total_spent": total_spent,
                "category_spending": category_spending_str,
            },
        )

        if created:
            print(f"Created new analytics entry for period {period}.")
        else:
            print(f"Updated existing analytics entry for period {period}.")


@receiver(post_save, sender=Receipt)
def update_analytics_on_receipt_change(sender, instance, created, **kwargs):
    if created:  # Only trigger when a new receipt is created
        update_spending_analytics(instance.user_id)


@receiver(post_delete, sender=Receipt)
def update_analytics_on_receipt_delete(sender, instance, **kwargs):
    # Optionally update analytics when a receipt is deleted
    update_spending_analytics(instance.user_id)
