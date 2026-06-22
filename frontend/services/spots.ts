import { api } from './api';
import { SpotWithForecast } from '../types';

// Кэш полностью отключён — всегда свежие данные
export const fetchSpotsWithForecast = async (): Promise<SpotWithForecast[]> => {
  try {
    console.log('🔄 Fetching fresh data (cache disabled)...');
    
    // 1. Получаем споты
    const spotsResponse = await api.get('/api/spots');
    const spots = spotsResponse.data;
    console.log('📊 Spots received:', spots.length);
    
    if (!spots || spots.length === 0) {
      return [];
    }
    
    // 2. Получаем прогнозы
    const spotIds = spots.map((s: any) => s.id).join(',');
    const forecastResponse = await api.get(`/api/forecast/bulk?spot_ids=${spotIds}`);
    const forecastData = forecastResponse.data;
    const forecasts = forecastData.forecasts || [];
    console.log('📊 Forecasts received:', forecasts.length);
    
    // 3. Объединяем споты с прогнозами
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
    
    console.log('✅ Transformed spots:', result.length);
    return result;
    
  } catch (error: any) {
    console.error('❌ Error fetching spots:', error.message);
    console.error('❌ Error details:', error.response?.data || error);
    throw error;
  }
};