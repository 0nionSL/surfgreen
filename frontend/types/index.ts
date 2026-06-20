export interface Spot {
  id: number;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface SurfForecast {
  score: number;
  color: 'green' | 'yellow' | 'red';
  swellHeight: number;
  swellPeriod: number;
  windSpeed: number;
  waterTemp: number;
  wetsuit: string;
  board: string;
  conditions: string;
}

export interface SpotWithForecast extends Spot {
  forecast: SurfForecast;
}