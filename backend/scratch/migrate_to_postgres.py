import sqlite3
import psycopg2
import os

# Config
SQLITE_DB = "d:/secure_reservation_app/backend/reservations.db"
POSTGRES_CONFIG = {
    "dbname": "reservtion_db",
    "user": "postgres",
    "password": "arotoky",
    "host": "127.0.0.1",
    "port": "5432"
}

def migrate():
    # Forcer l'encodage client en UTF8 pour éviter les erreurs sur Windows
    os.environ['PGCLIENTENCODING'] = 'utf8'
    
    try:
        print("Connexion SQLite...")
        lite_conn = sqlite3.connect(SQLITE_DB)
        lite_conn.row_factory = sqlite3.Row
        lite_cur = lite_conn.cursor()

        print("Connexion PostgreSQL...")
        pg_conn = psycopg2.connect(**POSTGRES_CONFIG)
        pg_conn.set_client_encoding('UTF8')
        pg_cur = pg_conn.cursor()

        # Migration
        print("Récupération des données SQLite...")
        lite_cur.execute("SELECT * FROM users")
        users = lite_cur.fetchall()
        
        user_id_map = {}
        for user in users:
            email = user['email']
            # On s'assure que les strings sont traitées proprement
            full_name = user['full_name'] if user['full_name'] else ""
            
            pg_cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            exists = pg_cur.fetchone()
            
            if exists:
                user_id_map[user['id']] = exists[0]
                continue

            pg_cur.execute(
                "INSERT INTO users (email, hashed_password, role, full_name) VALUES (%s, %s, %s, %s) RETURNING id",
                (email, user['hashed_password'], user['role'], full_name)
            )
            user_id_map[user['id']] = pg_cur.fetchone()[0]

        lite_cur.execute("SELECT * FROM reservations")
        reservations = lite_cur.fetchall()
        for res in reservations:
            new_user_id = user_id_map.get(res['user_id'])
            if new_user_id:
                pg_cur.execute(
                    "INSERT INTO reservations (date, time, description, status, user_id) VALUES (%s, %s, %s, %s, %s)",
                    (res['date'], res['time'], res['description'], res['status'], new_user_id)
                )

        pg_conn.commit()
        print("Migration terminée avec succès !")

    except Exception as e:
        print(f"ERREUR : {e}")
    finally:
        if 'lite_conn' in locals(): lite_conn.close()
        if 'pg_conn' in locals(): pg_conn.close()

if __name__ == "__main__":
    migrate()
