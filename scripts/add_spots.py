#!/usr/bin/env python3
"""
Скрипт для добавления спотов в базу данных SurfGreen
Запуск: python scripts/add_spots.py
"""

import sqlite3
import os
import sys

# Добавляем путь к backend в sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Путь к базе данных
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')

# Список спотов для добавления
SPOTS = [
    # ========== ИНДОНЕЗИЯ (Бали) ==========
    {'name': 'Uluwatu', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8296, 'longitude': 115.0841, 'beach_orientation': 'SE'},
    {'name': 'Padang Padang', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8175, 'longitude': 115.1027, 'beach_orientation': 'SE'},
    {'name': 'Bingin', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8065, 'longitude': 115.1104, 'beach_orientation': 'SE'},
    {'name': 'Balangan', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8034, 'longitude': 115.1181, 'beach_orientation': 'SE'},
    {'name': 'Dreamland', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7990, 'longitude': 115.1225, 'beach_orientation': 'SE'},
    {'name': 'Kuta', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7186, 'longitude': 115.1689, 'beach_orientation': 'SW'},
    {'name': 'Canggu', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.6482, 'longitude': 115.1382, 'beach_orientation': 'SW'},
    {'name': 'Keramas', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.5917, 'longitude': 115.3653, 'beach_orientation': 'E'},
    {'name': 'Nusa Dua', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8097, 'longitude': 115.2295, 'beach_orientation': 'SE'},
    {'name': 'Sanur', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7067, 'longitude': 115.2628, 'beach_orientation': 'E'},
    {'name': 'Medewi', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.3535, 'longitude': 114.7545, 'beach_orientation': 'SW'},
    {'name': 'Balian', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.4635, 'longitude': 115.1035, 'beach_orientation': 'SW'},
    
    # ========== ВЬЕТНАМ (Дананг — ты там будешь!) ==========
    {'name': 'China Beach (Non Nuoc)', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 15.9885, 'longitude': 108.2643, 'beach_orientation': 'NE'},
    {'name': 'My Khe Beach', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 16.0615, 'longitude': 108.2492, 'beach_orientation': 'NE'},
    {'name': 'Phuoc My', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 16.0735, 'longitude': 108.2385, 'beach_orientation': 'NE'},
    {'name': 'An Bang', 'country': 'Vietnam', 'region': 'Hoi An', 'latitude': 15.9055, 'longitude': 108.3405, 'beach_orientation': 'NE'},
    {'name': 'Cua Dai', 'country': 'Vietnam', 'region': 'Hoi An', 'latitude': 15.8795, 'longitude': 108.3545, 'beach_orientation': 'NE'},
    
    # ========== ТАИЛАНД ==========
    {'name': 'Kata Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8165, 'longitude': 98.2975, 'beach_orientation': 'SW'},
    {'name': 'Karon Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8435, 'longitude': 98.2935, 'beach_orientation': 'SW'},
    {'name': 'Surin Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8845, 'longitude': 98.2895, 'beach_orientation': 'SW'},
    {'name': 'Kamala Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.9435, 'longitude': 98.2835, 'beach_orientation': 'SW'},
    {'name': 'Rawai Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.7765, 'longitude': 98.3085, 'beach_orientation': 'SW'},
    
    # ========== ФИЛИППИНЫ ==========
    {'name': 'Cloud 9', 'country': 'Philippines', 'region': 'Siargao', 'latitude': 9.8775, 'longitude': 126.0665, 'beach_orientation': 'SE'},
    {'name': 'Jacking Horse', 'country': 'Philippines', 'region': 'Siargao', 'latitude': 9.8835, 'longitude': 126.0565, 'beach_orientation': 'SE'},
    
    # ========== ПОРТУГАЛИЯ ==========
    {'name': 'Supertubos', 'country': 'Portugal', 'region': 'Peniche', 'latitude': 39.3622, 'longitude': -9.3847, 'beach_orientation': 'W'},
    {'name': 'Baleal', 'country': 'Portugal', 'region': 'Peniche', 'latitude': 39.3745, 'longitude': -9.3355, 'beach_orientation': 'W'},
    {'name': 'Carvoeiro', 'country': 'Portugal', 'region': 'Algarve', 'latitude': 37.1011, 'longitude': -8.4728, 'beach_orientation': 'S'},
    {'name': 'Sagres', 'country': 'Portugal', 'region': 'Algarve', 'latitude': 37.0086, 'longitude': -8.9439, 'beach_orientation': 'S'},
    {'name': 'Ericeira', 'country': 'Portugal', 'region': 'Lisbon', 'latitude': 38.9655, 'longitude': -9.4155, 'beach_orientation': 'W'},
]

def add_spots():
    """Добавление спотов в базу данных"""
    
    # Проверяем, существует ли база данных
    if not os.path.exists(DB_PATH):
        print(f'❌ База данных не найдена: {DB_PATH}')
        print('   Запусти сначала бэкенд: python -m uvicorn app.main:app --reload')
        return
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Проверяем, есть ли таблица spots
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='spots'")
        if not cursor.fetchone():
            print('❌ Таблица "spots" не найдена в базе данных')
            print('   Запусти сначала бэкенд для создания таблиц')
            conn.close()
            return
        
        added = 0
        skipped = 0
        
        for spot in SPOTS:
            try:
                cursor.execute('''
                    INSERT INTO spots (name, country, region, latitude, longitude, beach_orientation)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (spot['name'], spot['country'], spot['region'], spot['latitude'], spot['longitude'], spot['beach_orientation']))
                added += 1
                print(f'✅ Added: {spot["name"]} ({spot["country"]}, {spot["region"]})')
            except sqlite3.IntegrityError:
                skipped += 1
                print(f'⏭️ Already exists: {spot["name"]}')
        
        conn.commit()
        conn.close()
        
        print('\n' + '='*50)
        print(f'✅ Добавлено: {added} новых спотов')
        print(f'⏭️ Пропущено (уже есть): {skipped}')
        print('='*50)
        
    except sqlite3.Error as e:
        print(f'❌ Ошибка базы данных: {e}')
    except Exception as e:
        print(f'❌ Ошибка: {e}')

if __name__ == '__main__':
    print('🏄 SurfGreen — Добавление спотов')
    print('='*50)
    add_spots()#!/usr/bin/env python3
"""
Скрипт для добавления спотов в базу данных SurfGreen
Запуск: python scripts/add_spots.py
"""

import sqlite3
import os
import sys

# Добавляем путь к backend в sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Путь к базе данных
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')

# Список спотов для добавления
SPOTS = [
    # ========== ИНДОНЕЗИЯ (Бали) ==========
    {'name': 'Uluwatu', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8296, 'longitude': 115.0841, 'beach_orientation': 'SE'},
    {'name': 'Padang Padang', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8175, 'longitude': 115.1027, 'beach_orientation': 'SE'},
    {'name': 'Bingin', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8065, 'longitude': 115.1104, 'beach_orientation': 'SE'},
    {'name': 'Balangan', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8034, 'longitude': 115.1181, 'beach_orientation': 'SE'},
    {'name': 'Dreamland', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7990, 'longitude': 115.1225, 'beach_orientation': 'SE'},
    {'name': 'Kuta', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7186, 'longitude': 115.1689, 'beach_orientation': 'SW'},
    {'name': 'Canggu', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.6482, 'longitude': 115.1382, 'beach_orientation': 'SW'},
    {'name': 'Keramas', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.5917, 'longitude': 115.3653, 'beach_orientation': 'E'},
    {'name': 'Nusa Dua', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8097, 'longitude': 115.2295, 'beach_orientation': 'SE'},
    {'name': 'Sanur', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7067, 'longitude': 115.2628, 'beach_orientation': 'E'},
    {'name': 'Medewi', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.3535, 'longitude': 114.7545, 'beach_orientation': 'SW'},
    {'name': 'Balian', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.4635, 'longitude': 115.1035, 'beach_orientation': 'SW'},
    
    # ========== ВЬЕТНАМ (Дананг — ты там будешь!) ==========
    {'name': 'China Beach (Non Nuoc)', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 15.9885, 'longitude': 108.2643, 'beach_orientation': 'NE'},
    {'name': 'My Khe Beach', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 16.0615, 'longitude': 108.2492, 'beach_orientation': 'NE'},
    {'name': 'Phuoc My', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 16.0735, 'longitude': 108.2385, 'beach_orientation': 'NE'},
    {'name': 'An Bang', 'country': 'Vietnam', 'region': 'Hoi An', 'latitude': 15.9055, 'longitude': 108.3405, 'beach_orientation': 'NE'},
    {'name': 'Cua Dai', 'country': 'Vietnam', 'region': 'Hoi An', 'latitude': 15.8795, 'longitude': 108.3545, 'beach_orientation': 'NE'},
    
    # ========== ТАИЛАНД ==========
    {'name': 'Kata Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8165, 'longitude': 98.2975, 'beach_orientation': 'SW'},
    {'name': 'Karon Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8435, 'longitude': 98.2935, 'beach_orientation': 'SW'},
    {'name': 'Surin Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8845, 'longitude': 98.2895, 'beach_orientation': 'SW'},
    {'name': 'Kamala Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.9435, 'longitude': 98.2835, 'beach_orientation': 'SW'},
    {'name': 'Rawai Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.7765, 'longitude': 98.3085, 'beach_orientation': 'SW'},
    
    # ========== ФИЛИППИНЫ ==========
    {'name': 'Cloud 9', 'country': 'Philippines', 'region': 'Siargao', 'latitude': 9.8775, 'longitude': 126.0665, 'beach_orientation': 'SE'},
    {'name': 'Jacking Horse', 'country': 'Philippines', 'region': 'Siargao', 'latitude': 9.8835, 'longitude': 126.0565, 'beach_orientation': 'SE'},
    
    # ========== ПОРТУГАЛИЯ ==========
    {'name': 'Supertubos', 'country': 'Portugal', 'region': 'Peniche', 'latitude': 39.3622, 'longitude': -9.3847, 'beach_orientation': 'W'},
    {'name': 'Baleal', 'country': 'Portugal', 'region': 'Peniche', 'latitude': 39.3745, 'longitude': -9.3355, 'beach_orientation': 'W'},
    {'name': 'Carvoeiro', 'country': 'Portugal', 'region': 'Algarve', 'latitude': 37.1011, 'longitude': -8.4728, 'beach_orientation': 'S'},
    {'name': 'Sagres', 'country': 'Portugal', 'region': 'Algarve', 'latitude': 37.0086, 'longitude': -8.9439, 'beach_orientation': 'S'},
    {'name': 'Ericeira', 'country': 'Portugal', 'region': 'Lisbon', 'latitude': 38.9655, 'longitude': -9.4155, 'beach_orientation': 'W'},
]

def add_spots():
    """Добавление спотов в базу данных"""
    
    # Проверяем, существует ли база данных
    if not os.path.exists(DB_PATH):
        print(f'❌ База данных не найдена: {DB_PATH}')
        print('   Запусти сначала бэкенд: python -m uvicorn app.main:app --reload')
        return
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Проверяем, есть ли таблица spots
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='spots'")
        if not cursor.fetchone():
            print('❌ Таблица "spots" не найдена в базе данных')
            print('   Запусти сначала бэкенд для создания таблиц')
            conn.close()
            return
        
        added = 0
        skipped = 0
        
        for spot in SPOTS:
            try:
                cursor.execute('''
                    INSERT INTO spots (name, country, region, latitude, longitude, beach_orientation)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (spot['name'], spot['country'], spot['region'], spot['latitude'], spot['longitude'], spot['beach_orientation']))
                added += 1
                print(f'✅ Added: {spot["name"]} ({spot["country"]}, {spot["region"]})')
            except sqlite3.IntegrityError:
                skipped += 1
                print(f'⏭️ Already exists: {spot["name"]}')
        
        conn.commit()
        conn.close()
        
        print('\n' + '='*50)
        print(f'✅ Добавлено: {added} новых спотов')
        print(f'⏭️ Пропущено (уже есть): {skipped}')
        print('='*50)
        
    except sqlite3.Error as e:
        print(f'❌ Ошибка базы данных: {e}')
    except Exception as e:
        print(f'❌ Ошибка: {e}')

if __name__ == '__main__':
    print('🏄 SurfGreen — Добавление спотов')
    print('='*50)
    add_spots()