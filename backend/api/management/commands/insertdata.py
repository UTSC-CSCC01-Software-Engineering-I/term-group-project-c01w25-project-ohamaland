from django.core.management.base import BaseCommand
from api.models import Receipt, Item, Group, GroupMembers, Subscription, User
from django.utils.timezone import now


class Command(BaseCommand):
    help = "Insert sample data into the database (Groups, GroupMembers, Receipts, Items, Users, Subscriptions)."

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old data...")

        # Order matters since we have foreign keys.
        # Delete Items first, then Receipts and Subscriptions,
        # then GroupMembers, then Groups, and finally Users.
        Item.objects.all().delete()
        Receipt.objects.all().delete()
        Subscription.objects.all().delete()
        GroupMembers.objects.all().delete()
        Group.objects.all().delete()
        User.objects.all().delete()

        # Sample users
        users_data = [
            {
                "email": "bodaciousBenjamin@milk.com",
                "username": "ButterManBen",
                "first_name": "Benjamin",
                "last_name": "Franklin",
                "phone_number": "+1123456789",
                "password": "allThingsInModeration123",
                "is_superuser": False,
                "is_staff": False,
                "is_active": True,
            },
            {
                "email": "zaheer@lahima.org",
                "username": "GuruLahimaFanClub263",
                "first_name": "Zaheer",
                "last_name": "Basingsei",
                "phone_number": "+1111111111",
                "password": "BecomeWind321",
                "is_superuser": False,
                "is_staff": False,
                "is_active": True,
            },
        ]

        users = {}
        self.stdout.write("Creating new users...")
        for user_data in users_data:
            user = User.objects.create(
                username=user_data["username"],
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                phone_number=user_data["phone_number"],
                is_superuser=user_data["is_superuser"],
                is_staff=user_data["is_staff"],
                is_active=user_data["is_active"],
                date_joined=now(),
            )
            user.set_password(user_data["password"])  # Hash the password
            user.save()
            users[user.email] = user
            self.stdout.write(
                self.style.SUCCESS(f"User {user.email} created with ID {user.id}!")
            )
        self.stdout.write(self.style.SUCCESS("Successfully inserted users!"))

        # Sample data for Groups
        groups_data = [
            {
                "creator": users["bodaciousBenjamin@milk.com"],
                "name": "Engineering Team",
                "members": [
                    users["bodaciousBenjamin@milk.com"].id,
                    users["zaheer@lahima.org"].id,
                ],
                "receipts": [
                    {
                        "merchant": "Office Depot",
                        "total_amount": 200.00,
                        "currency": "USD",
                        "date": "2024-11-20",
                        "payment_method": "Debit",
                        "receipt_image_url": "https://catalog-receipt-storage.s3.us-east-2.amazonaws.com/receipts/receipt.jpg",
                        "items": [
                            {
                                "name": "Printer Paper",
                                "category": "home",
                                "price": 5.00,
                                "quantity": 10,
                            },
                            {
                                "name": "Desk Chair",
                                "category": "furniture",
                                "price": 150.00,
                                "quantity": 1,
                            },
                        ],
                    },
                ],
                "subscriptions": [
                    {
                        "merchant": "Fawzi's Yearly Flower Festival",
                        "total_amount": 999.00,
                        "currency": "USD",
                        "renewal_date": "2026-01-01",
                        "billing_period": "Yearly",
                    },
                ],
            },
            {
                "creator": users["zaheer@lahima.org"],
                "name": "Sales Department",
                "members": [users["bodaciousBenjamin@milk.com"].id],
                "receipts": [
                    {
                        "merchant": "Staples",
                        "total_amount": 45.00,
                        "currency": "USD",
                        "date": "2024-12-01",
                        "payment_method": "Credit",
                        "receipt_image_url": "https://catalog-receipt-storage.s3.us-east-2.amazonaws.com/receipts/receipt.jpg",
                        "items": [
                            {
                                "name": "Notebooks",
                                "category": "home",
                                "price": 3.00,
                                "quantity": 5,
                            },
                            {
                                "name": "Pens",
                                "category": "home",
                                "price": 0.50,
                                "quantity": 10,
                            },
                        ],
                    },
                ],
                "subscriptions": [
                    {
                        "merchant": "Willy Wonka's Weekly Jumping Rats Festival",
                        "total_amount": 5.00,
                        "currency": "USD",
                        "renewal_date": "2024-01-01",
                        "billing_period": "Weekly",
                    },
                ],
            },
        ]

        # Sample data for user-based Receipts
        receipts_data = [
            {
                "user_id": users["bodaciousBenjamin@milk.com"].id,
                "merchant": "Walmart",
                "total_amount": 420.00,
                "currency": "CAD",
                "date": "2024-12-25",
                "payment_method": "Credit",
                "receipt_image_url": "https://catalog-receipt-storage.s3.us-east-2.amazonaws.com/receipts/receipt.jpg",
                "items": [
                    {
                        "name": "Toilet Paper",
                        "category": "home",
                        "price": 5.00,
                        "quantity": 20,
                    },
                    {
                        "name": "Toilet",
                        "category": "fixtures",
                        "price": 320.00,
                        "quantity": 1,
                    },
                ],
            },
            {
                "user_id": users["bodaciousBenjamin@milk.com"].id,
                "merchant": "Target",
                "total_amount": 10.00,
                "currency": "USD",
                "date": "2024-12-31",
                "payment_method": "Cash",
                "receipt_image_url": "https://catalog-receipt-storage.s3.us-east-2.amazonaws.com/receipts/receipt.jpg",
                "items": [
                    {
                        "name": "Treenuts",
                        "category": "food",
                        "price": 0.50,
                        "quantity": 20,
                    },
                ],
            },
            {
                "user_id": users["zaheer@lahima.org"].id,
                "merchant": "KFC",
                "total_amount": 12.00,
                "currency": "USD",
                "date": "2024-12-31",
                "payment_method": "Debit",
                "receipt_image_url": "https://catalog-receipt-storage.s3.us-east-2.amazonaws.com/receipts/receipt.jpg",
                "items": [
                    {
                        "name": "Chicken Nuggets",
                        "category": "food",
                        "price": 12.00,
                        "quantity": 1,
                    },
                ],
            },
            {
                "user_id": users["zaheer@lahima.org"].id,
                "merchant": "Nike",
                "total_amount": 70.00,
                "currency": "USD",
                "date": "2024-12-31",
                "payment_method": "Credit",
                "receipt_image_url": "https://catalog-receipt-storage.s3.us-east-2.amazonaws.com/receipts/receipt.jpg",
                "items": [
                    {
                        "name": "Hoodie",
                        "category": "clothing",
                        "price": 70.00,
                        "quantity": 1,
                    },
                ],
            },
        ]

        # Sample data for user-based Subscriptions
        subscriptions_data = [
            {
                "user_id": users["bodaciousBenjamin@milk.com"].id,
                "merchant": "Netflix",
                "total_amount": 30.00,
                "currency": "CAD",
                "renewal_date": "2025-12-25",
                "billing_period": "Monthly",
            },
            {
                "user_id": users["zaheer@lahima.org"].id,
                "merchant": "Amazon Prime",
                "total_amount": 100.00,
                "currency": "USD",
                "renewal_date": "2026-11-15",
                "billing_period": "Yearly",
            },
            {
                "user_id": users["bodaciousBenjamin@milk.com"].id,
                "merchant": "PS Plus",
                "total_amount": 1000,
                "currency": "CAD",
                "renewal_date": "2027-01-01",
                "billing_period": "Yearly",
            },
        ]

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
                    group=new_group, user=User.objects.get(id=user_id)
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

            # Create Subscriptions for this group
            for s_data in g_data.get("subscriptions", []):
                Subscription.objects.create(
                    group=new_group,
                    merchant=s_data["merchant"],
                    total_amount=s_data["total_amount"],
                    currency=s_data["currency"],
                    renewal_date=s_data["renewal_date"],
                    billing_period=s_data["billing_period"],
                )

        self.stdout.write("Inserting user-based receipts...")

        # Insert user-based Receipts + Items
        for receipt_data in receipts_data:
            # Ensure receipt is linked to exactly one of user or group
            if ("user_id" in receipt_data and "group" in receipt_data) or (
                "user_id" not in receipt_data and "group" not in receipt_data
            ):
                raise ValueError(
                    "A receipt must be linked to either a user or a group, but not both."
                )
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

        # Insert user-based Subscriptions
        for subscription_data in subscriptions_data:
            # Ensure subscription is linked to exactly one of user or group
            if ("user_id" in subscription_data and "group" in subscription_data) or (
                "user_id" not in subscription_data and "group" not in subscription_data
            ):
                raise ValueError(
                    "A subscription must be linked to either a user or a group, but not both."
                )
            Subscription.objects.create(
                user_id=subscription_data["user_id"],
                merchant=subscription_data["merchant"],
                total_amount=subscription_data["total_amount"],
                currency=subscription_data["currency"],
                renewal_date=subscription_data["renewal_date"],
                billing_period=subscription_data["billing_period"],
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully inserted sample Groups, Receipts, Items, and Subscriptions!"
            )
        )
