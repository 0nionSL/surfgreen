import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { SpotWithForecast } from '../types';
import { useRouter } from 'expo-router';
import { useFavoriteStore } from '../store/favoriteStore';
import { useStore } from '../store/useStore';
import { useSettingsStore } from '../store/settingsStore';
import { convertWaveHeight, convertWindSpeed, getWaveUnitSymbol, getWindUnitSymbol, round } from '../utils/units';
import { formatDistance } from '../utils/location';

interface SpotCardProps {
  spot: SpotWithForecast & { distance?: number };
  showFavoriteButton?: boolean;
}

const SpotCard: React.FC<SpotCardProps> = memo(({ 
  spot, 
  showFavoriteButton = true 
}) => {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { setSelectedSpot } = useStore();
  const { waveUnit, windUnit } = useSettingsStore();
  const isFav = isFavorite(spot.id);

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

  const handleFavoritePress = () => {
    toggleFavorite(spot.id);
  };

  const waveHeight = round(convertWaveHeight(spot.forecast.swellHeight, waveUnit));
  const waveUnitSymbol = getWaveUnitSymbol(waveUnit);
  const windSpeed = round(convertWindSpeed(spot.forecast.windSpeed, windUnit));
  const windUnitSymbol = getWindUnitSymbol(windUnit);
  const distanceText = spot.distance ? formatDistance(spot.distance) : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: getColor() }]} />
      
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{spot.name}</Text>
          {distanceText && (
            <Text style={styles.distanceBadge}>📍 {distanceText}</Text>
          )}
        </View>
        <Text style={styles.location}>
          {spot.region}, {spot.country}
        </Text>
        <Text style={styles.details}>
          {waveHeight}{waveUnitSymbol} • {windSpeed} {windUnitSymbol}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <Text style={[styles.score, { color: getColor() }]}>
          {spot.forecast.score}
        </Text>
        
        {showFavoriteButton && (
          <TouchableOpacity 
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFav ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isFav ? colors.dangerZone : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

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
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  distanceBadge: {
    color: colors.textMuted,
    fontSize: 11,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  location: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  details: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
});

export default SpotCard;