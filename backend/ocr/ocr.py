import os
import re
import uuid
from datetime import datetime
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

# Load keys from environment variables
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_KEY = os.getenv("AZURE_KEY")

# Ensure keys are set before proceeding
if not AZURE_ENDPOINT or not AZURE_KEY:
    raise ValueError(
        "Azure credentials are missing. Set AZURE_ENDPOINT and AZURE_KEY as environment variables."
    )

def extract_text_azure(image_path):
    """
    Extracts text from an image using Azure Form Recognizer.
    """
    client = DocumentAnalysisClient(
        endpoint=AZURE_ENDPOINT, credential=AzureKeyCredential(AZURE_KEY)
    )

    with open(image_path, "rb") as f:
        poller = client.begin_analyze_document("prebuilt-receipt", document=f)
        result = poller.result()

    extracted_text = []
    confidence_scores = []

    for page in result.pages:
        for word in page.words:
            extracted_text.append(word.content)
            confidence_scores.append(word.confidence)

    avg_confidence = (
        sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
    )
    return " ".join(extracted_text), avg_confidence


def extract_receipt_items(ocr_text):
    """
    Extracts items, quantities, and prices from receipt text.
    """
    item_pattern = r"([A-Za-z\s]+)\s+(\d+)\s+([\d\.]+)"
    items = []

    for match in re.findall(item_pattern, ocr_text):
        item_name, quantity, price = match
        item_data = {
            "id": uuid.uuid4().int & (1 << 32) - 1,
            "name": item_name.strip(),
            "price": float(price.replace(",", "")),
            "quantity": int(quantity),
        }
        items.append(item_data)

    return items


def extract_receipt_details(ocr_text):
    """
    Extracts structured details like merchant, date, total amount, and payment method.
    """
    date_pattern = r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{2}[/-]\d{2})"
    amount_pattern = r"(?:Total|Bill Amount|Grand Total)[:\s]*([\d,]+\.\d{2})"
    merchant_pattern = r"(?i)([A-Za-z\s&]+(?:LLC|Inc|Supermarket|Store|Cafe|Restaurant|Shop|Market|House|Circle Co\.?))"
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
                formatted_date = datetime.strptime(
                    extracted_date, "%m/%d/%Y"
                ).isoformat()
            except ValueError:
                formatted_date = extracted_date

    extracted_currency = currency_match.group(1) if currency_match else "USD"
    extracted_currency = (
        "USD"
        if extracted_currency == "$"
        else "CAD" if extracted_currency == "C$" else extracted_currency
    )

    return {
        "merchant": merchant_match.group(1).strip() if merchant_match else "Unknown",
        "total_amount": (
            float(amount_match.group(1).replace(",", "")) if amount_match else 0.0
        ),
        "currency": extracted_currency,
        "date": formatted_date or "Unknown",
        "payment_method": payment_match.group(1) if payment_match else "Unknown",
    }


def process_receipt(image_path, user_id):
    """
    Processes a receipt image and extracts structured data.
    """
    ocr_text, confidence = extract_text_azure(image_path)
    if not ocr_text:
        return {"error": "No text detected"}

    receipt_data = extract_receipt_details(ocr_text)
    receipt_items = extract_receipt_items(ocr_text)

    return {
        "id": uuid.uuid4().int & (1 << 32) - 1,
        "user_id": user_id,
        "merchant": receipt_data["merchant"],
        "total_amount": receipt_data["total_amount"],
        "currency": receipt_data["currency"],
        "date": receipt_data["date"],
        "items": receipt_items,
        "payment_method": receipt_data["payment_method"],
        "receipt_image_url": None,
        "ocr_confidence": confidence,  # Added OCR confidence score
    }