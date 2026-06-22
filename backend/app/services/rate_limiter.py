import asyncio
import time
from typing import List, Any, Optional

class RateLimiter:
    """Ограничитель частоты запросов к API"""
    
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = []
    
    async def wait_if_needed(self):
        """Ожидать, если превышен лимит"""
        now = time.time()
        # Убираем старые вызовы
        self.calls = [c for c in self.calls if c > now - self.period]
        if len(self.calls) >= self.max_calls:
            wait_time = self.period - (now - self.calls[0])
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        self.calls.append(now)

    async def __aenter__(self):
        await self.wait_if_needed()
        return self
    
    async def __aexit__(self, *args):
        pass


class BatchProcessor:
    """Обработчик пакетной загрузки с задержками между пачками"""
    
    def __init__(self, batch_size: int = 5, delay_between_batches: float = 0.5):
        self.batch_size = batch_size
        self.delay_between_batches = delay_between_batches
        self.limiter = RateLimiter(max_calls=batch_size, period=1.0)
    
    async def process(
        self, 
        items: List[Any], 
        process_func, 
        *args, 
        **kwargs
    ) -> List[Any]:
        """
        Обработать элементы пачками
        
        Args:
            items: Список элементов для обработки
            process_func: Асинхронная функция для обработки одного элемента
            *args, **kwargs: Дополнительные аргументы для process_func
        
        Returns:
            List[Any]: Результаты обработки
        """
        results = []
        total = len(items)
        
        for i in range(0, total, self.batch_size):
            batch = items[i:i + self.batch_size]
            
            # Ждём, если нужно (для соблюдения лимита)
            await self.limiter.wait_if_needed()
            
            # Обрабатываем пачку
            batch_tasks = [process_func(item, *args, **kwargs) for item in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Обрабатываем результаты
            for result in batch_results:
                if isinstance(result, Exception):
                    print(f'❌ Batch error: {result}')
                    results.append(None)
                else:
                    results.append(result)
            
            # Пауза между пачками
            if i + self.batch_size < total:
                await asyncio.sleep(self.delay_between_batches)
        
        return results


# Глобальные экземпляры
spot_limiter = RateLimiter(max_calls=8, period=1.0)  # 8 запросов в секунду
batch_processor = BatchProcessor(batch_size=5, delay_between_batches=0.5)