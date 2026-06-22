import time
from typing import Dict, Any, Optional

class CacheService:
    """Сервис кэширования данных в памяти"""
    
    def __init__(self, ttl: int = 300):
        """
        Args:
            ttl: Время жизни кэша в секундах (по умолчанию 5 минут)
        """
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl
    
    def get(self, key: str) -> Optional[Any]:
        """Получить значение из кэша"""
        if key in self.cache:
            data = self.cache[key]
            if time.time() - data['timestamp'] < self.ttl:
                return data['value']
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any):
        """Сохранить значение в кэш"""
        self.cache[key] = {
            'value': value,
            'timestamp': time.time()
        }
    
    def clear(self):
        """Очистить кэш"""
        self.cache.clear()
    
    def get_stats(self) -> Dict[str, int]:
        """Получить статистику кэша"""
        return {
            'size': len(self.cache),
            'keys': list(self.cache.keys())
        }


# Глобальный кэш для прогнозов
forecast_cache = CacheService(ttl=300)  # 5 минут