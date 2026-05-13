import sqlite3
import os

db_path = "reservations.db"

def update_db():
    if not os.path.exists(db_path):
        print(f"Base de données {db_path} introuvable.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Mise à jour de la table users
    print("Vérification de la table 'users'...")
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'full_name' not in columns:
        print("Ajout de la colonne 'full_name' à 'users'...")
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
    
    if 'created_at' not in columns:
        print("Ajout de la colonne 'created_at' à 'users'...")
        cursor.execute("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")

    # Mise à jour de la table reservations
    print("Vérification de la table 'reservations'...")
    cursor.execute("PRAGMA table_info(reservations)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'status' not in columns:
        print("Ajout de la colonne 'status' à 'reservations'...")
        cursor.execute("ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT 'confirmed'")
    
    if 'created_at' not in columns:
        print("Ajout de la colonne 'created_at' à 'reservations'...")
        cursor.execute("ALTER TABLE reservations ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")

    conn.commit()
    conn.close()
    print("Mise à jour de la base de données terminée !")

if __name__ == "__main__":
    update_db()
