// utils/spotFilter.ts
import { SpotWithForecast } from '../types';
import { SkillLevel } from '../store/settingsStore';
import { filterSpotsByRadius, UserLocation } from './location';

export const filterSpotsByLevel = (
  spots: SpotWithForecast[],
  level: SkillLevel,
  personalized: boolean
): SpotWithForecast[] => {
  if (!personalized) return spots;

  switch (level) {
    case 'beginner':
      return spots.filter(s => s.forecast.score >= 40);
    case 'intermediate':
      return spots.filter(s => s.forecast.score >= 30);
    case 'advanced':
      return spots;
    default:
      return spots;
  }
};

export const filterSpotsByLocation = (
  spots: SpotWithForecast[],
  selectedCountry: string | null,
  selectedRegion: string | null
): SpotWithForecast[] => {
  let result = spots;

  if (selectedCountry) {
    result = result.filter(s => s.country === selectedCountry);
  }

  if (selectedRegion && selectedCountry) {
    result = result.filter(s => s.region === selectedRegion);
  }

  return result;
};

export const filterSpots = (
  spots: SpotWithForecast[],
  level: SkillLevel,
  personalized: boolean,
  userLocation: UserLocation | null,
  radiusKm: number,
  selectedCountry: string | null,
  selectedRegion: string | null,
  useRadiusFilter: boolean // 👈 НОВЫЙ ПАРАМЕТР
): SpotWithForecast[] => {
  let result = spots;
  
  // 1. Фильтр по уровню
  result = filterSpotsByLevel(result, level, personalized);
  
  // 2. Фильтр по локации (страна + регион)
  result = filterSpotsByLocation(result, selectedCountry, selectedRegion);
  
  // 3. Фильтр по радиусу (ТОЛЬКО если включен и есть геолокация)
  if (userLocation && useRadiusFilter) {
    result = filterSpotsByRadius(result, userLocation, radiusKm);
  }
  
  return result;
};

export const getUniqueCountries = (spots: SpotWithForecast[]): string[] => {
  const countries = spots.map(s => s.country).filter(Boolean);
  return [...new Set(countries)].sort();
};

export const getUniqueRegions = (spots: SpotWithForecast[], country: string | null): string[] => {
  if (!country) return [];
  const regions = spots.filter(s => s.country === country).map(s => s.region).filter(Boolean);
  return [...new Set(regions)].sort();
};

export const getLevelLabel = (level: SkillLevel): string => {
  switch (level) {
    case 'beginner': return 'Начинающий';
    case 'intermediate': return 'Средний';
    case 'advanced': return 'Продвинутый';
    default: return 'Средний';
  }
};

export const getLevelEmoji = (level: SkillLevel): string => {
  switch (level) {
    case 'beginner': return '🏄‍♂️';
    case 'intermediate': return '🏄‍♂️🌊';
    case 'advanced': return '🏄‍♂️🔥';
    default: return '🏄‍♂️';
  }
};