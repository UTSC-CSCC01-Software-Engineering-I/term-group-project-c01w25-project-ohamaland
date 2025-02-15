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
            "receipt_image_url": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fvectors%2Freceipt-png&psig=AOvVaw2Z3b5qKgbvetxrXiI-XB4L&ust=1739417968579000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJDKm4KbvYsDFQAAAAAdAAAAABAE"
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