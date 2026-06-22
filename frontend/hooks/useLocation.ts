// hooks/useLocation.ts
import { useState, useEffect } from 'react';
import { getUserLocation, UserLocation } from '../utils/location';

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loc = await getUserLocation();
      if (loc) {
        setLocation(loc);
      } else {
        setError('Не удалось определить местоположение');
      }
    } catch (err) {
      setError('Ошибка при определении местоположения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, loading, error, refetch: fetchLocation };
};