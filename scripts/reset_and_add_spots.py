import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'database', 'surfgreen.db')

SPOTS = [
    # Индонезия (Бали)
    {'name': 'Uluwatu', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8296, 'longitude': 115.0841},
    {'name': 'Padang Padang', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8175, 'longitude': 115.1027},
    {'name': 'Bingin', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8065, 'longitude': 115.1104},
    {'name': 'Balangan', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8034, 'longitude': 115.1181},
    {'name': 'Dreamland', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7990, 'longitude': 115.1225},
    {'name': 'Kuta', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7186, 'longitude': 115.1689},
    {'name': 'Canggu', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.6482, 'longitude': 115.1382},
    {'name': 'Keramas', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.5917, 'longitude': 115.3653},
    {'name': 'Nusa Dua', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.8097, 'longitude': 115.2295},
    {'name': 'Sanur', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.7067, 'longitude': 115.2628},
    {'name': 'Medewi', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.3535, 'longitude': 114.7545},
    {'name': 'Balian', 'country': 'Indonesia', 'region': 'Bali', 'latitude': -8.4635, 'longitude': 115.1035},
    
    # Вьетнам (Дананг)
    {'name': 'China Beach (Non Nuoc)', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 15.9885, 'longitude': 108.2643},
    {'name': 'My Khe Beach', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 16.0615, 'longitude': 108.2492},
    {'name': 'Phuoc My', 'country': 'Vietnam', 'region': 'Da Nang', 'latitude': 16.0735, 'longitude': 108.2385},
    {'name': 'An Bang', 'country': 'Vietnam', 'region': 'Hoi An', 'latitude': 15.9055, 'longitude': 108.3405},
    {'name': 'Cua Dai', 'country': 'Vietnam', 'region': 'Hoi An', 'latitude': 15.8795, 'longitude': 108.3545},
    
    # Таиланд
    {'name': 'Kata Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8165, 'longitude': 98.2975},
    {'name': 'Karon Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8435, 'longitude': 98.2935},
    {'name': 'Surin Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.8845, 'longitude': 98.2895},
    {'name': 'Kamala Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.9435, 'longitude': 98.2835},
    {'name': 'Rawai Beach', 'country': 'Thailand', 'region': 'Phuket', 'latitude': 7.7765, 'longitude': 98.3085},
    
    # Филиппины
    {'name': 'Cloud 9', 'country': 'Philippines', 'region': 'Siargao', 'latitude': 9.8775, 'longitude': 126.0665},
    {'name': 'Jacking Horse', 'country': 'Philippines', 'region': 'Siargao', 'latitude': 9.8835, 'longitude': 126.0565},
    
    # Португалия
    {'name': 'Supertubos', 'country': 'Portugal', 'region': 'Peniche', 'latitude': 39.3622, 'longitude': -9.3847},
    {'name': 'Baleal', 'country': 'Portugal', 'region': 'Peniche', 'latitude': 39.3745, 'longitude': -9.3355},
    {'name': 'Carvoeiro', 'country': 'Portugal', 'region': 'Algarve', 'latitude': 37.1011, 'longitude': -8.4728},
    {'name': 'Sagres', 'country': 'Portugal', 'region': 'Algarve', 'latitude': 37.0086, 'longitude': -8.9439},
    {'name': 'Ericeira', 'country': 'Portugal', 'region': 'Lisbon', 'latitude': 38.9655, 'longitude': -9.4155},
]

def reset_and_add_spots():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Очистить таблицу
    cursor.execute("DELETE FROM spots")
    print("✅ Таблица очищена")
    
    # Добавить все споты заново
    added = 0
    for spot in SPOTS:
        cursor.execute('''
            INSERT INTO spots (name, country, region, latitude, longitude, beach_orientation)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (spot['name'], spot['country'], spot['region'], spot['latitude'], spot['longitude'], 'SE'))
        added += 1
        print(f"✅ Added: {spot['name']} ({spot['country']}, {spot['region']})")
    
    conn.commit()
    conn.close()
    print(f"\n🎉 Добавлено {added} спотов!")

if __name__ == '__main__':
    reset_and_add_spots()