import sys
import os

# Ajout du chemin du projet pour l'import
sys.path.append(os.getcwd())

from app.db.session import engine, Base
from app.db import models

def create_tables():
    try:
        print("Tentative de création des tables dans PostgreSQL...")
        Base.metadata.create_all(bind=engine)
        print("Tables créées avec succès !")
    except Exception as e:
        print(f"ERREUR lors de la création : {e}")

if __name__ == "__main__":
    create_tables()
