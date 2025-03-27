import os
import uuid
import requests
import json
from dotenv import load_dotenv

# Load OpenAI API key from environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API key. Set OPENAI_API_KEY in environment variables.")


def call_gpt_vision(public_image_url):
    """
    Uses GPT-4 Vision to extract receipt data from a public image URL.
    """
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = (
        "You are a strict JSON API that extracts structured data from receipt images. "
        "Return only valid JSON in this format:\n\n"
        "{\n"
        "  \"merchant\": string,\n"
        "  \"date\": string (ISO 8601),\n"
        "  \"total_amount\": number,\n"
        "  \"currency\": \"USD\" | \"CAD\" | \"\",\n"
        "  \"payment_method\": \"Credit\" | \"Debit\" | \"Cash\" | \"\",\n"
        "  \"items\": [\n"
        "    {\"name\": string, \"quantity\": number, \"price\": number}\n"
        "  ]\n"
        "}\n\n"
        "Map credit card brands like Visa or Mastercard to \"Credit\".\n"
        "Return only the JSON — no explanation, no Markdown, no text outside the object."
    )

    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {
                        "url": public_image_url
                    }},
                ]
            }
        ],
        "max_tokens": 1000
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )

    response.raise_for_status()
    result = response.json()["choices"][0]["message"]["content"]
    return result


def parse_gpt_response(gpt_output):
    """
    Parses GPT-4 JSON response string into a dictionary.
    """
    try:
        data = json.loads(gpt_output)
    except json.JSONDecodeError:
        return {"error": "Failed to parse GPT-4 response."}

    items = data.get("items", [])
    parsed_items = []
    for item in items:
        parsed_items.append({
            "id": uuid.uuid4().int & (1 << 32) - 1,
            "name": item.get("name", "Unknown"),
            "quantity": int(item.get("quantity", 1)),
            "price": float(item.get("price", 0.0)),
        })

    return {
        "merchant": data.get("merchant", "Unknown"),
        "total_amount": float(data.get("total_amount", 0.0)),
        "currency": data.get("currency", "USD"),
        "date": data.get("date", "Unknown"),
        "payment_method": data.get("payment_method", "Unknown"),
        "items": parsed_items
    }


def process_receipt(public_image_url, user_id):
    """
    Processes a receipt image and extracts structured data using GPT-4 Vision.
    """
    gpt_response = call_gpt_vision(public_image_url)
    parsed_data = parse_gpt_response(gpt_response)

    if "error" in parsed_data:
        return parsed_data

    return {
        "id": uuid.uuid4().int & (1 << 32) - 1,
        "user_id": user_id,
        "merchant": parsed_data["merchant"],
        "total_amount": parsed_data["total_amount"],
        "currency": parsed_data["currency"],
        "date": parsed_data["date"],
        "items": parsed_data["items"],
        "payment_method": parsed_data["payment_method"],
        "receipt_image_url": public_image_url
    }