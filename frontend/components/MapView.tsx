import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapViewLib, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import { SpotWithForecast } from '../types';
import { colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { UserLocation } from '../utils/location';

interface MapViewProps {
  spots: SpotWithForecast[];
  userLocation?: UserLocation | null;
  showRadius?: boolean;
  radiusKm?: number;
}

const MapView = forwardRef<MapViewLib, MapViewProps>(({ 
  spots, 
  userLocation,
  showRadius = false,
  radiusKm = 50,
}, ref) => {
  const router = useRouter();
  const { setSelectedSpot } = useStore();

  const getColor = (color: string) => {
    switch (color) {
      case 'green':
        return colors.success;
      case 'yellow':
        return colors.warning;
      case 'red':
        return colors.dangerZone;
      default:
        return colors.textMuted;
    }
  };

  const handleMarkerPress = (spot: SpotWithForecast) => {
    setSelectedSpot(spot);
    router.push(`/spot/${spot.id}`);
  };

  console.log('🗺️ MapView rendering with spots:', spots?.length || 0);

  // Начальный регион — Бали или позиция пользователя
  const initialRegion = userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  } : {
    latitude: -8.5,
    longitude: 115.0,
    latitudeDelta: 1.0,
    longitudeDelta: 1.0,
  };

  return (
    <MapViewLib
      ref={ref}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      customMapStyle={[
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'water', stylers: [{ color: '#0B132B' }] },
        { elementType: 'landscape', stylers: [{ color: '#16213e' }] },
        { elementType: 'road', stylers: [{ color: '#2a2a3e' }] },
        { elementType: 'poi', stylers: [{ visibility: 'off' }] },
        { elementType: 'transit', stylers: [{ visibility: 'off' }] },
      ]}
    >
      {/* Круг радиуса вокруг пользователя */}
      {userLocation && showRadius && (
        <Circle
          center={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          radius={radiusKm * 1000}
          strokeColor={colors.primary}
          fillColor="rgba(0, 240, 255, 0.05)"
          strokeWidth={2}
        />
      )}

      {spots && spots.map((spot) => (
        <Marker
          key={`marker-${spot.id}`}
          coordinate={{
            latitude: spot.latitude || -8.5,
            longitude: spot.longitude || 115.0,
          }}
          title={spot.name}
          description={`Score: ${spot.forecast.score}`}
          pinColor={getColor(spot.forecast.color)}
          onPress={() => handleMarkerPress(spot)}
        />
      ))}
    </MapViewLib>
  );
});

export default MapView;