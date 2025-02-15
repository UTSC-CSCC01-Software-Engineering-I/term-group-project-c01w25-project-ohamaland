import { Receipt } from "@/types/receipts";

export const tempReceipts: Receipt[] =
    [
        {
            "_id": 1,
            "user_id": 69,
            "merchant": "Walmart",
            "total_amount": 420.00,
            "currency": "CAD",
            "date": "2024-12-25T00:00:00.000Z",
            "items": [
                {
                    "_id": 3,
                    "name": "Toilet Paper",
                    "category": "Home Goods",
                    "price": 5.00,
                    "quantity": 20
                },
                {
                    "_id": 4,
                    "name": "Toilet",
                    "category": "Fixture",
                    "price": 320.00,
                    "quantity": 1
                }
            ],
            "payment_method": "Credit Card",
            "receipt_image_url": "data:image/jpeg;base64,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"
        },
        {
            "_id": 2,
            "user_id": 70,
            "merchant": "Target",
            "total_amount": 10.00,
            "currency": "USD",
            "date": "2024-12-31T00:00:00.000Z",
            "items": [
                {
                    "_id": 80,
                    "name": "Treenuts",
                    "category": "Food",
                    "price": 0.50,
                    "quantity": 20
                }
            ],
            "payment_method": "Cash",
            "receipt_image_url": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fvectors%2Freceipt-png&psig=AOvVaw2Z3b5qKgbvetxrXiI-XB4L&ust=1739417968579000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJDKm4KbvYsDFQAAAAAdAAAAABAE"
        },
        {
            "_id": 3,
            "user_id": 100,
            "merchant": "KFC",
            "total_amount": 12.00,
            "currency": "USD",
            "date": "2024-12-31T00:00:00.000Z",
            "items": [
                {
                    "_id": 55,
                    "name": "Chicken Nuggets",
                    "category": "Food",
                    "price": 12.00,
                    "quantity": 1
                }
            ],
            "payment_method": "Debit Card",
            "receipt_image_url": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fvectors%2Freceipt-png&psig=AOvVaw2Z3b5qKgbvetxrXiI-XB4L&ust=1739417968579000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJDKm4KbvYsDFQAAAAAdAAAAABAE"
        },
        {
            "_id": 52,
            "user_id": 200,
            "merchant": "Nike",
            "total_amount": 70.00,
            "currency": "USD",
            "date": "2024-12-31T00:00:00.000Z",
            "items": [
                {
                    "_id": 80,
                    "name": "Hoodie",
                    "category": "Clothing",
                    "price": 70.00,
                    "quantity": 1
                }
            ],
            "payment_method": "Credit Card",
            "receipt_image_url": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fvectors%2Freceipt-png&psig=AOvVaw2Z3b5qKgbvetxrXiI-XB4L&ust=1739417968579000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJDKm4KbvYsDFQAAAAAdAAAAABAE"
        }
    ]