import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/Colors';
import { SpotWithForecast } from '../types';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

interface SpotMarkerProps {
  spot: SpotWithForecast;
}

const SpotMarker: React.FC<SpotMarkerProps> = ({ spot }) => {
  const router = useRouter();
  const { setSelectedSpot } = useStore();

  const getColor = () => {
    switch (spot.forecast.color) {
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

  const handlePress = () => {
    setSelectedSpot(spot);
    router.push(`/spot/${spot.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.marker, { backgroundColor: getColor() }]}
    >
      <Text style={styles.score}>{spot.forecast.score}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SpotMarker;