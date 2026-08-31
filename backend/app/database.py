import sys
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.config import DATABASE_URL

logger = logging.getLogger("uvicorn")

Base = declarative_base()

# Attempt PostGIS PostgreSQL engine setup; fallback to local SQLite database if connection fails or unconfigured
USE_POSTGIS = False
engine = None
SessionLocal = None

try:
    if "postgresql" in DATABASE_URL:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            USE_POSTGIS = True
            logger.info("Connected successfully to PostgreSQL/PostGIS database.")
    else:
        raise ValueError("Non-PostgreSQL URL specified")
except Exception as e:
    logger.warning(f"PostgreSQL/PostGIS not available ({str(e)}). Falling back to persistent local SQLite database for SIH prototype.")
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sih_3d.db")
    sqlite_url = f"sqlite:///{db_path}"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    USE_POSTGIS = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
