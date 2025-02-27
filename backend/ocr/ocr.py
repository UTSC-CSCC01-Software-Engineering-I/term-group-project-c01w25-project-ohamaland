import io
import re
import uuid
import cv2
import numpy as np
from datetime import datetime
from google.cloud import vision

# Initialize Google Cloud Vision OCR client
client = vision.ImageAnnotatorClient()

# Predefined categories for classifying items
CATEGORY_KEYWORDS = {
    "Home Goods": ["furniture", "lamp", "sofa", "table"],
    "Food": ["milk", "bread", "apple", "pizza", "burger"],
    "Clothing": ["shirt", "jeans", "jacket", "shoes"],
    "Fixture": ["light", "bulb", "pipe", "mirror"]
}

def preprocess_image(image_path):
    """
    Preprocesses the receipt image to improve OCR accuracy.
    - Converts to grayscale
    - Applies Gaussian Blur for noise reduction
    - Uses Adaptive Thresholding for better contrast

    Args:
        image_path (str): Path to the image file.

    Returns:
        Processed image as a NumPy array.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # Convert to grayscale
    img = cv2.GaussianBlur(img, (5, 5), 0)  # Reduce noise
    _, img = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)  # Increase contrast
    return img

def extract_text_from_receipt(image_path):
    """
    Extracts text from a receipt image using Google Cloud Vision API.

    Args:
        image_path (str): Path to the receipt image file.

    Returns:
        str: Extracted text from the receipt.
    """
    preprocessed_image = preprocess_image(image_path)

    # Convert processed image to bytes for OCR
    _, encoded_image = cv2.imencode('.png', preprocessed_image)
    image_bytes = encoded_image.tobytes()

    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    return texts[0].description if texts else None

def categorize_item(item_name):
    """
    Categorizes an item based on predefined keywords.

    Args:
        item_name (str): Name of the item.

    Returns:
        str: The assigned category.
    """
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword.lower() in item_name.lower() for keyword in keywords):
            return category
    return "Fixture"  # Default category if no match found

def extract_receipt_items(ocr_text):
    """
    Parses receipt text to extract item details such as name, quantity, and price.

    Args:
        ocr_text (str): Extracted text from the receipt.

    Returns:
        list[dict]: A list of structured items.
    """
    item_pattern = r"([A-Za-z\s]+)\s+(\d+)\s+(\d+\.\d{2})"
    items = []
    item_matches = re.findall(item_pattern, ocr_text)

    for match in item_matches:
        item_name, quantity, price = match
        item_id = uuid.uuid4().int & (1<<32)-1  # Unique ID

        item_data = {
            "id": item_id,
            "name": item_name.strip(),
            "category": categorize_item(item_name),
            "price": float(price),
            "quantity": int(quantity)
        }
        items.append(item_data)

    return items

def extract_receipt_details(ocr_text):
    """
    Extracts structured details from the receipt, including:
    - Merchant name
    - Date
    - Total amount
    - Currency
    - Payment method

    Args:
        ocr_text (str): Extracted text from the receipt.

    Returns:
        dict: Structured receipt details.
    """
    date_pattern = r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b"
    amount_pattern = r"\b(\d{1,4}(?:,\d{3})*(?:\.\d{2}))\b"
    merchant_pattern = r"(?i)([A-Za-z\s]+(?:LLC|Inc|Supermarket|Store|Cafe|Restaurant|Shop|Market))"
    currency_pattern = r"\b(USD|CAD|\$|C\$)\b"
    payment_method_pattern = r"\b(Credit Card|Debit Card|Cash)\b"

    date_match = re.search(date_pattern, ocr_text)
    amount_match = re.search(amount_pattern, ocr_text)
    merchant_match = re.search(merchant_pattern, ocr_text)
    currency_match = re.search(currency_pattern, ocr_text)
    payment_match = re.search(payment_method_pattern, ocr_text)

    extracted_date = date_match.group(1) if date_match else None
    formatted_date = None
    if extracted_date:
        try:
            formatted_date = datetime.strptime(extracted_date, "%d/%m/%Y").isoformat()
        except ValueError:
            try:
                formatted_date = datetime.strptime(extracted_date, "%m/%d/%Y").isoformat()
            except ValueError:
                formatted_date = extracted_date  # Keep as string if parsing fails

    extracted_currency = currency_match.group(1) if currency_match else "USD"
    if extracted_currency in ["$", "C$"]:
        extracted_currency = "USD" if extracted_currency == "$" else "CAD"

    return {
        "merchant": merchant_match.group(1) if merchant_match else "Unknown",
        "total_amount": float(amount_match.group(1).replace(",", "")) if amount_match else 0.0,
        "currency": extracted_currency,
        "date": formatted_date or "Unknown",
        "payment_method": payment_match.group(1) if payment_match else ""
    }

def process_receipt(image_path, user_id):
    """
    Processes a receipt image and extracts structured data.

    Steps:
    1. Runs OCR on the receipt image.
    2. Extracts structured receipt details (merchant, amount, date, etc.).
    3. Extracts individual items (name, price, quantity, category).
    4. Returns a structured receipt object.

    Args:
        image_path (str): Path to the receipt image.
        user_id (int): Unique ID of the user who uploaded the receipt.

    Returns:
        dict: The structured receipt data in JSON format.
    """
    ocr_text = extract_text_from_receipt(image_path)
    if not ocr_text:
        return None  # No text detected

    receipt_data = extract_receipt_details(ocr_text)
    receipt_items = extract_receipt_items(ocr_text)

    receipt = {
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

    return receipt

# Example Usage
if __name__ == "__main__":
    image_path = "image.png"
    user_id = 1234  # Example user ID
    receipt = process_receipt(image_path, user_id)
    print(receipt)