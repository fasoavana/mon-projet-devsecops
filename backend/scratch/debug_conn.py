import psycopg2
import sys

print("Début du script...")
sys.stdout.flush()

try:
    print("Tentative de connexion à postgres...")
    sys.stdout.flush()
    conn = psycopg2.connect(
        dbname='reservation_db',
        user='postgres',
        password='arotoky',
        host='127.0.0.1',
        port='5432',
        connect_timeout=5
    )
    print("Connexion réussie !")
    sys.stdout.flush()
    conn.close()
except Exception as e:
    print(f"Erreur : {e}")
    sys.stdout.flush()

print("Fin du script.")
sys.stdout.flush()
