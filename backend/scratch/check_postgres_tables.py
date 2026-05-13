import psycopg2

def check_tables():
    try:
        conn = psycopg2.connect(
            dbname='reservation_db',
            user='postgres',
            password='arotoky',
            host='localhost'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cursor.fetchall()
        print("Tables trouvées :", tables)
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Erreur lors de la vérification des tables : {e}")

if __name__ == "__main__":
    check_tables()
