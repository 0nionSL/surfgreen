import { api } from './api';
import { SpotWithForecast } from '../types';

export const getBulkForecast = async (spotIds: number[]): Promise<SpotWithForecast[]> => {
  try {
    console.log('🔄 Fetching forecasts for ids:', spotIds);
    
    // Получаем все споты
    const spotsResponse = await api.get('/api/spots');
    const allSpots = spotsResponse.data;
    console.log('📊 All spots:', allSpots.length);
    
    // Для каждого спота получаем прогноз
    const forecastPromises = spotIds.map(async (id) => {
      try {
        const forecastResponse = await api.get(`/api/spots/${id}/forecast`);
        return forecastResponse.data;
      } catch (err) {
        console.error(`❌ Failed to get forecast for spot ${id}:`, err);
        return null;
      }
    });
    
    const forecasts = await Promise.all(forecastPromises);
    console.log('📊 Forecasts received:', forecasts.filter(f => f !== null).length);
    
    // Объединяем данные
    const spots: SpotWithForecast[] = allSpots
      .filter((spot: any) => spotIds.includes(spot.id))
      .map((spot: any) => {
        const forecast = forecasts.find((f: any) => f?.spot_id === spot.id);
        return {
          id: spot.id,
          name: spot.name,
          country: spot.country || 'Indonesia',
          region: spot.region || 'Bali',
          latitude: spot.latitude,
          longitude: spot.longitude,
          forecast: forecast ? {
            score: forecast.score || 0,
            color: forecast.color || 'red',
            swellHeight: forecast.swell_height || 0,
            swellPeriod: forecast.swell_period || 0,
            windSpeed: forecast.wind_speed || 0,
            waterTemp: forecast.water_temp || 0,
            wetsuit: forecast.wetsuit || 'Неизвестно',
            board: forecast.board || 'Неизвестно',
            conditions: 'Нет данных',
          } : {
            score: 0,
            color: 'red',
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
    
    console.log('✅ Transformed spots:', spots.length);
    return spots;
  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};