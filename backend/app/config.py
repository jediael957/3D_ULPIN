import os
from dotenv import load_dotenv

# Load environment variables from parent directory .env file if available
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path=env_path)

CESIUM_ION_TOKEN = os.getenv("CESIUM_ION_TOKEN", "")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sih_3d_cadastre")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
