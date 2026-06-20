import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'jixiang.db')
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE comments ADD COLUMN bookmarked BOOLEAN DEFAULT 0;")
        conn.commit()
        print("Successfully added 'bookmarked' column to 'comments' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("'bookmarked' column already exists in 'comments' table.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
