import { api } from './api';
import { SpotWithForecast } from '../types';

let cache: SpotWithForecast[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export const fetchSpotsWithForecast = async (): Promise<SpotWithForecast[]> => {
  const now = Date.now();
  
  // Возвращаем кэш, если он свежий
  if (cache && now - cacheTime < CACHE_DURATION) {
    console.log('📦 Returning cached spots:', cache.length);
    return cache;
  }
  
  try {
    console.log('🔄 Fetching fresh data...');
    const spotsResponse = await api.get('/api/spots');
    const spots = spotsResponse.data;
    
    if (!spots || spots.length === 0) {
      return [];
    }
    
    const spotIds = spots.map((s: any) => s.id).join(',');
    const forecastResponse = await api.get(`/api/forecast/bulk?spot_ids=${spotIds}`);
    const forecastData = forecastResponse.data;
    const forecasts = forecastData.forecasts || [];
    
    const result = spots.map((spot: any) => {
      const forecast = forecasts.find((f: any) => f.spot_id === spot.id);
      return {
        ...spot,
        forecast: forecast ? {
          score: forecast.score || 0,
          color: forecast.color || 'red',
          swellHeight: forecast.swell_height || 0,
          swellPeriod: forecast.swell_period || 0,
          windSpeed: forecast.wind_speed || 0,
          waterTemp: forecast.water_temp || 0,
          wetsuit: forecast.wetsuit || 'Неизвестно',
          board: forecast.board || 'Неизвестно',
          conditions: forecast.conditions || 'Нет данных',
        } : {
          score: 0,
          color: 'red' as const,
          swellHeight: 0,
          swellPeriod: 0,
          windSpeed: 0,
          waterTemp: 0,
          wetsuit: 'Нет данных',
          board: 'Нет данных',
          conditions: 'Нет данных',
        }
      };
    });
    
    // Сохраняем в кэш
    cache = result;
    cacheTime = now;
    console.log('✅ Cached spots:', result.length);
    return result;
  } catch (error) {
    console.error('Error fetching spots with forecast:', error);
    throw error;
  }
};