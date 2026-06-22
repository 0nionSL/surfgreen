// utils/location.ts
import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Запросить разрешение и получить текущую геолокацию
 */
export const getUserLocation = async (): Promise<UserLocation | null> => {
  try {
    // Запрашиваем разрешение
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('❌ Location permission denied');
      return null;
    }
    
    // Получаем позицию
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('❌ Failed to get location:', error);
    return null;
  }
};

/**
 * Рассчитать расстояние между двумя точками (в километрах)
 * Используется формула гаверсинусов
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Фильтрация спотов по радиусу от пользователя
 */
export const filterSpotsByRadius = <T extends { latitude: number; longitude: number }>(
  spots: T[],
  userLocation: UserLocation | null,
  radiusKm: number
): T[] => {
  if (!userLocation) return spots;
  
  return spots.filter((spot) => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      spot.latitude,
      spot.longitude
    );
    return distance <= radiusKm;
  });
};

/**
 * Добавить расстояние до спота
 */
export const addDistanceToSpot = <T extends { latitude: number; longitude: number }>(
  spot: T,
  userLocation: UserLocation | null
): T & { distance?: number } => {
  if (!userLocation) return spot;
  
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    spot.latitude,
    spot.longitude
  );
  
  return { ...spot, distance };
};

/**
 * Отформатировать расстояние (в км или м)
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} м`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} км`;
  }
  return `${Math.round(distanceKm)} км`;
};