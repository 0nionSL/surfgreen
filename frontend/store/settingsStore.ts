import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type WaveUnit = 'meters' | 'feet';
export type WindUnit = 'knots' | 'kmh';
export type Language = 'ru' | 'en';

interface SettingsState {
  // Профиль
  skillLevel: SkillLevel;
  personalizedSpots: boolean;
  
  // Единицы
  waveUnit: WaveUnit;
  windUnit: WindUnit;
  
  // Уведомления
  notifications: boolean;
  bestTimeAlerts: boolean;
  
  // Режим
  offlineMode: boolean;
  language: Language;
  
  // Радиус
  spotRadius: number;
  useRadiusFilter: boolean; // 👈 НОВОЕ
  
  // Локация
  selectedCountry: string | null;
  selectedRegion: string | null;
  
  // Сеттеры
  setSkillLevel: (level: SkillLevel) => void;
  setPersonalizedSpots: (enabled: boolean) => void;
  setWaveUnit: (unit: WaveUnit) => void;
  setWindUnit: (unit: WindUnit) => void;
  setNotifications: (enabled: boolean) => void;
  setBestTimeAlerts: (enabled: boolean) => void;
  setOfflineMode: (enabled: boolean) => void;
  setLanguage: (lang: Language) => void;
  setSpotRadius: (radius: number) => void;
  setUseRadiusFilter: (enabled: boolean) => void; // 👈 НОВОЕ
  setSelectedCountry: (country: string | null) => void;
  setSelectedRegion: (region: string | null) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  skillLevel: 'intermediate' as SkillLevel,
  personalizedSpots: true,
  waveUnit: 'meters' as WaveUnit,
  windUnit: 'knots' as WindUnit,
  notifications: true,
  bestTimeAlerts: true,
  offlineMode: false,
  language: 'ru' as Language,
  spotRadius: 50,
  useRadiusFilter: true, // 👈 ПО УМОЛЧАНИЮ ВКЛЮЧЕН
  selectedCountry: null,
  selectedRegion: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setSkillLevel: (level: SkillLevel) => set({ skillLevel: level }),
      setPersonalizedSpots: (enabled: boolean) => set({ personalizedSpots: enabled }),
      setWaveUnit: (unit: WaveUnit) => set({ waveUnit: unit }),
      setWindUnit: (unit: WindUnit) => set({ windUnit: unit }),
      setNotifications: (enabled: boolean) => set({ notifications: enabled }),
      setBestTimeAlerts: (enabled: boolean) => set({ bestTimeAlerts: enabled }),
      setOfflineMode: (enabled: boolean) => set({ offlineMode: enabled }),
      setLanguage: (lang: Language) => set({ language: lang }),
      setSpotRadius: (radius: number) => set({ spotRadius: radius }),
      setUseRadiusFilter: (enabled: boolean) => set({ useRadiusFilter: enabled }),
      setSelectedCountry: (country: string | null) => set({ selectedCountry: country }),
      setSelectedRegion: (region: string | null) => set({ selectedRegion: region }),
      
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'surfgreen-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);