import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/Colors';
import { SpotWithForecast } from '../types';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

interface SpotCardProps {
  spot: SpotWithForecast;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot }) => {
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
      style={styles.container}
    >
      <View style={[styles.indicator, { backgroundColor: getColor() }]} />
      <View style={styles.info}>
        <Text style={styles.name}>{spot.name}</Text>
        <Text style={styles.details}>
          {spot.forecast.swellHeight}m • {spot.forecast.windSpeed} kn
        </Text>
      </View>
      <Text style={[styles.score, { color: getColor() }]}>
        {spot.forecast.score}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: 4,
  },
  indicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    color: colors.textMuted,
    fontSize: 14,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SpotCard;