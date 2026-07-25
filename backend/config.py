import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6LxyxznV0AIs_HKpHCF1lNM4_Fv7yegi0OvEK8NiM8TPg")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
DB_PATH = os.path.join(os.path.dirname(__file__), "finsight.db")
