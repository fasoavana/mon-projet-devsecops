from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Base de données SQLite (fichier local)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # obligatoire pour SQLite
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Dépendance pour FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()