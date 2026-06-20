import React from 'react';
import { StyleSheet } from 'react-native';
import MapViewLib, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { SpotWithForecast } from '../types';
import { colors } from '../constants/Colors';

interface MapViewProps {
  spots: SpotWithForecast[];
}

const MapView: React.FC<MapViewProps> = ({ spots }) => {
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

  console.log('🗺️ MapView rendering with spots:', spots?.length || 0);

  return (
    <MapViewLib
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: -8.5,
        longitude: 115.0,
        latitudeDelta: 1.0,
        longitudeDelta: 1.0,
      }}
      customMapStyle={[
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'water', stylers: [{ color: '#0B132B' }] },
        { elementType: 'landscape', stylers: [{ color: '#16213e' }] },
        { elementType: 'road', stylers: [{ color: '#2a2a3e' }] },
        { elementType: 'poi', stylers: [{ visibility: 'off' }] },
        { elementType: 'transit', stylers: [{ visibility: 'off' }] },
      ]}
    >
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
        />
      ))}
    </MapViewLib>
  );
};

export default MapView;