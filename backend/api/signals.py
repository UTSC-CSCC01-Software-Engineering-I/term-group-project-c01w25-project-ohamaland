from collections import defaultdict
from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Receipt, Insights, Item, User
from django.db.models import Sum
from datetime import timedelta
from django.utils.timezone import now
from django.db import transaction
import django.utils.timezone
import requests
from django.conf import settings

User = get_user_model()

EXCHANGE_RATE_API_KEY = settings.EXCHANGE_RATE_API_KEY


def get_client_ip(request):
    """Get the IP address of the client."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_user_country_and_currency(ip_address=None):
    """Fetch the user's country and currency using RestCountries API."""
    if ip_address is None:
        ip_address = requests.get('https://api.ipify.org').text  # Get the user's public IP address if not passed
    
    # Use the IP address to get the country code from an IP geolocation service
    ip_info_url = f"http://ip-api.com/json/{ip_address}?fields=countryCode"
    try:
        response = requests.get(ip_info_url)
        data = response.json()

        if response.status_code == 200 and 'countryCode' in data:
            country_code = data['countryCode']
            
            # Now use the RestCountries API to get the currency for this country
            country_info_url = f"https://restcountries.com/v3.1/alpha/{country_code}"
            country_response = requests.get(country_info_url)
            
            if country_response.status_code == 200:
                country_data = country_response.json()
                # Assuming the country data contains a currency field in the format of: {'USD'}
                currencies = country_data[0].get('currencies', {})
                currency_code = list(currencies.keys())[0] if currencies else None
                return country_code, currency_code
            else:
                print(f"Failed to get currency data from RestCountries.")
                return None, None
        else:
            print(f"Failed to get country code or invalid IP address.")
            return None, None
    except Exception as e:
        print(f"Error retrieving geolocation: {e}")
        return None, None

def get_exchange_rate(from_currency, to_currency='USD'):
    """Fetch the exchange rate from one currency to another."""
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/{from_currency}"
    try:
        response = requests.get(url)
        data = response.json()
        
        if response.status_code == 200 and 'conversion_rates' in data:
            rates = data['conversion_rates']
            return round(rates.get(to_currency, 1), 2)  # Return exchange rate or default to 1
        else:
            print(f"Failed to fetch exchange rates: {data}")
            return 1
    except Exception as e:
        print(f"Error retrieving exchange rate: {e}")
        return 1


def convert_currency(amount, from_currency, to_currency='USD'):
    """Convert the amount from one currency to another."""
    if from_currency == to_currency:
        return amount
    exchange_rate = get_exchange_rate(from_currency, to_currency)
    return amount * exchange_rate

def get_spending_periods():
    today = django.utils.timezone.now().date()
    return {
        "Weekly": today - timedelta(days=7),
        "Monthly": today - relativedelta(months=1),  
        "Quarterly": today.replace(month=((today.month - 1) // 3) * 3 + 1, day=1),
        "Yearly": today - relativedelta(years=1),
    }


def get_all_dates_in_period(start_date, end_date):
    """Generate a list of dates from start_date to end_date."""
    date_list = []
    current_date = start_date
    while current_date <= end_date:
        date_list.append(current_date)
        current_date += timedelta(days=1)
    return date_list


def calculate_currency_distribution(user, start_date):
    """Calculate the percentage of receipts using each currency for a user."""
    if not user:
        return {}

    receipts = Receipt.objects.filter(user=user, date__gte=start_date)
    total_receipts = receipts.count() 

    if total_receipts == 0:
        return {}

    currency_counts = defaultdict(int)
    for receipt in receipts:
        currency_counts[receipt.currency] += 1  

    currency_distribution = {
        currency: round((count / total_receipts) * 100, 2)
        for currency, count in currency_counts.items()
    }

    return currency_distribution

def calculate_payment_method_spending(user, start_date, user_currency):
    """Calculate payment type spending for the user."""
    if not user:
        return {}
    
    payment_method_spending = {}
    receipts = Receipt.objects.filter(user=user, date__gte=start_date)
    for receipt in receipts:
        payment_name = receipt.payment_method
        amount = float(receipt.total_amount)
        receipt_currency = receipt.currency
        if receipt_currency != user_currency:
            amount = convert_currency(amount, receipt_currency, user_currency)
        if payment_name not in payment_method_spending:
            payment_method_spending[payment_name] = 0.0
        payment_method_spending[payment_name] += amount
    payment_method_spending = {key: round(float(value), 2) for key, value in payment_method_spending.items()}

    return payment_method_spending

def calculate_merchant_spending(user, start_date, user_currency):
    """Calculate merchant spending for the user."""
    if not user:
        return {}

    merchant_spending = {}
    receipts = Receipt.objects.filter(user=user, date__gte=start_date)
    for receipt in receipts:
        merchant_name = receipt.merchant
        amount = float(receipt.total_amount)
        receipt_currency = receipt.currency
        if receipt_currency != user_currency:
            amount = convert_currency(amount, receipt_currency, user_currency)
        if merchant_name not in merchant_spending:
            merchant_spending[merchant_name] = 0.0
        merchant_spending[merchant_name] += amount

    merchant_spending = {key: round(float(value), 2) for key, value in merchant_spending.items()}
    return merchant_spending


def calculate_folder_spending(user, start_date, user_currency):
    """Calculate Folder spending for the user."""
    if not user:
        return {}

    folder_spending = {}
    receipts = Receipt.objects.filter(user=user, date__gte=start_date)
    for receipt in receipts:
        folder_name = receipt.folder.name
        folder_color = receipt.folder.color
        if folder_name and folder_name == "All":
            continue
        amount = float(receipt.total_amount)
        receipt_currency = receipt.currency
        if receipt_currency != user_currency:
            amount = convert_currency(amount, receipt_currency, user_currency)
        if folder_name not in folder_spending:
            folder_spending[folder_name] = [0.0, folder_color]
        folder_spending[folder_name][0] += amount

    folder_spending = {key: [round(float(value[0]), 2), value[1]] for key, value in folder_spending.items()}
    return folder_spending


def calculate_total_spending(user, start_date, user_currency):
    """Calculate total spending over time for the user."""
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
        amount = float(receipt.total_amount)
        receipt_currency = receipt.currency
        if receipt_currency != user_currency:
            amount = convert_currency(amount, receipt_currency, user_currency)
        total_spending_per_date[receipt_date_str] = total_spending_per_date.get(
            receipt_date_str, Decimal("0.0")
        ) + round(Decimal(amount),2)

    # Ensure the amounts are floats
    for date in all_dates:
        date_str = date.isoformat()
        if date_str not in total_spending_per_date:
            total_spending_per_date[date_str] = 0.0

    total_spending_per_date = {
        key: float(value) for key, value in total_spending_per_date.items()
    }

    return total_spending_per_date


def update_insights(user, request):

    if not isinstance(user, User):  # Ensure it's a User instance
        user = User.objects.filter(id=user).first()

    if not user:
        return

    if request:
        user_ip = get_client_ip(request)
        _, currency = get_user_country_and_currency(user_ip)
    else:
        currency = 'USD'

    today = now().date()
    periods = get_spending_periods()

    folder_spending = {}
    total_spending = {}
    merchant_spending = {}
    payment_method_spending = {}
    currency_distribution = {}

    for period, start_date in periods.items():
        print(f"Processing period: {period}, start_date: {start_date}")

        folder_spending[period] = calculate_folder_spending(user, start_date, currency)

        # Calculate total spending for this period
        total_spending[period] = calculate_total_spending(user, start_date, currency)

        merchant_spending[period] = calculate_merchant_spending(user, start_date, currency)

        payment_method_spending[period] = calculate_payment_method_spending(user, start_date, currency)

        currency_distribution[period] = calculate_currency_distribution(user, start_date)

        # Calculate total spending in this period
        total_spent = sum(total_spending[period].values())

        folder_spending_str = {
            key: (
                float(value[0]) if isinstance(value, list) else (
                    value.isoformat() if isinstance(value, date) else float(value)
                )
            )
            for key, value in folder_spending[period].items()
        }

        merchant_spending_str = {
            key: (
                value.isoformat() if isinstance(value, date) else float(value)
            )
            for key, value in merchant_spending[period].items()
        }

        payment_method_spending_str = {
            key: (
                value.isoformat() if isinstance(value, date) else float(value)
            )
            for key, value in merchant_spending[period].items()
        }

        currency_distribution_str = {
            key: (
                value.isoformat() if isinstance(value, date) else float(value)
            )
            for key, value in currency_distribution[period].items()
        }

        # Update the spending analytics for this period
        analytics, created = Insights.objects.update_or_create(
            user=user,
            period=period,
            date=today,
            defaults={
                "total_spent": total_spent,
                "folder_spending": folder_spending_str,
                "merchant_spending": merchant_spending_str,
                "payment_method_spending": payment_method_spending_str,
                "currency_distribution": currency_distribution_str,
            },
        )

        if created:
            print(f"Created new analytics entry for period {period}.")
        else:
            print(f"Updated existing analytics entry for period {period}.")


# @receiver(post_save, sender=Receipt)
# def update_analytics_on_receipt_change(sender, instance, created, **kwargs):
#     if created:  # Only trigger when a new receipt is created
#         update_insights(instance.user, user_currency='USD')


# @receiver(post_delete, sender=Receipt)
# def update_analytics_on_receipt_delete(sender, instance, **kwargs):
#     # Optionally update analytics when a receipt is deleted
#     update_insights(instance.user, user_currency='USD')
