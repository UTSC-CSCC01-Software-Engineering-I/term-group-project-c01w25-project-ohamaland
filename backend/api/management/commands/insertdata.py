from django.core.management.base import BaseCommand
from api.models import Receipt, Item

class Command(BaseCommand):
    help = "Insert sample data into the database"

    def handle(self, *args, **kwargs):
        receipts_data = [
            {
                "user_id": 69,
                "merchant": "Walmart",
                "total_amount": 420.00,
                "currency": "CAD",
                "date": "2024-12-25",
                "payment_method": "credit",
                "receipt_image_url": "https://example.com/receipt.jpg",
                "items": [
                    {"name": "Toilet Paper", "category": "home", "price": 5.00, "quantity": 20},
                    {"name": "Toilet", "category": "fixtures", "price": 320.00, "quantity": 1},
                ],
            },
            {
                "user_id": 70,
                "merchant": "Target",
                "total_amount": 10.00,
                "currency": "USD",
                "date": "2024-12-31",
                "payment_method": "cash",
                "receipt_image_url": "https://example.com/receipt2.jpg",
                "items": [
                    {"name": "Treenuts", "category": "food", "price": 0.50, "quantity": 20},
                ],
            },
            {
                "user_id": 100,
                "merchant": "KFC",
                "total_amount": 12.00,
                "currency": "USD",
                "date": "2024-12-31",
                "payment_method": "debit",
                "receipt_image_url": "https://example.com/receipt3.jpg",
                "items": [
                    {"name": "Chicken Nuggets", "category": "food", "price": 12.00, "quantity": 1},
                ],
            },
            {
                "user_id": 200,
                "merchant": "Nike",
                "total_amount": 70.00,
                "currency": "USD",
                "date": "2024-12-31",
                "payment_method": "credit",
                "receipt_image_url": "https://example.com/receipt4.jpg",
                "items": [
                    {"name": "Hoodie", "category": "clothing", "price": 70.00, "quantity": 1},
                ],
            },
        ]

        self.stdout.write("Deleting old data...")
        Item.objects.all().delete()
        Receipt.objects.all().delete()

        self.stdout.write("Inserting new receipts and items...")
        for receipt_data in receipts_data:
            receipt = Receipt.objects.create(
                user_id=receipt_data["user_id"],
                merchant=receipt_data["merchant"],
                total_amount=receipt_data["total_amount"],
                currency=receipt_data["currency"],
                date=receipt_data["date"],
                payment_method=receipt_data["payment_method"],
                receipt_image_url=receipt_data["receipt_image_url"],
            )

            for item_data in receipt_data["items"]:
                Item.objects.create(
                    receipt=receipt,
                    name=item_data["name"],
                    category=item_data["category"],
                    price=item_data["price"],
                    quantity=item_data["quantity"],
                )

        self.stdout.write(self.style.SUCCESS("Successfully inserted sample data!"))