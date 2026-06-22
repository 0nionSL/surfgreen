#!/usr/bin/env python3
"""
Скрипт для проверки спотов в базе данных SurfGreen
Запуск: python scripts/check_spots.py
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')

def check_spots():
    """Проверка количества спотов в базе данных"""
    
    if not os.path.exists(DB_PATH):
        print(f'❌ База данных не найдена: {DB_PATH}')
        return
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Общее количество спотов
        cursor.execute("SELECT COUNT(*) FROM spots")
        total = cursor.fetchone()[0]
        
        # Споты по странам
        cursor.execute("SELECT country, COUNT(*) FROM spots GROUP BY country ORDER BY COUNT(*) DESC")
        countries = cursor.fetchall()
        
        # Споты по регионам
        cursor.execute("SELECT region, COUNT(*) FROM spots GROUP BY region ORDER BY COUNT(*) DESC LIMIT 10")
        regions = cursor.fetchall()
        
        # Все споты (первые 20)
        cursor.execute("SELECT id, name, country, region, latitude, longitude FROM spots ORDER BY id")
        all_spots = cursor.fetchall()
        
        conn.close()
        
        print('\n' + '='*60)
        print('🏄 SurfGreen — Статистика спотов')
        print('='*60)
        
        print(f'\n📊 Всего спотов: {total}')
        
        print('\n📌 По странам:')
        for country, count in countries:
            bar = '█' * (count // 2)
            print(f'   {country}: {count} {bar}')
        
        print('\n📌 По регионам (топ-10):')
        for region, count in regions:
            print(f'   {region}: {count}')
        
        print('\n📋 Все споты:')
        for spot_id, name, country, region, lat, lon in all_spots[:30]:
            print(f'   {spot_id:3}. {name:30} ({country}, {region})')
        
        if len(all_spots) > 30:
            print(f'   ... и ещё {len(all_spots) - 30} спотов')
        
        print('\n' + '='*60)
        
    except sqlite3.Error as e:
        print(f'❌ Ошибка базы данных: {e}')
    except Exception as e:
        print(f'❌ Ошибка: {e}')

if __name__ == '__main__':
    check_spots()