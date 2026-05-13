import psycopg2

def list_dbs():
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='arotoky',
            host='127.0.0.1'
        )
        cur = conn.cursor()
        cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        dbs = cur.fetchall()
        print("Bases de données trouvées :", [db[0] for db in dbs])
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Erreur : {e}")

if __name__ == "__main__":
    list_dbs()
