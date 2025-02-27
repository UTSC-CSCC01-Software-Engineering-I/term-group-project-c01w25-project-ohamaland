import io
import re
import uuid
import cv2
import numpy as np
import pytesseract
from datetime import datetime
from google.cloud import vision

# Initialize Google Cloud Vision client
client = vision.ImageAnnotatorClient()

# Tesseract OCR Configuration
pytesseract.pytesseract.tesseract_cmd = "C:\Program Files\Tesseract-OCR"  # Adjust path if needed

# Categories for classifying items
CATEGORY_KEYWORDS = {
    "Home Goods": ["furniture", "lamp", "sofa", "table"],
    "Food": ["milk", "bread", "apple", "pizza", "burger", "juice", "rice"],
    "Clothing": ["shirt", "jeans", "jacket", "shoes"],
    "Fixture": ["light", "bulb", "pipe", "mirror"]
}

def preprocess_image(image_path):
    """
    Enhances image quality for better OCR accuracy.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # Convert to grayscale
    img = cv2.GaussianBlur(img, (3, 3), 0)  # Reduce noise
    _, img = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)  # Increase contrast
    return img

def extract_text_google_vision(image_path):
    """
    Extracts text using Google Cloud Vision OCR.
    """
    preprocessed_image = preprocess_image(image_path)
    _, encoded_image = cv2.imencode('.png', preprocessed_image)
    image_bytes = encoded_image.tobytes()

    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    return texts[0].description if texts else None

def extract_text_tesseract(image_path):
    """
    Extracts text using Tesseract OCR as a fallback.
    """
    preprocessed_image = preprocess_image(image_path)
    return pytesseract.image_to_string(preprocessed_image, config="--psm 6")

def extract_text_from_receipt(image_path):
    """
    Tries Google Vision OCR first, falls back to Tesseract if needed.
    """
    text = extract_text_google_vision(image_path)
    if not text:
        text = extract_text_tesseract(image_path)
    return text.strip()

def categorize_item(item_name):
    """
    Assigns a category to an item based on predefined keywords.
    """
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword.lower() in item_name.lower() for keyword in keywords):
            return category
    return "Unknown"

def extract_receipt_items(ocr_text):
    """
    Extracts items, quantities, and prices from receipt text.
    """
    item_pattern = r"([A-Za-z\s]+)\s+(\d+)\s+([\d\.]+)"
    items = []

    for match in re.findall(item_pattern, ocr_text):
        item_name, quantity, price = match
        item_data = {
            "id": uuid.uuid4().int & (1<<32)-1,
            "name": item_name.strip(),
            "category": categorize_item(item_name),
            "price": float(price),
            "quantity": int(quantity)
        }
        items.append(item_data)

    return items

def extract_receipt_details(ocr_text):
    """
    Extracts structured details like merchant, date, total amount, and payment method.
    """
    date_pattern = r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b"
    amount_pattern = r"Total[:\s]*([\d,]+\.\d{2})"
    merchant_pattern = r"(?i)([A-Za-z\s]+(?:LLC|Inc|Supermarket|Store|Cafe|Restaurant|Shop|Market|House|Circle Co.))"
    currency_pattern = r"\b(USD|CAD|\$|C\$)\b"
    payment_pattern = r"\b(Credit Card|Debit Card|Cash)\b"

    date_match = re.search(date_pattern, ocr_text)
    amount_match = re.search(amount_pattern, ocr_text)
    merchant_match = re.search(merchant_pattern, ocr_text)
    currency_match = re.search(currency_pattern, ocr_text)
    payment_match = re.search(payment_pattern, ocr_text)

    extracted_date = date_match.group(1) if date_match else "Unknown"
    formatted_date = None
    if extracted_date:
        try:
            formatted_date = datetime.strptime(extracted_date, "%d/%m/%Y").isoformat()
        except ValueError:
            try:
                formatted_date = datetime.strptime(extracted_date, "%m/%d/%Y").isoformat()
            except ValueError:
                formatted_date = extracted_date  # Keep original format if parsing fails

    extracted_currency = currency_match.group(1) if currency_match else "USD"
    extracted_currency = "USD" if extracted_currency == "$" else "CAD" if extracted_currency == "C$" else extracted_currency

    return {
        "merchant": merchant_match.group(1).strip() if merchant_match else "Unknown",
        "total_amount": float(amount_match.group(1).replace(",", "")) if amount_match else 0.0,
        "currency": extracted_currency,
        "date": formatted_date or "Unknown",
        "payment_method": payment_match.group(1) if payment_match else "Unknown"
    }

def process_receipt(image_path, user_id):
    """
    Processes a receipt image and extracts structured data.
    """
    ocr_text = extract_text_from_receipt(image_path)
    if not ocr_text:
        return {"error": "No text detected"}

    receipt_data = extract_receipt_details(ocr_text)
    receipt_items = extract_receipt_items(ocr_text)

    return {
        "id": uuid.uuid4().int & (1<<32)-1,
        "user_id": user_id,
        "merchant": receipt_data["merchant"],
        "total_amount": receipt_data["total_amount"],
        "currency": receipt_data["currency"],
        "date": receipt_data["date"],
        "items": receipt_items,
        "payment_method": receipt_data["payment_method"],
        "receipt_image_url": None
    }


"""

Example Usage

if __name__ == "__main__":
    image_path = "image.png"
    user_id = 1234  # Example user ID
    receipt = process_receipt(image_path, user_id)
    print(receipt)

"""