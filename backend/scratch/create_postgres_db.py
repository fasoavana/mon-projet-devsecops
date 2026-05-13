import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db():
    try:
        # Connexion à la base par défaut 'postgres'
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='arotoky',
            host='localhost'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Création de la base de données
        cursor.execute('CREATE DATABASE reservation_db')
        print("Base de données 'reservation_db' créée avec succès !")
        
        cursor.close()
        conn.close()
    except psycopg2.errors.DuplicateDatabase:
        print("La base de données 'reservation_db' existe déjà.")
    except Exception as e:
        print(f"Erreur lors de la création de la base : {e}")

if __name__ == "__main__":
    create_db()
