import sys
import os

# Ajout du chemin du projet pour l'import
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.db import models
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Vérifier si l'admin existe déjà
        admin_email = "admin@secure.com"
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if admin:
            print(f"L'utilisateur {admin_email} existe déjà.")
            # On s'assure qu'il a le rôle admin
            admin.role = "admin"
            db.commit()
            print("Rôle admin vérifié.")
            return

        # Création de l'admin
        new_admin = models.User(
            email=admin_email,
            hashed_password=get_password_hash("admin"),
            full_name="System Administrator",
            role="admin"
        )
        
        db.add(new_admin)
        db.commit()
        print(f"Compte administrateur créé avec succès !")
        print(f"Email : {admin_email}")
        print(f"Mot de passe : admin")
        
    except Exception as e:
        print(f"Erreur lors de la création de l'admin : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
