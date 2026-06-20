import { useState, useEffect } from 'react';
import { SpotWithForecast } from '../types';
import { getBulkForecast } from '../services/spots';

// Глобальное состояние
let globalState = {
  spotsWithForecast: [] as SpotWithForecast[],
  selectedSpot: null as SpotWithForecast | null,
  loading: false,
};

// Список подписчиков
let listeners: (() => void)[] = [];

// Уведомить всех подписчиков об изменении
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export interface AppState {
  spotsWithForecast: SpotWithForecast[];
  selectedSpot: SpotWithForecast | null;
  loading: boolean;
  setSelectedSpot: (spot: SpotWithForecast | null) => void;
  loadSpots: () => Promise<void>;
}

export const useStore = (): AppState => {
  const [, setState] = useState(0);

  useEffect(() => {
    const listener = () => setState(prev => prev + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return {
    spotsWithForecast: globalState.spotsWithForecast,
    selectedSpot: globalState.selectedSpot,
    loading: globalState.loading,
    setSelectedSpot: (spot: SpotWithForecast | null) => {
      globalState.selectedSpot = spot;
      notifyListeners();
    },
    loadSpots: async () => {
      globalState.loading = true;
      notifyListeners();
      try {
        const forecasts = await getBulkForecast([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        globalState.spotsWithForecast = forecasts;
        globalState.loading = false;
        notifyListeners();
      } catch (error) {
        console.error('Failed to load spots:', error);
        globalState.loading = false;
        notifyListeners();
      }
    }
  };
};