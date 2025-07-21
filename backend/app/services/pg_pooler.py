import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

def get_pg_connection():
    """
    Returns a new psycopg2 connection to the Supabase Postgres pooler.
    Usage: with get_pg_connection() as conn:
               ...
    """
    return psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )

def test_pg_connection():
    """
    Test the connection by printing the current time from the database.
    """
    try:
        with get_pg_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT NOW();")
                result = cursor.fetchone()
                print("Current Time from DB:", result[0])
        print("Connection closed.")
    except Exception as e:
        print(f"Failed to connect: {e}") 