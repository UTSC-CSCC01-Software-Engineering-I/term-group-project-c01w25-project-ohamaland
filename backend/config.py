import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGODB_SETTINGS = {
    "db": "test",
    "host": os.getenv("MONGO_URI")
}
