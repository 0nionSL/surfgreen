// utils/units.ts
import { WaveUnit, WindUnit } from '../store/settingsStore';

/**
 * Конвертация высоты волны из метров в выбранную единицу
 */
export const convertWaveHeight = (meters: number, unit: WaveUnit): number => {
  if (unit === 'feet') {
    return meters * 3.28084;
  }
  return meters;
};

/**
 * Получить символ единицы высоты волны
 */
export const getWaveUnitSymbol = (unit: WaveUnit): string => {
  return unit === 'feet' ? 'ft' : 'м';
};

/**
 * Конвертация скорости ветра из узлов в выбранную единицу
 */
export const convertWindSpeed = (knots: number, unit: WindUnit): number => {
  if (unit === 'kmh') {
    return knots * 1.852;
  }
  return knots;
};

/**
 * Получить символ единицы скорости ветра
 */
export const getWindUnitSymbol = (unit: WindUnit): string => {
  return unit === 'kmh' ? 'км/ч' : 'уз';
};

/**
 * Округление до 1 знака после запятой
 */
export const round = (value: number): number => {
  return Math.round(value * 10) / 10;
};