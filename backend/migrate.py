import os
os.environ["POSTGRES_HOST"] = "localhost"
os.environ["POSTGRES_PORT"] = "5432"
os.environ["POSTGRES_USER"] = "postgres"
os.environ["POSTGRES_PASSWORD"] = "arotoky"
os.environ["POSTGRES_DB"] = "reservations"

from database import Base, SessionLocal, engine
import models
import auth

print("Creation des tables...")
Base.metadata.create_all(bind=engine)
print("Tables creees avec succes!")

from models import User

db = SessionLocal()

existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
if not existing_admin:
    hashed_password = auth.get_password_hash("admin123")
    admin_user = User(email="admin@example.com", hashed_password=hashed_password, role="admin")
    db.add(admin_user)
    db.commit()
    print("Compte admin cree: admin@example.com / admin123")
else:
    print("Le compte admin existe deja")

db.close()
print("Migration terminee!")