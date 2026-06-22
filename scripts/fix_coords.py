import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')

def fix_coordinates():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Исправить координаты для Индонезии (добавить минус)
    cursor.execute("UPDATE spots SET latitude = -latitude WHERE country = 'Indonesia' AND latitude > 0")
    conn.commit()
    
    # Проверить
    cursor.execute("SELECT id, name, latitude FROM spots WHERE country = 'Indonesia'")
    rows = cursor.fetchall()
    for row in rows:
        print(f"✅ {row[1]}: {row[2]}")
    
    conn.close()

if __name__ == '__main__':
    fix_coordinates()