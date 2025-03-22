# 🧾 Receipt OCR Processing with Azure Form Recognizer

## 📌 Overview
This Python script extracts structured data from receipt images using **Azure Form Recognizer**. It automatically detects:
- **Merchant Name**
- **Total Amount**
- **Currency**
- **Transaction Date**
- **Items (name, quantity, price, category)**
- **Payment Method**
- **OCR Confidence Score**

## 🚀 Features
- Uses **Azure Form Recognizer** for high-accuracy OCR.
- Categorizes receipt items automatically.
- Supports structured JSON output.
- Secure API key handling via **environment variables**.
- Can be extended to a web API.

---

## 🛠 How to Use This Code
### **1️⃣ Import the Receipt Processing Module**
To use the receipt OCR functions in your project, import the main function:
```python
from ocr_processor import process_receipt
```
### **2️⃣ Call the process_receipt Function**

```python
receipt_data = process_receipt(image_path, user_id)
print(receipt_data)
```

### **3️⃣ Example Output**

```python
{
    "id": 1989493682,
    "user_id": 1234,
    "merchant": "COCONUT HOUSE",
    "total_amount": 430.0,
    "currency": "USD",
    "date": "2012-05-18T00:00:00",
    "items": [
        {"id": 4080525539, "name": "Glass", "category": "Unknown", "price": 40.0, "quantity": 2},
        {"id": 2639223746, "name": "Suman", "category": "Unknown", "price": 65.0, "quantity": 1},
        {"id": 1182174895, "name": "Coco Dkoy", "category": "Unknown", "price": 85.0, "quantity": 1},
        {"id": 909285601, "name": "Pancit Buco Res", "category": "Unknown", "price": 105.0, "quantity": 1},
        {"id": 3798897147, "name": "Laing per order", "category": "Unknown", "price": 95.0, "quantity": 1},
        {"id": 3671414695, "name": "Organic Rice", "category": "Food", "price": 40.0, "quantity": 2}
    ],
    "payment_method": "Cash",
    "receipt_image_url": null,
    "ocr_confidence": 0.9618103448275861
}
```
