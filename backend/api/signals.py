from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Receipt, SpendingAnalytics, Item, User
from django.db.models import Sum
from datetime import timedelta
from django.utils.timezone import now
from django.db import transaction

User = get_user_model()

def calculate_category_spending(user_id):
    """Calculate category spending for the user."""
    user = User.objects.filter(id=user_id).first()
    if not user:
        return {}

    today = now().date()
    periods = {
        "Weekly": today - timedelta(days=7),
        "Monthly": today.replace(day=1),
        "Quarterly": today.replace(month=((today.month - 1) // 3) * 3 + 1, day=1),
        "Yearly": today.replace(month=1, day=1),
    }

    category_spending = {}

    for period, start_date in periods.items():
        print(f"Processing period: {period}, start_date: {start_date}")
        
        # Category-wise spending
        category_spending_for_period = {
            data["category"]: data["total_spent"]
            for data in (
                Item.objects.filter(receipt__user=user, receipt__date__gte=start_date)
                .values("category")
                .annotate(total_spent=Sum("price"))
            )
        }
        print(f"Category Spending for period {period}: {category_spending_for_period}")
        # Ensure the amounts are floats
        category_spending_for_period = {
            key: float(value) for key, value in category_spending_for_period.items()
        }
        category_spending[period] = category_spending_for_period
    
    return category_spending

def update_spending_analytics(user_id):
    print("Updating spending analytics...")
    user = User.objects.filter(id=user_id).first()
    if not user:
        return

    today = now().date()

    # Compute total spending over different periods
    periods = {
        "Weekly": today - timedelta(days=7),
        "Monthly": today.replace(day=1),
        "Quarterly": today.replace(month=((today.month - 1) // 3) * 3 + 1, day=1),
        "Yearly": today.replace(month=1, day=1),
    }

    # Calculate category spending for the user
    category_spending = calculate_category_spending(user_id)

    for period, start_date in periods.items():
        print(f"Processing period: {period}, start_date: {start_date}")

        # Total spending in this period
        total_spent = (
            Item.objects.filter(receipt__user=user, receipt__date__gte=start_date)
            .aggregate(Sum("price"))["price__sum"] or 0.00
        )
        total_spent = float(total_spent)

        print(f"Total spent for period {period}: {total_spent}")
        print(f"Category spending for period {period}: {category_spending.get(period, {})}")

        # Update the spending analytics for this period
        analytics, created = SpendingAnalytics.objects.update_or_create(
            user=user,
            period=period,
            date=today,
            defaults={
                "total_spent": total_spent,
                "category_spending": category_spending.get(period, {}),
            }
        )

        if created:
            print(f"Created new analytics entry for period {period}.")
        else:
            print(f"Updated existing analytics entry for period {period}.")


# @receiver(post_save, sender=Receipt)
# def update_analytics_on_receipt_change(sender, instance, created,**kwargs):
#     if created:  # Only trigger when a new receipt is created
#         update_spending_analytics(instance.user_id)

# @receiver(post_delete, sender=Receipt)
# def update_analytics_on_receipt_delete(sender, instance, **kwargs):
#     # Optionally update analytics when a receipt is deleted
#     update_spending_analytics(instance.user_id)