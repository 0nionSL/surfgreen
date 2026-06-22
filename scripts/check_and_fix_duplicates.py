import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')

def check_and_fix_duplicates():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Найти дубликаты по названию
    cursor.execute('''
        SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
        FROM spots 
        GROUP BY name 
        HAVING COUNT(*) > 1
    ''')
    
    duplicates = cursor.fetchall()
    
    if not duplicates:
        print("✅ Дубликатов не найдено!")
        conn.close()
        return
    
    print(f"🔍 Найдено {len(duplicates)} дубликатов:\n")
    
    for name, count, ids in duplicates:
        print(f"📌 {name} ({count} дубликата)")
        print(f"   ID: {ids}")
        
        # Оставляем первый (с минимальным ID)
        id_list = [int(x) for x in ids.split(',')]
        keep_id = min(id_list)
        delete_ids = [str(x) for x in id_list if x != keep_id]
        
        cursor.execute(f'''
            DELETE FROM spots 
            WHERE id IN ({','.join(delete_ids)})
        ''')
        
        print(f"   ✅ Оставлен ID {keep_id}, удалено {len(delete_ids)} дубликатов\n")
    
    conn.commit()
    conn.close()
    print("🎉 Дубликаты удалены!")

if __name__ == '__main__':
    check_and_fix_duplicates()