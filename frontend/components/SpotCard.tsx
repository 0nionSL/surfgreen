import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { Spot } from '../types';
import { useRouter } from 'expo-router';
import { useFavoriteStore } from '../store/favoriteStore';
import { useStore } from '../store/useStore';

interface SpotCardProps {
  spot: Spot;
  showFavoriteButton?: boolean;
}

const SpotCard: React.FC<SpotCardProps> = memo(({ 
  spot, 
  showFavoriteButton = true 
}) => {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { setSelectedSpot } = useStore();
  const isFav = isFavorite(spot.id);

  const hasForecast = spot.forecast !== undefined && spot.forecast !== null;

  const getColor = () => {
    if (!hasForecast) return colors.textMuted;
    switch (spot.forecast?.color) {
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
    setSelectedSpot(spot as any);
    router.push(`/spot/${spot.id}`);
  };

  const handleFavoritePress = () => {
    toggleFavorite(spot.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: getColor() }]} />
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{spot.name}</Text>
        <Text style={styles.location}>
          {spot.region}, {spot.country}
        </Text>
        {hasForecast && (
          <Text style={styles.details}>
            {spot.forecast?.swellHeight}m • {spot.forecast?.windSpeed} kn
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {hasForecast && (
          <Text style={[styles.score, { color: getColor() }]}>
            {spot.forecast?.score}
          </Text>
        )}
        
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
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
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