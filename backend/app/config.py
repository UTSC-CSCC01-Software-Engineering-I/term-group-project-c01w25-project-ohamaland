import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGODB_SETTINGS = {
    "db": "mydatabase",
    "host": os.getenv("MONGO_URI")
}
