from django.core.management.base import BaseCommand
from api.models import Receipt, Item, Group, GroupMembers

class Command(BaseCommand):
    help = "Insert sample data into the database (Groups, GroupMembers, Receipts, Items)."

    def handle(self, *args, **kwargs):
        # Sample data for Groups
        groups_data = [
            {
                "creator": 1,
                "name": "Engineering Team",
                "members": [101, 102],
                "receipts": [
                    {
                        "merchant": "Office Depot",
                        "total_amount": 200.00,
                        "currency": "USD",
                        "date": "2024-11-20",
                        "payment_method": "debit",
                        "receipt_image_url": "https://example.com/receipt-office.jpg",
                        "items": [
                            {"name": "Printer Paper", "category": "home", "price": 5.00, "quantity": 10},
                            {"name": "Desk Chair", "category": "furniture", "price": 150.00, "quantity": 1},
                        ],
                    },
                ],
            },
            {
                "creator": 2,
                "name": "Sales Department",
                "members": [201, 202],
                "receipts": [
                    {
                        "merchant": "Staples",
                        "total_amount": 45.00,
                        "currency": "USD",
                        "date": "2024-12-01",
                        "payment_method": "credit",
                        "receipt_image_url": "https://example.com/receipt-staples.jpg",
                        "items": [
                            {"name": "Notebooks", "category": "home", "price": 3.00, "quantity": 5},
                            {"name": "Pens", "category": "home", "price": 0.50, "quantity": 10},
                        ],
                    },
                ],
            },
        ]

        # Sample data for user-based Receipts
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
                    {"name": "Toilet",       "category": "fixtures", "price": 320.00, "quantity": 1},
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

        # Order matters if you have foreign keys. Delete Items first, then Receipts, then GroupMembers, then Groups.
        Item.objects.all().delete()
        Receipt.objects.all().delete()
        GroupMembers.objects.all().delete()
        Group.objects.all().delete()

        self.stdout.write("Inserting new groups and group members...")

        # Insert Groups + GroupMembers + Group-based Receipts
        for g_data in groups_data:
            new_group = Group.objects.create(
                creator=g_data["creator"],
                name=g_data["name"],
                # created_at will be auto-set due to auto_now_add
            )
            # Create GroupMembers
            for user_id in g_data.get("members", []):
                GroupMembers.objects.create(
                    group=new_group,
                    user_id=user_id
                )
            # Create Receipts for this group
            for r_data in g_data.get("receipts", []):
                new_receipt = Receipt.objects.create(
                    group=new_group,
                    merchant=r_data["merchant"],
                    total_amount=r_data["total_amount"],
                    currency=r_data["currency"],
                    date=r_data["date"],
                    payment_method=r_data["payment_method"],
                    receipt_image_url=r_data["receipt_image_url"],
                )
                # Create Items for this receipt
                for item_data in r_data["items"]:
                    Item.objects.create(
                        receipt=new_receipt,
                        name=item_data["name"],
                        category=item_data["category"],
                        price=item_data["price"],
                        quantity=item_data["quantity"],
                    )

        self.stdout.write("Inserting user-based receipts...")

        # Insert user-based Receipts + Items
        for receipt_data in receipts_data:
            new_receipt = Receipt.objects.create(
                user_id=receipt_data["user_id"],
                merchant=receipt_data["merchant"],
                total_amount=receipt_data["total_amount"],
                currency=receipt_data["currency"],
                date=receipt_data["date"],
                payment_method=receipt_data["payment_method"],
                receipt_image_url=receipt_data["receipt_image_url"],
            )

            # Create Items for each receipt
            for item_data in receipt_data["items"]:
                Item.objects.create(
                    receipt=new_receipt,
                    name=item_data["name"],
                    category=item_data["category"],
                    price=item_data["price"],
                    quantity=item_data["quantity"],
                )

        self.stdout.write(self.style.SUCCESS("Successfully inserted sample Groups, Receipts, and Items!"))