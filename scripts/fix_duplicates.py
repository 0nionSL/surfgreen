#!/usr/bin/env python3
"""
Скрипт для поиска и удаления дубликатов спотов в базе данных SurfGreen
Запуск: python scripts/fix_duplicates.py
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')


def find_duplicates():
    """Найти все дубликаты спотов"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
        FROM spots 
        GROUP BY name 
        HAVING COUNT(*) > 1
    ''')
    
    duplicates = cursor.fetchall()
    conn.close()
    return duplicates


def show_duplicates():
    """Показать все дубликаты"""
    duplicates = find_duplicates()
    
    if not duplicates:
        print('\n✅ Дубликатов не найдено!')
        return
    
    print('\n' + '='*60)
    print(f'🔍 Найдено {len(duplicates)} дубликатов:')
    print('='*60)
    
    for name, count, ids in duplicates:
        print(f'\n📌 {name} ({count} дубликата)')
        print(f'   ID: {ids}')
    
    print('\n' + '='*60)


def delete_duplicates(keep_first=True):
    """
    Удалить дубликаты
    
    Args:
        keep_first: True — оставить первый (с минимальным id)
                   False — оставить последний (с максимальным id)
    """
    duplicates = find_duplicates()
    
    if not duplicates:
        print('\n✅ Дубликатов нет, удалять нечего')
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    deleted = 0
    
    for name, count, ids in duplicates:
        id_list = [int(x) for x in ids.split(',')]
        
        if keep_first:
            # Оставляем минимальный id
            keep_id = min(id_list)
        else:
            # Оставляем максимальный id
            keep_id = max(id_list)
        
        # Удаляем все, кроме keep_id
        delete_ids = [str(x) for x in id_list if x != keep_id]
        
        if delete_ids:
            cursor.execute(f'''
                DELETE FROM spots 
                WHERE id IN ({','.join(delete_ids)})
            ''')
            deleted += len(delete_ids)
            print(f'🗑️ Удалено {len(delete_ids)} дубликатов для "{name}" (оставлен ID {keep_id})')
    
    conn.commit()
    conn.close()
    
    print('\n' + '='*60)
    print(f'✅ Удалено {deleted} дубликатов')
    print('='*60)


def add_unique_constraint():
    """Добавить уникальное ограничение на поле name (чтобы дубликаты больше не появлялись)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_spot_name ON spots(name)')
        conn.commit()
        print('✅ Уникальный индекс создан (дубликаты больше не появятся)')
    except sqlite3.Error as e:
        if 'duplicate' in str(e).lower():
            print('❌ Ошибка: есть дубликаты. Сначала удалите их с помощью опции 2')
        else:
            print(f'❌ Ошибка: {e}')
    finally:
        conn.close()


def remove_unique_constraint():
    """Удалить уникальное ограничение"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('DROP INDEX IF EXISTS idx_unique_spot_name')
        conn.commit()
        print('✅ Уникальный индекс удалён')
    except sqlite3.Error as e:
        print(f'❌ Ошибка: {e}')
    finally:
        conn.close()


def show_menu():
    """Показать меню"""
    print('\n' + '='*60)
    print('🏄 SurfGreen — Управление дубликатами спотов')
    print('='*60)
    print('1. 🔍 Показать все дубликаты')
    print('2. 🗑️ Удалить дубликаты (оставить первый)')
    print('3. 🗑️ Удалить дубликаты (оставить последний)')
    print('4. 🔒 Добавить уникальное ограничение (защита от дубликатов)')
    print('5. 🔓 Удалить уникальное ограничение')
    print('6. 📊 Проверить количество спотов')
    print('0. ❌ Выход')
    print('='*60)


def show_stats():
    """Показать статистику спотов"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM spots')
    total = cursor.fetchone()[0]
    
    cursor.execute('SELECT country, COUNT(*) FROM spots GROUP BY country ORDER BY COUNT(*) DESC')
    countries = cursor.fetchall()
    
    conn.close()
    
    print('\n📊 Всего спотов:', total)
    print('📌 По странам:')
    for country, count in countries:
        print(f'   {country}: {count}')


def main():
    if not os.path.exists(DB_PATH):
        print(f'❌ База данных не найдена: {DB_PATH}')
        print('   Запусти сначала бэкенд: python -m uvicorn app.main:app --reload')
        return
    
    while True:
        show_menu()
        choice = input('\n👉 Выберите действие: ').strip()
        
        if choice == '1':
            show_duplicates()
        elif choice == '2':
            print('\n🗑️ Удаление дубликатов (оставить первый)...')
            delete_duplicates(keep_first=True)
        elif choice == '3':
            print('\n🗑️ Удаление дубликатов (оставить последний)...')
            delete_duplicates(keep_first=False)
        elif choice == '4':
            print('\n🔒 Добавление уникального ограничения...')
            add_unique_constraint()
        elif choice == '5':
            print('\n🔓 Удаление уникального ограничения...')
            remove_unique_constraint()
        elif choice == '6':
            show_stats()
        elif choice == '0':
            print('👋 До свидания!')
            break
        else:
            print('❌ Неверный выбор. Попробуйте снова.')
        
        input('\nНажмите Enter для продолжения...')


if __name__ == '__main__':
    main()